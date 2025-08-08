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
import ImageGallery from "@/components/ImageGallery";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { getAmenityIcon } from "@/utils/amenityIcons";

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
}

interface Profile {
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  is_host: boolean;
}

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [host, setHost] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailableSet, setUnavailableSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      fetchProperty();
      fetchAvailability();
    }
  }, [id]);

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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Chargement...</div>
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
                    <h1 className="text-3xl font-semibold mb-4">{property.title}</h1>
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="font-medium">4,5</span>
                                <span className="text-muted-foreground">• 12 commentaires</span>
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
                                <ImageGallery images={property.images} title={property.title} />
                            </div>
                        )}

                        {/* En-tête avec informations de l'hôte */}
                        <div className="pb-8 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold mb-2">
                                        {property.property_type} entier hébergé par {host?.first_name || 'Hôte'}
                                    </h2>
                                    <div className="flex items-center gap-2 text-muted-foreground">
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
                        {property.amenities && property.amenities.length > 0 && (
                            <div className="py-8 border-b">
                                <h3 className="text-xl font-semibold mb-6">Ce que propose ce logement</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {property.amenities.slice(0, 10).map((amenity) => {
                                        const Icon = getAmenityIcon(amenity);
                                        return (
                                            <div key={amenity} className="flex items-center gap-4 py-2">
                                                <Icon className="h-6 w-6 text-muted-foreground" />
                                                <span>{amenity}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {property.amenities.length > 10 && (
                                    <Button variant="outline" className="mt-6">
                                        Afficher les {property.amenities.length} équipements
                                    </Button>
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
                        <div className="sticky top-24">
                            <Card className="shadow-xl border rounded-xl">
                                <CardContent className="p-6">
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-2xl font-semibold">{property.price_per_night.toLocaleString()} FCFA</span>
                                        <span className="text-muted-foreground"> par nuit</span>
                                    </div>
                                    <BookingForm
                                        propertyId={property.id}
                                        pricePerNight={Number(property.price_per_night)}
                                        maxGuests={property.max_guests}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Section Avis */}
                <div className="mb-12 pb-8 border-b">
                    <div className="flex items-center gap-2 mb-8">
                        <Star className="h-6 w-6 text-yellow-400 fill-current" />
                        <span className="text-2xl font-semibold">4,5 • 12 commentaires</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Placeholder pour les avis */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-muted rounded-full"></div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">Marie</span>
                                        <span className="text-muted-foreground text-sm">Décembre 2024</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Excellent séjour ! Le logement était parfait et l'hôte très accueillant.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-muted rounded-full"></div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">Thomas</span>
                                        <span className="text-muted-foreground text-sm">Novembre 2024</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Logement très propre et bien situé. Je recommande vivement !
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button variant="outline" className="mt-8">
                        Afficher tous les commentaires
                    </Button>
                </div>

                {/* Section Localisation */}
                <div className="mb-12 pb-8 border-b">
                    <h3 className="text-2xl font-semibold mb-6">Où vous dormirez</h3>
                    <div className="bg-muted/30 rounded-lg h-96 flex items-center justify-center">
                        <p className="text-muted-foreground">Carte de localisation</p>
                    </div>
                    <div className="mt-4">
                        <p className="font-medium">{property.city}</p>
                        <p className="text-muted-foreground text-sm">{property.address}</p>
                    </div>
                </div>

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
                                    <span>4,5 (12 commentaires)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Badge className="h-4 w-4" />
                                    <span>Identité vérifiée</span>
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
        </div>
    );
};

export default PropertyDetail;