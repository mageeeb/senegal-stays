import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Step components
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { LocationStep } from "./steps/LocationStep";
import { PropertyDetailsStep } from "./steps/PropertyDetailsStep";
import { PhotosStep } from "./steps/PhotosStep";
import { PricingStep } from "./steps/PricingStep";
import { ReviewStep } from "./steps/ReviewStep";

export interface PropertyData {
  title: string;
  description: string;
  property_type: string;
  address: string;
  city: string;
  coordinates?: { lat: number; lng: number };
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  photos: string[];
  price_per_night: number;
}

const STEPS = [
  { id: 1, title: "Informations de base", component: BasicInfoStep },
  { id: 2, title: "Localisation", component: LocationStep },
  { id: 3, title: "Détails du logement", component: PropertyDetailsStep },
  { id: 4, title: "Photos", component: PhotosStep },
  { id: 5, title: "Tarification", component: PricingStep },
  { id: 6, title: "Révision", component: ReviewStep },
];

interface PropertyListingFlowProps {
  initialData?: Partial<PropertyData>;
  isEdit?: boolean;
  propertyId?: string;
}

export const PropertyListingFlow = ({ 
  initialData = {}, 
  isEdit = false, 
  propertyId 
}: PropertyListingFlowProps = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    title: initialData.title || "",
    description: initialData.description || "",
    property_type: initialData.property_type || "",
    address: initialData.address || "",
    city: initialData.city || "",
    max_guests: initialData.max_guests || 1,
    bedrooms: initialData.bedrooms || 1,
    bathrooms: initialData.bathrooms || 1,
    amenities: initialData.amenities || [],
    photos: initialData.photos || [],
    price_per_night: initialData.price_per_night || 0,
  });

  const updatePropertyData = (data: Partial<PropertyData>) => {
    setPropertyData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour ajouter un logement",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isEdit && propertyId) {
        // Mode édition - mise à jour
        const { error } = await supabase
          .from('properties')
          .update({
            title: propertyData.title,
            description: propertyData.description,
            price_per_night: propertyData.price_per_night,
            address: propertyData.address,
            city: propertyData.city,
            property_type: propertyData.property_type,
            max_guests: propertyData.max_guests,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
            amenities: propertyData.amenities,
            latitude: propertyData.coordinates?.lat ?? null,
            longitude: propertyData.coordinates?.lng ?? null,
          })
          .eq('id', propertyId);

        if (error) throw error;

        // Gérer les images pour la mise à jour
        if (propertyData.photos.length > 0) {
          // Supprimer les anciennes images
          const { error: deleteError } = await supabase
            .from('property_images')
            .delete()
            .eq('property_id', propertyId);

          if (deleteError) throw deleteError;

          // Insérer les nouvelles images
          const imageInserts = propertyData.photos.map((photo, index) => ({
            property_id: propertyId,
            image_url: photo,
            is_cover: index === 0,
            sort_order: index
          }));

          const { error: imageError } = await supabase
            .from('property_images')
            .insert(imageInserts);

          if (imageError) throw imageError;
        }

        toast({
          title: "Succès",
          description: "Votre logement a été modifié avec succès !",
        });
        navigate('/properties');
      } else {
        // Mode création
        const { data: property, error } = await supabase
          .from('properties')
          .insert({
            title: propertyData.title,
            description: propertyData.description,
            price_per_night: propertyData.price_per_night,
            address: propertyData.address,
            city: propertyData.city,
            property_type: propertyData.property_type,
            max_guests: propertyData.max_guests,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
            amenities: propertyData.amenities,
            host_id: user.id,
            latitude: propertyData.coordinates?.lat ?? null,
            longitude: propertyData.coordinates?.lng ?? null,
          })
          .select()
          .single();

        if (error) throw error;

        // Insert property images if any
        if (propertyData.photos.length > 0 && property) {
          const imageInserts = propertyData.photos.map((photo, index) => ({
            property_id: property.id,
            image_url: photo,
            is_cover: index === 0,
            sort_order: index
          }));

          const { error: imageError } = await supabase
            .from('property_images')
            .insert(imageInserts);

          if (imageError) throw imageError;
        }

        toast({
          title: "Succès",
          description: "Votre logement a été ajouté avec succès !",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: "Erreur",
        description: `Une erreur est survenue lors de ${isEdit ? 'la modification' : 'l\'ajout'} du logement`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              {isEdit ? 'Modifier votre logement' : 'Ajouter votre logement'}
            </h1>
            <p className="text-muted-foreground">
              Étape {currentStep} sur {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="mb-8" />
        </div>

        {/* Current step */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent
              data={propertyData}
              updateData={updatePropertyData}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>

          {currentStep === STEPS.length ? (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (isEdit ? "Modification..." : "Publication...") : (isEdit ? "Modifier l'annonce" : "Publier l'annonce")}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Suivant
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};