import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyData } from "../PropertyListingFlow";
import { MapPin } from "lucide-react";
import LocationPickerMap from "@/components/LocationPickerMap";

interface LocationStepProps {
  data: PropertyData;
  updateData: (data: Partial<PropertyData>) => void;
}

export const LocationStep = ({ data, updateData }: LocationStepProps) => {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>(
    data.coordinates || { lat: 14.6937, lng: -17.4441 }
  );

  const handleCityChange = (city: string) => {
    updateData({ city });
    
    // Coordonnées approximatives des principales villes
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      "Dakar": { lat: 14.6937, lng: -17.4441 },
      "Saint-Louis": { lat: 16.0181, lng: -16.4934 },
      "Saly": { lat: 14.4503, lng: -16.7615 },
      "Thiès": { lat: 14.7886, lng: -16.9246 },
      "Kaolack": { lat: 14.1617, lng: -16.0734 },
      "Ziguinchor": { lat: 12.5681, lng: -16.2722 },
    };
    
    if (cityCoordinates[city]) {
      setCoordinates(cityCoordinates[city]);
      updateData({ coordinates: cityCoordinates[city] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="city">Ville *</Label>
        <Select value={data.city} onValueChange={handleCityChange}>
          <SelectTrigger className="mt-1">
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
        <Label htmlFor="address">Adresse complète *</Label>
        <Input
          id="address"
          value={data.address}
          onChange={(e) => updateData({ address: e.target.value })}
          placeholder="Ex: Quartier Almadies, Rue des Ambassades, Villa n°25"
          className="mt-1"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Cette adresse ne sera pas visible dans l'annonce pour des raisons de sécurité
        </p>
      </div>

      <div>
        <Label>Localisation sur la carte</Label>
        <LocationPickerMap
          className="mt-2"
          value={coordinates}
          onChange={(c) => {
            setCoordinates(c);
            updateData({ coordinates: c });
          }}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Point sélectionné: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          La localisation exacte sera visible aux invités après réservation
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">À propos de la localisation</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Les invités verront seulement la zone générale avant de réserver. L'adresse exacte 
              leur sera communiquée après confirmation de la réservation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};