import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PropertyData } from "../PropertyListingFlow";
import { Users, Bed, Bath, Wifi, Car, Waves, Snowflake, ChefHat, Tv, WashingMachine, TreePine, Home, Shield } from "lucide-react";

interface PropertyDetailsStepProps {
  data: PropertyData;
  updateData: (data: Partial<PropertyData>) => void;
}

const amenitiesWithIcons = [
  { name: "WiFi", icon: Wifi },
  { name: "Parking", icon: Car },
  { name: "Piscine", icon: Waves },
  { name: "Climatisation", icon: Snowflake },
  { name: "Cuisine équipée", icon: ChefHat },
  { name: "Télévision", icon: Tv },
  { name: "Lave-linge", icon: WashingMachine },
  { name: "Terrasse", icon: Home },
  { name: "Jardin", icon: TreePine },
  { name: "Sécurité 24h/24", icon: Shield },
];

export const PropertyDetailsStep = ({ data, updateData }: PropertyDetailsStepProps) => {
  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = data.amenities.includes(amenity)
      ? data.amenities.filter(a => a !== amenity)
      : [...data.amenities, amenity];
    updateData({ amenities: newAmenities });
  };

  return (
    <div className="space-y-8">
      {/* Capacité */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Capacité d'accueil
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="max_guests">Nombre de voyageurs *</Label>
            <Input
              id="max_guests"
              type="number"
              value={data.max_guests}
              onChange={(e) => updateData({ max_guests: parseInt(e.target.value) || 1 })}
              min="1"
              max="20"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="bedrooms">Chambres *</Label>
            <Input
              id="bedrooms"
              type="number"
              value={data.bedrooms}
              onChange={(e) => updateData({ bedrooms: parseInt(e.target.value) || 0 })}
              min="0"
              max="10"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="bathrooms">Salles de bain *</Label>
            <Input
              id="bathrooms"
              type="number"
              value={data.bathrooms}
              onChange={(e) => updateData({ bathrooms: parseInt(e.target.value) || 1 })}
              min="1"
              max="10"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Équipements */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Équipements</h3>
        <p className="text-muted-foreground mb-4">
          Sélectionnez tous les équipements disponibles dans votre logement
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {amenitiesWithIcons.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                <Checkbox
                  id={item.name}
                  checked={data.amenities.includes(item.name)}
                  onCheckedChange={() => handleAmenityToggle(item.name)}
                />
                <Icon className="h-5 w-5 text-muted-foreground" />
                <Label 
                  htmlFor={item.name}
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  {item.name}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Résumé */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Résumé de votre logement</h4>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {data.max_guests} voyageur{data.max_guests > 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            {data.bedrooms} chambre{data.bedrooms > 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            {data.bathrooms} salle{data.bathrooms > 1 ? 's' : ''} de bain
          </span>
          {data.amenities.length > 0 && (
            <span>• {data.amenities.length} équipement{data.amenities.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  );
};