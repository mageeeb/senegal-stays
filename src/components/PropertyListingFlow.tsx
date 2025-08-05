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

export const PropertyListingFlow = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    title: "",
    description: "",
    property_type: "",
    address: "",
    city: "",
    max_guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    photos: [],
    price_per_night: 0,
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
      const { error } = await supabase
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
          images: propertyData.photos,
          host_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre logement a été ajouté avec succès !",
      });
      navigate('/');
    } catch (error) {
      console.error('Error adding property:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du logement",
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
            <h1 className="text-3xl font-bold mb-2">Ajouter votre logement</h1>
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
              {loading ? "Publication..." : "Publier l'annonce"}
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