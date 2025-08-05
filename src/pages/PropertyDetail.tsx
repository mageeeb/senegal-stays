import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import { ArrowLeft, Star, MapPin, Users, Bed, Bath, Wifi, Car, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProperty();
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
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Link>
        </Button>

        {/* Titre et localisation */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
          <div className="flex items-center text-muted-foreground mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {property.address}, {property.city}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
              4.5 (12 avis)
            </div>
            <Badge variant={property.is_active ? "default" : "secondary"}>
              {property.is_active ? "Disponible" : "Non disponible"}
            </Badge>
          </div>
        </div>

        {/* Photos */}
        {property.images && property.images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-8 h-96">
            <div className="col-span-2 row-span-2">
              <img
                src={property.images[selectedImage]?.image_url || property.images[0].image_url}
                alt={property.images[selectedImage]?.alt_text || property.title}
                className="w-full h-full object-cover rounded-l-lg cursor-pointer"
                onClick={() => setSelectedImage(0)}
              />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-2">
              {property.images.slice(1, 5).map((image, index) => (
                <img
                  key={image.id}
                  src={image.image_url}
                  alt={image.alt_text || property.title}
                  className={`w-full h-full object-cover cursor-pointer ${
                    index === 1 ? 'rounded-tr-lg' : index === 3 ? 'rounded-br-lg' : ''
                  }`}
                  onClick={() => setSelectedImage(index + 1)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hébergement complet */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      {property.property_type} entier hébergé par {host?.first_name || 'Hôte'}
                    </h2>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {property.max_guests} voyageurs
                      </div>
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {property.bedrooms} chambres
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {property.bathrooms} salles de bain
                      </div>
                    </div>
                  </div>
                  {host?.avatar_url && (
                    <img
                      src={host.avatar_url}
                      alt={`${host.first_name} ${host.last_name}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">À propos de ce logement</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {property.description}
                </p>
              </CardContent>
            </Card>

            {/* Équipements */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Équipements proposés</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <Wifi className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Réservation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="text-2xl font-bold">
                    {Number(property.price_per_night).toLocaleString()} FCFA
                    <span className="text-base font-normal text-muted-foreground"> / nuit</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm">4.5 (12 avis)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border rounded-lg p-3">
                      <div className="text-xs font-medium">ARRIVÉE</div>
                      <div className="text-sm">Sélectionner</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-xs font-medium">DÉPART</div>
                      <div className="text-sm">Sélectionner</div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <div className="text-xs font-medium">VOYAGEURS</div>
                    <div className="text-sm">1 voyageur</div>
                  </div>

                  <Button className="w-full" size="lg">
                    Réserver
                  </Button>
                  
                  <p className="text-center text-sm text-muted-foreground">
                    Aucun frais pour le moment
                  </p>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="underline">{Number(property.price_per_night).toLocaleString()} FCFA x 5 nuits</span>
                      <span>{(Number(property.price_per_night) * 5).toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total avant taxes</span>
                      <span>{(Number(property.price_per_night) * 5).toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;