import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import { ArrowLeft, Star, MapPin, Users, Bed, Bath, Wifi } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BookingForm } from "@/components/BookingForm";
import ImageGallery from "@/components/ImageGallery";

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
          <div className="mb-12">
            <ImageGallery images={property.images} title={property.title} />
          </div>
        )}

        {/* Section principale avec prix et détails de base */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Informations de base */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold mb-3">
                    {property.property_type} entier hébergé par {host?.first_name || 'Hôte'}
                  </h2>
                  <div className="flex items-center gap-6 text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      {property.max_guests} voyageurs
                    </div>
                    <div className="flex items-center">
                      <Bed className="h-5 w-5 mr-2" />
                      {property.bedrooms} chambres
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-5 w-5 mr-2" />
                      {property.bathrooms} salles de bain
                    </div>
                  </div>
                </div>
                {host?.avatar_url && (
                  <img
                    src={host.avatar_url}
                    alt={`${host.first_name} ${host.last_name}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
              </div>
            </Card>
          </div>

          {/* Prix et réservation rapide */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold">{property.price_per_night}€</span>
                  <span className="text-muted-foreground">par nuit</span>
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

        {/* Sections détaillées */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-6">À propos de ce logement</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-line text-base">
                    {property.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Équipements */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-6">Équipements proposés</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center py-2">
                        <Wifi className="h-5 w-5 mr-4 text-muted-foreground" />
                        <span className="text-base">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section hôte */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-6">Votre hôte</h3>
                <div className="flex items-center gap-4">
                  {host?.avatar_url && (
                    <img
                      src={host.avatar_url}
                      alt={`${host.first_name} ${host.last_name}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h4 className="text-lg font-semibold">
                      {host?.first_name} {host?.last_name}
                    </h4>
                    <p className="text-muted-foreground">Hôte</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Espace vide pour équilibrer la mise en page */}
          <div className="lg:col-span-1 hidden lg:block"></div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;