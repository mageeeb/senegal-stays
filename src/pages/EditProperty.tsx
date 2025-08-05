import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PropertyListingFlow } from "@/components/PropertyListingFlow";

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

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchProperty();
    }
  }, [id, user]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
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
        .eq('host_id', user?.id) // S'assurer que l'utilisateur peut seulement modifier ses propres propriétés
        .single();

      if (error) {
        console.error('Erreur lors du chargement de la propriété:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le logement",
          variant: "destructive",
        });
        navigate('/properties');
        return;
      }

      // Trier les images par sort_order
      const propertyWithSortedImages = {
        ...data,
        images: data.property_images?.sort((a: PropertyImage, b: PropertyImage) => a.sort_order - b.sort_order) || []
      };

      setProperty(propertyWithSortedImages);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite",
        variant: "destructive",
      });
      navigate('/properties');
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
            <Button onClick={() => navigate('/properties')}>
              Retour à mes logements
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Convertir les données de la propriété au format attendu par PropertyListingFlow
  const initialData = {
    title: property.title,
    description: property.description,
    address: property.address,
    city: property.city,
    property_type: property.property_type,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    max_guests: property.max_guests,
    amenities: property.amenities,
    photos: property.images?.map(img => img.image_url) || [],
    price_per_night: property.price_per_night
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4" 
          onClick={() => navigate('/properties')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à mes logements
        </Button>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Modifier le logement</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyListingFlow 
              initialData={initialData} 
              isEdit={true} 
              propertyId={property.id}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProperty;