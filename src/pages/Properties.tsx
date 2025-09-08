import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { normalizeAmenities } from "@/utils/amenityIcons";

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
}

const Properties = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if this is the public properties page or private my-properties page
  const isMyProperties = window.location.pathname === '/my-properties';

  useEffect(() => {
    fetchProperties();
  }, [user, isMyProperties]);

  const fetchProperties = async () => {
    try {
      let query = supabase
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
        `);

      if (isMyProperties && user) {
        // For /my-properties: show user's own properties
        query = query.eq('host_id', user.id);
      } else {
        // For /properties: show all active properties
        query = query.eq('is_active', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Trier les images par sort_order pour chaque propriété
      const propertiesWithSortedImages = data?.map(property => {
        const { property_images, ...propertyData } = property;
        return {
          ...propertyData,
          images: property_images?.sort((a: PropertyImage, b: PropertyImage) => a.sort_order - b.sort_order) || []
        };
      }) || [];

      console.log('Properties with images:', propertiesWithSortedImages);
      setProperties(propertiesWithSortedImages);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les logements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(prev => prev.filter(property => property.id !== propertyId));

      toast({
        title: "Succès",
        description: "Logement supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le logement",
        variant: "destructive",
      });
    }
  };

  const togglePropertyStatus = async (propertyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: !currentStatus })
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(prev => 
        prev.map(property => 
          property.id === propertyId 
            ? { ...property, is_active: !currentStatus }
            : property
        )
      );

      toast({
        title: "Succès",
        description: `Logement ${!currentStatus ? 'activé' : 'désactivé'}`,
      });
    } catch (error) {
      console.error('Error updating property status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du logement",
        variant: "destructive",
      });
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-0 sm:px-4 py-8 pb-28 sm:pb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {isMyProperties ? "Mes logements" : "Logements disponibles"}
            </h1>
            <p className="text-muted-foreground">
              {isMyProperties ? "Gérez vos propriétés et leurs annonces" : "Découvrez tous nos logements"}
            </p>
          </div>
          {isMyProperties && user && (
            <div className="hidden sm:flex gap-2">
              <Button variant="outline" onClick={async () => {
                try {
                  if (!user) return;
                  const nextMonth = new Date();
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  const formatDate = (d: Date) => d.toISOString().slice(0,10);
                  const { error } = await supabase.from('properties').insert([
                    {
                      host_id: user.id,
                      title: "Appartement meublé au Plateau — Longue durée",
                      description: "Appartement confortable au Plateau avec wifi fibre et eau incluse. Idéal pour séjours mensuels.",
                      property_type: "appartement",
                      address: "Plateau, Dakar",
                      city: "Dakar",
                      price_per_night: 60000,
                      max_guests: 2,
                      bedrooms: 1,
                      bathrooms: 1,
                      amenities: ['WiFi','Lave-linge','Climatisation'],
                      long_term_enabled: true,
                      monthly_price: 450000,
                      min_months: 1,
                      max_months: 12,
                      deposit_amount: 450000,
                      utilities_included: true,
                      utilities_notes: "Électricité non incluse",
                      furnished: true,
                      notice_period_days: 30,
                      available_from: formatDate(nextMonth),
                    },
                    {
                      host_id: user.id,
                      title: "Villa 2 chambres — Séjours mensuels",
                      description: "Villa confortable à Saly, idéale pour des séjours longue durée.",
                      property_type: "villa",
                      address: "Saly Portudal",
                      city: "Saly",
                      price_per_night: 90000,
                      max_guests: 4,
                      bedrooms: 2,
                      bathrooms: 2,
                      amenities: ['WiFi','Piscine','Parking'],
                      long_term_enabled: true,
                      monthly_price: 700000,
                      min_months: 2,
                      max_months: 12,
                      deposit_amount: 700000,
                      utilities_included: false,
                      utilities_notes: "Charges selon consommation",
                      furnished: true,
                      notice_period_days: 45,
                      available_from: formatDate(new Date()),
                    }
                  ]).select();
                  if (error) throw error;
                  toast({ title: 'Exemples ajoutés', description: '2 annonces longue durée ont été créées.' });
                  fetchProperties();
                } catch (e) {
                  console.error(e);
                  toast({ title: 'Erreur', description: "Impossible d'ajouter les exemples", variant: 'destructive' });
                }
              }}>Ajouter exemples longue durée</Button>
              <Button onClick={() => window.location.href = '/add-property'}>
                Ajouter un logement
              </Button>
            </div>
          )}
        </div>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-lg mb-4">
                {isMyProperties ? "Vous n'avez pas encore de logements" : "Aucun logement disponible"}
              </p>
              {isMyProperties && user && (
                <Button onClick={() => window.location.href = '/add-property'}>
                  Créer votre première annonce
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {properties.map((property) => (
              <Card 
                key={property.id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 rounded-none sm:rounded-lg"
                onClick={() => window.location.href = `/property/${property.id}`}
              >
                <div className="grid md:grid-cols-3 gap-0">
                  {/* Image principale */}
                  <div className="relative md:col-span-1" style={{ aspectRatio: '995/576' }}>
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0].image_url}
                        alt={property.images[0].alt_text || property.title}
                        className="w-full h-full object-cover"
                        style={{ width: '995px', height: '576px', maxWidth: '100%', maxHeight: '100%' }}
                        onError={(e) => {
                          console.log('Image failed to load:', property.images[0].image_url);
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <p className="text-muted-foreground">Photo à venir</p>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant={property.is_active ? "default" : "secondary"}>
                        {property.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="md:col-span-2 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                        <p className="text-muted-foreground">
                          {property.address}, {property.city}
                        </p>
                      </div>
                      {isMyProperties && user && (
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/edit-property/${property.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => togglePropertyStatus(property.id, property.is_active)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer le logement</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer ce logement ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteProperty(property.id)}>
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">{property.property_type}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Prix/nuit</p>
                        <p className="font-medium tabular-nums">{Number(property.price_per_night).toLocaleString()} FCFA</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Capacité</p>
                        <p className="font-medium">{property.max_guests} pers.</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Chambres</p>
                        <p className="font-medium">{property.bedrooms}ch / {property.bathrooms}sdb</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {property.description}
                    </p>

                    {property.amenities && property.amenities.length > 0 && (() => {
                      const amenities = normalizeAmenities(property.amenities);
                      return (
                      <div className="flex flex-wrap gap-1">
                        {amenities.slice(0, 5).map((amenity) => (
                          <Badge key={amenity} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {amenities.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{amenities.length - 5}
                          </Badge>
                        )}
                      </div>
                      );
                    })()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default Properties;