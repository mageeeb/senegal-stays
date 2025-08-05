import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import { Home, MapPin, Users, Bed, Bath, Car } from "lucide-react";

const AddProperty = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price_per_night: "",
    address: "",
    city: "",
    property_type: "",
    max_guests: "",
    bedrooms: "",
    bathrooms: "",
    amenities: [] as string[],
  });

  const amenitiesList = [
    "WiFi", "Parking", "Piscine", "Climatisation", "Cuisine équipée",
    "Télévision", "Lave-linge", "Terrasse", "Jardin", "Sécurité 24h/24"
  ];

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          title: formData.title,
          description: formData.description,
          price_per_night: parseFloat(formData.price_per_night),
          address: formData.address,
          city: formData.city,
          property_type: formData.property_type,
          max_guests: parseInt(formData.max_guests),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          amenities: formData.amenities,
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ajouter votre logement</h1>
          <p className="text-muted-foreground">
            Partagez votre espace avec des voyageurs du monde entier
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Informations de base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre de l'annonce</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Magnifique appartement avec vue sur l'océan"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre logement, les équipements, le quartier..."
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="price">Prix par nuit (FCFA)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price_per_night}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_per_night: e.target.value }))}
                  placeholder="25000"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="city">Ville</Label>
                <Select value={formData.city} onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une ville" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dakar">Dakar</SelectItem>
                    <SelectItem value="Saint-Louis">Saint-Louis</SelectItem>
                    <SelectItem value="Saly">Saly</SelectItem>
                    <SelectItem value="Thiès">Thiès</SelectItem>
                    <SelectItem value="Kaolack">Kaolack</SelectItem>
                    <SelectItem value="Ziguinchor">Ziguinchor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="address">Adresse complète</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Ex: Quartier Almadies, Rue des Ambassades"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Détails du logement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="property_type">Type de logement</Label>
                <Select value={formData.property_type} onValueChange={(value) => setFormData(prev => ({ ...prev, property_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appartement">Appartement</SelectItem>
                    <SelectItem value="maison">Maison</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="chambre">Chambre privée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="max_guests">Nombre de voyageurs</Label>
                  <Input
                    id="max_guests"
                    type="number"
                    value={formData.max_guests}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_guests: e.target.value }))}
                    placeholder="4"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="bedrooms">Chambres</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                    placeholder="2"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="bathrooms">Salles de bain</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                    placeholder="1"
                    min="1"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Équipements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenitiesList.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Ajout en cours..." : "Ajouter le logement"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;