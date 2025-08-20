import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { VehiclePhotosUpload } from "@/components/VehiclePhotosUpload";
import { Car, ArrowLeft } from "lucide-react";

interface VehicleFormData {
  name: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  fuel_type: string;
  transmission: string;
  seats: number;
  doors: number;
  price_per_day: number;
  location: string;
  description: string;
  features: string[];
  images: string[];
}

const AddVehicle = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>({
    name: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    category: "",
    fuel_type: "petrol",
    transmission: "manual",
    seats: 5,
    doors: 4,
    price_per_day: 0,
    location: "",
    description: "",
    features: [],
    images: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour ajouter un véhicule",
        variant: "destructive",
      });
      return;
    }

    if (formData.images.length === 0) {
      toast({
        title: "Images requises",
        description: "Veuillez uploader au moins une image de votre véhicule",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const vehicleId = crypto.randomUUID();
      
      // Créer l'objet véhicule avec seulement les champs valides de la table
      const vehicleToInsert = {
        id: vehicleId,
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        category: formData.category,
        fuel_type: formData.fuel_type,
        transmission: formData.transmission,
        seats: formData.seats,
        doors: formData.doors,
        price_per_day: formData.price_per_day,
        location: formData.location,
        description: formData.description,
        features: formData.features,
        image_url: formData.images[0] || null,
        owner_id: user.id,
        is_available: true
      };
      
      // Insérer le véhicule
      const { error: vehicleError } = await supabase
        .from("vehicles")
        .insert([vehicleToInsert]);

      if (vehicleError) throw vehicleError;

      // Insérer les images multiples dans vehicle_images
      if (formData.images.length > 0) {
        const vehicleImages = formData.images.map((imageUrl, index) => ({
          vehicle_id: vehicleId,
          image_url: imageUrl,
          storage_path: imageUrl, // Pour l'instant, on utilise l'URL comme storage_path
          is_cover: index === 0, // La première image est la couverture
          sort_order: index,
          alt_text: `${formData.name} - Image ${index + 1}`
        }));

        const { error: imagesError } = await supabase
          .from("vehicle_images")
          .insert(vehicleImages);

        if (imagesError) {
          console.error("Erreur lors de l'ajout des images:", imagesError);
          // On continue quand même, car le véhicule est créé
        }
      }

      toast({
        title: "Véhicule ajouté",
        description: "Votre véhicule a été ajouté avec succès",
      });
      
      navigate("/vehicles");
    } catch (error) {
      console.error("Erreur lors de l'ajout du véhicule:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le véhicule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const commonFeatures = [
    "Climatisation", "GPS", "Bluetooth", "Caméra de recul", "Régulateur de vitesse",
    "Vitres électriques", "Verrouillage centralisé", "Airbags", "ABS", "Direction assistée"
  ];

  const categories = [
    "economique", "standard", "premium", "suv", "berline", "break", "utilitaire", "4x4"
  ];

  const locations = [
    "Dakar", "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor", "Touba", "Mbour", "Tambacounda"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/vehicles")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux véhicules
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Car className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Ajouter un véhicule</h1>
          </div>
          <p className="text-muted-foreground">
            Ajoutez votre véhicule à notre plateforme de location
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du véhicule *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Peugeot 208 GT Line"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="brand">Marque *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Ex: Peugeot"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="model">Modèle *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Ex: 208"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="year">Année *</Label>
                  <Input
                    id="year"
                    type="number"
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Lieu *</Label>
                  <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un lieu" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Caractéristiques techniques */}
          <Card>
            <CardHeader>
              <CardTitle>Caractéristiques techniques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="fuel_type">Carburant</Label>
                  <Select value={formData.fuel_type} onValueChange={(value) => setFormData(prev => ({ ...prev, fuel_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">Essence</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="hybrid">Hybride</SelectItem>
                      <SelectItem value="electric">Électrique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="transmission">Transmission</Label>
                  <Select value={formData.transmission} onValueChange={(value) => setFormData(prev => ({ ...prev, transmission: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manuelle</SelectItem>
                      <SelectItem value="automatic">Automatique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="seats">Nombre de places</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="2"
                    max="9"
                    value={formData.seats}
                    onChange={(e) => setFormData(prev => ({ ...prev, seats: parseInt(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="doors">Nombre de portes</Label>
                  <Input
                    id="doors"
                    type="number"
                    min="2"
                    max="5"
                    value={formData.doors}
                    onChange={(e) => setFormData(prev => ({ ...prev, doors: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prix */}
          <Card>
            <CardHeader>
              <CardTitle>Prix de location</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="price_per_day">Prix par jour (FCFA) *</Label>
                <Input
                  id="price_per_day"
                  type="number"
                  min="0"
                  value={formData.price_per_day}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_per_day: parseInt(e.target.value) }))}
                  placeholder="Ex: 25000"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="description">Description du véhicule</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre véhicule, son état, ses particularités..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Équipements */}
          <Card>
            <CardHeader>
              <CardTitle>Équipements et options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonFeatures.map((feature) => (
                  <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upload d'images */}
          <Card>
            <CardHeader>
              <CardTitle>Photos du véhicule *</CardTitle>
            </CardHeader>
            <CardContent>
              <VehiclePhotosUpload
                images={formData.images}
                onImagesUpdate={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
              />
            </CardContent>
          </Card>

          {/* Bouton de soumission */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="min-w-[200px]">
              {loading ? "Ajout en cours..." : "Ajouter le véhicule"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;