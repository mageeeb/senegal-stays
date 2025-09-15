import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import {
    ArrowLeft, Star, MapPin, Users, Bed, Bath, Wifi, Car, Waves,
    UtensilsCrossed, Snowflake, Tv, Shirt, HomeIcon, Coffee
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BookingForm } from "@/components/BookingForm";
import Gallery from "@/components/Gallery";
import InteractiveMap from "@/components/MapCluster";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { getAmenityIcon, normalizeAmenities } from "@/utils/amenityIcons";
import CommentsSection from "@/components/CommentsSection";
import { useReviewsSummary } from "@/hooks/useReviewsSummary";
import { useAuth } from "@/hooks/useAuth";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import MetaBar from "@/components/MetaBar";
import VirtualTour from "@/components/VirtualTour";

interface PropertyImage {
  id: string;
  image_url: string;
  is_cover: boolean;
  alt_text: string | null;
  sort_order: number;
}

interface Property {
  id: string;
  title: string;
  description: string;
  price_per_night: number;
  address: string;
  city: string;
  property_type: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  is_active: boolean;
  created_at: string;
  images?: PropertyImage[];
  host_id: string;
  latitude?: number | null;
  longitude?: number | null;
  validation_status?: string | null;
  // long-term
  long_term_enabled?: boolean;
  monthly_price?: number | null;
  min_months?: number | null;
  max_months?: number | null;
  deposit_amount?: number | null;
  utilities_included?: boolean | null;
  utilities_notes?: string | null;
  notice_period_days?: number | null;
  furnished?: boolean | null;
  available_from?: string | null;
}

interface Profile {
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  is_host: boolean;
}

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const { data: summary, loading: summaryLoading } = useReviewsSummary(id);
  const [host, setHost] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailableSet, setUnavailableSet] = useState<Set<string>>(new Set());
  const [reviewPromptLoading, setReviewPromptLoading] = useState<boolean>(false);
  const [lastStayDate, setLastStayDate] = useState<string | null>(null);
  const [amenitiesExpanded, setAmenitiesExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      fetchProperty();
      fetchAvailability();
    }
  }, [id]);

  // Écouter les mises à jour en temps réel du statut de validation
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel('property-validation-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'properties',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('Mise à jour en temps réel reçue:', payload);
          // Mettre à jour seulement le statut de validation
          if (payload.new && property) {
            setProperty(prev => prev ? {
              ...prev,
              validation_status: payload.new.validation_status,
              validated_at: payload.new.validated_at,
              validated_by: payload.new.validated_by,
              rejection_reason: payload.new.rejection_reason
            } : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, property?.id]);

  // Rafraîchir les données quand la page devient visible (retour depuis admin)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && id) {
        fetchProperty();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [id]);

  useEffect(() => {
    const fetchLastCompletedStay = async () => {
      if (!id || !user) {
        setLastStayDate(null);
        return;
      }
      try {
        setReviewPromptLoading(true);
        const { data, error } = await supabase
          .from('bookings')
          .select('id, check_in, check_out')
          .eq('property_id', id)
          .eq('guest_id', user.id)
          .eq('status', 'completed')
          .order('check_out', { ascending: false })
          .limit(1);
        if (error) {
          console.error('Erreur lors de la vérification du séjour terminé:', error);
          setLastStayDate(null);
          return;
        }
        if (data && data.length > 0) {
          const booking = data[0] as { check_in: string | null; check_out: string | null };
          const dateStr = booking.check_out || booking.check_in;
          if (dateStr) {
            const d = new Date(dateStr);
            const formatted = format(d, 'dd/MM/yyyy');
            setLastStayDate(formatted);
          } else {
            setLastStayDate(null);
          }
        } else {
          setLastStayDate(null);
        }
      } catch (e) {
        // silent failure
        setLastStayDate(null);
      } finally {
        setReviewPromptLoading(false);
      }
    };

    fetchLastCompletedStay();
  }, [id, user]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      
      // Récupérer la propriété avec ses images
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (
            id,
            image_url,
            is_cover,
            alt_text,
            sort_order
          )
        `)
        .eq('id', id)
        .single();

      if (propertyError) {
        console.error('Erreur lors du chargement de la propriété:', propertyError);
        return;
      }

      // Trier les images par sort_order
      const propertyWithSortedImages = {
        ...propertyData,
        images: propertyData.property_images?.sort((a: PropertyImage, b: PropertyImage) => a.sort_order - b.sort_order) || []
      };

      setProperty(propertyWithSortedImages);

      // Récupérer les informations de l'hôte
      const { data: hostData, error: hostError } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url, is_host')
        .eq('user_id', propertyData.host_id)
        .single();

      if (!hostError && hostData) {
        setHost(hostData);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('property_availability')
      .select('date, is_available')
      .eq('property_id', id)
      .eq('is_available', false);
    if (!error && data) {
      const set = new Set<string>(data.map((d: { date: string }) => d.date));
      setUnavailableSet(set);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-56 w-full bg-muted animate-pulse rounded-lg" />
              <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-3 w-full bg-muted animate-pulse rounded" />
                <div className="h-3 w-5/6 bg-muted animate-pulse rounded" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-6 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <div className="p-6 border rounded-xl shadow">
                  <div className="h-6 w-1/2 bg-muted animate-pulse rounded mb-4" />
                  <div className="h-10 w-full bg-muted animate-pulse rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Logement non trouvé</h1>
            <Button asChild>
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Navigation */}
                <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-foreground" asChild>
                    <Link to="/">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                    </Link>
                </Button>

                {/* Titre principal et informations */}
                <div className="mb-8">
                    {/* Mobile MetaBar */}
                    <h1 className="text-2xl md:text-3xl font-semibold mb-2">{property.title}</h1>
                    <MetaBar
                      className="md:hidden mb-4"
                      ratingText={summaryLoading ? '…' : (summary?.avg != null ? Number(summary.avg).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—')}
                      commentsCount={summary?.count ?? 0}
                      address={property.address}
                      city={property.city}
                      maxGuests={property.max_guests}
                      bedrooms={property.bedrooms}
                      bathrooms={property.bathrooms}
                      onCommentsClick={() => {
                        const el = document.getElementById('reviews-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      onLocationClick={() => {
                        const el = document.getElementById('location-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    />
                    {/* Desktop/Tablet meta row (hidden on mobile) */}
                    <div className="hidden md:flex items-center justify-between flex-wrap gap-4 mb-6">
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="font-medium">{summaryLoading ? '…' : (summary?.avg != null ? Number(summary.avg).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—')}</span>
                                <span className="text-muted-foreground">• {(summary?.count ?? 0)} commentaire{(summary?.count ?? 0) >= 2 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span className="underline cursor-pointer hover:text-foreground">
                                    {property.address}, {property.city}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="text-sm underline">
                                Partager
                            </Button>
                            <Button variant="ghost" size="sm" className="text-sm underline">
                                Sauvegarder
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Nouvelle disposition en grid avec la galerie dans la première colonne */}
                <div className="grid lg:grid-cols-12 gap-8 mb-12">
                    {/* Colonne principale - Galerie et Informations détaillées */}
                    <div className="lg:col-span-8">
                        {/* Galerie d'images */}
                        {property.images && property.images.length > 0 && (
                            <div className="mb-8">
                                <Gallery images={property.images} variant="detail" loop={true} enableZoom={true} showDots={true} showCounter={true} showArrows={true} />
                            </div>
                        )}

                        {/* En-tête avec informations de l'hôte */}
                        <div className="pb-8 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold mb-2">
                                        {property.property_type} entier hébergé par {host?.first_name || 'Hôte'}
                                    </h2>
                                    <div className="hidden md:flex items-center gap-2 text-muted-foreground">
                                        <span>{property.max_guests} voyageurs</span>
                                        <span>•</span>
                                        <span>{property.bedrooms} chambres</span>
                                        <span>•</span>
                                        <span>{property.bathrooms} salles de bain</span>
                                    </div>
                                </div>
                                {host?.avatar_url && (
                                    <img
                                        src={host.avatar_url}
                                        alt={`${host.first_name} ${host.last_name}`}
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Points forts du logement */}
                        <div className="py-8 border-b">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Idéal pour les familles</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Ce logement peut accueillir {property.max_guests} voyageurs.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        <Bed className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Logement entier</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Vous aurez accès à l'ensemble du logement.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        <Star className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Bien noté</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Les voyageurs récents ont donné une excellente note à ce logement.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="py-8 border-b">
                            <div className="space-y-4">
                                <p className="text-foreground leading-relaxed">
                                    {property.description}
                                </p>
                                <Button variant="ghost" className="text-primary underline p-0 h-auto">
                                    Voir plus
                                </Button>
                            </div>
                        </div>

                        {/* Équipements */}
                        {property.amenities && property.amenities.length > 0 && (() => {
                            const normalized = normalizeAmenities(property.amenities);
                            const listToRender = amenitiesExpanded ? normalized : normalized.slice(0, 10);
                            return (
                            <div className="py-8 border-b">
                                <h3 className="text-xl font-semibold mb-6">Ce que propose ce logement</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {listToRender.map((amenity) => {
                                        const Icon = getAmenityIcon(amenity);
                                        return (
                                            <div key={amenity} className="flex items-center gap-4 py-2">
                                                <Icon className="h-6 w-6 text-muted-foreground" />
                                                <span>{amenity}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {normalized.length > 10 && (
                                    <Button
                                      variant="outline"
                                      className="mt-6"
                                      onClick={() => setAmenitiesExpanded((v) => !v)}
                                      aria-expanded={amenitiesExpanded}
                                    >
                                        {amenitiesExpanded ? "Réduire" : `Afficher les ${normalized.length} équipements`}
                                    </Button>
                                )}
                            </div>
                            );
                        })()}

                        {/* Conditions longues durées */}
                        {property.long_term_enabled && (
                          <div className="py-8 border-b">
                            <h3 className="text-xl font-semibold mb-4">Conditions longues durées</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Prix mensuel</div>
                                <div className="font-semibold tabular-nums">{Number(property.monthly_price || 0).toLocaleString()} FCFA</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Durée min/max</div>
                                <div className="font-semibold">{property.min_months || 1}–{property.max_months || 12} mois</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Dépôt</div>
                                <div className="font-semibold tabular-nums">{Number(property.deposit_amount || 0).toLocaleString()} FCFA</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Charges</div>
                                <div className="font-semibold">{property.utilities_included ? 'Incluses' : 'Non incluses'}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Meublé</div>
                                <div className="font-semibold">{property.furnished ? 'Oui' : 'Non'}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Préavis</div>
                                <div className="font-semibold">{property.notice_period_days || 30} jours</div>
                              </div>
                              {property.available_from && (
                                <div>
                                  <div className="text-muted-foreground">Disponible à partir du</div>
                                  <div className="font-semibold">{property.available_from}</div>
                                </div>
                              )}
                            </div>
                            {property.utilities_notes && (
                              <div className="text-xs text-muted-foreground mt-3">{property.utilities_notes}</div>
                            )}
                          </div>
                        )}

                        {/* Calendrier placeholder */}
                        <div className="py-8 border-b">
                            <h3 className="text-xl font-semibold mb-6">Sélectionnez les dates d'arrivée et de départ</h3>
                            <div className="rounded-lg">
                                <Calendar
                                  mode="single"
                                  numberOfMonths={2}
                                  disabled={(date) => date < new Date() || unavailableSet.has(format(date, 'yyyy-MM-dd'))}
                                  className="p-3 pointer-events-auto"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Colonne droite - Réservation */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24" id="booking-card">
                            <Card className="shadow-xl border rounded-xl">
                                <CardContent className="p-6">
                                    <div className="flex items-baseline gap-1 mb-6">
                                        {property.long_term_enabled ? (
                                          <>
                                            <span className="text-2xl font-semibold tabular-nums">{Number(property.monthly_price || 0).toLocaleString()} FCFA</span>
                                            <span className="text-muted-foreground"> par mois</span>
                                          </>
                                        ) : (
                                          <>
                                            <span className="text-2xl font-semibold tabular-nums">{Number(property.price_per_night).toLocaleString()} FCFA</span>
                                            <span className="text-muted-foreground"> par nuit</span>
                                          </>
                                        )}
                                    </div>
                                    <BookingForm
                                        propertyId={property.id}
                                        pricePerNight={Number(property.price_per_night)}
                                        maxGuests={property.max_guests}
                                        longTermEnabled={!!property.long_term_enabled}
                                        minMonths={property.min_months || 1}
                                        maxMonths={property.max_months || 12}
                                        monthlyPrice={property.monthly_price || 0}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Section Avis - Prompt d'avis si éligible */}
                {(!reviewPromptLoading && lastStayDate) ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mb-4 p-4 border border-green-300 bg-green-50 text-green-900 rounded-lg flex items-center justify-between"
                  >
                    <span>Vous avez séjourné ici le {lastStayDate} — laissez un avis.</span>
                    <Button
                      onClick={() => {
                        const el = document.getElementById('reviews-section');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      aria-label="Aller à la section des avis pour laisser un commentaire"
                    >
                      Laisser un avis
                    </Button>
                  </div>
                ) : null}

                {/* Section Avis */}
                <CommentsSection propertyId={property.id} />

                {/* Section Localisation */}
                <div className="mb-12 pb-8 border-b" id="location-section">
                    <h3 className="text-2xl font-semibold mb-6">Où vous dormirez</h3>
                    <div className="h-96 rounded-lg overflow-hidden">
                        <InteractiveMap
                          className="h-full w-full"
                          properties={[{
                            id: property.id,
                            title: property.title,
                            latitude: property.latitude ?? null,
                            longitude: property.longitude ?? null,
                            price_per_night: Number(property.price_per_night),
                            image_url: property.images && property.images[0] ? property.images[0].image_url : null,
                          }]}
                        />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                        {!property.latitude || !property.longitude ? "Localisation approximative: ajoutez un point précis lors de l'édition pour afficher le marqueur exact." : null}
                    </div>
                </div>

                {/* Section Visite Guidée */}
                <VirtualTour 
                  propertyTitle={property.title}
                  matterportUrl={undefined} // À configurer avec l'URL Matterport spécifique au logement
                />

                {/* Section Hôte */}
                <div className="mb-12">
                    <div className="flex items-start gap-6">
                        {host?.avatar_url && (
                            <img
                                src={host.avatar_url}
                                alt={`${host.first_name} ${host.last_name}`}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        )}
                        <div className="flex-1">
                            <h3 className="text-2xl font-semibold mb-2">
                                Hôte : {host?.first_name} {host?.last_name}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-4">Hôte depuis 2024</p>
                            <div className="flex items-center gap-6 mb-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4" />
                                    <span>
                                        {summaryLoading ? '…' : (summary?.avg != null ? Number(summary.avg).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—')}
                                        {summary?.count ? ` (${summary.count} commentaire${summary.count >= 2 ? 's' : ''})` : ' (0 commentaire)'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <VerifiedBadge 
                                        status={property.validation_status === "approved" ? "verified" : "pending"} 
                                        size="sm" 
                                        labelPending="En cours de vérification"
                                        labelVerified="Identité vérifiée"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="outline">Contacter l'hôte</Button>
                                <Button variant="ghost" className="text-muted-foreground">
                                    Signaler ce profil
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky mobile booking bar */}
            <div className="lg:hidden fixed inset-x-0 bottom-16 z-40 border rounded-t-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}>
              <div className="mx-auto max-w-screen-md px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-baseline gap-1">
                  {property.long_term_enabled ? (
                    <>
                      <span className="text-xl font-semibold tabular-nums">{Number(property.monthly_price || 0).toLocaleString()} FCFA</span>
                      <span className="text-muted-foreground">/mois</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-semibold tabular-nums">{Number(property.price_per_night).toLocaleString()} FCFA</span>
                      <span className="text-muted-foreground">/nuit</span>
                    </>
                  )}
                </div>
                <Button
                  size="lg"
                  className="min-w-[140px]"
                  onClick={() => {
                    const el = document.getElementById('booking-card');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  aria-label="Aller au formulaire de réservation"
                >
                  Réserver
                </Button>
              </div>
            </div>
        </div>
    );
};

export default PropertyDetail;