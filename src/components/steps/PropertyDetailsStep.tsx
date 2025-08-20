import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PropertyData } from "../PropertyListingFlow";
import { Users, Bed, Bath, Wifi, Car, Waves, Snowflake, ChefHat, Tv, WashingMachine, TreePine, Home, Shield , Coffee } from "lucide-react";
import { getAmenityIcon, normalizeAmenity, normalizeAmenities } from "@/utils/amenityIcons";
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
    { name: "Petit déjeuner", icon: Coffee },
];

export const PropertyDetailsStep = ({ data, updateData }: PropertyDetailsStepProps) => {
  const handleAmenityToggle = (amenity: string) => {
    const target = normalizeAmenity(amenity);
    const current = normalizeAmenities(data.amenities);
    const set = new Set(current);
    if (set.has(target)) {
      set.delete(target);
    } else {
      set.add(target);
    }
    updateData({ amenities: Array.from(set) });
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
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                updateData({ max_guests: isNaN(parsed) ? 0 : Math.max(0, parsed) });
              }}
              onBlur={(e) => {
                if (e.target.value === "") updateData({ max_guests: 0 });
              }}
              min="0"
              step="1"
              max="20"
              placeholder="0"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="bedrooms">Chambres *</Label>
            <Input
              id="bedrooms"
              type="number"
              value={data.bedrooms}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                updateData({ bedrooms: isNaN(parsed) ? 0 : Math.max(0, parsed) });
              }}
              onBlur={(e) => {
                if (e.target.value === "") updateData({ bedrooms: 0 });
              }}
              min="0"
              step="1"
              max="10"
              placeholder="0"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="bathrooms">Salles de bain *</Label>
            <Input
              id="bathrooms"
              type="number"
              value={data.bathrooms}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                updateData({ bathrooms: isNaN(parsed) ? 0 : Math.max(0, parsed) });
              }}
              onBlur={(e) => {
                if (e.target.value === "") updateData({ bathrooms: 0 });
              }}
              min="0"
              step="1"
              max="10"
              placeholder="0"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Équipements */}
        <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Ce que propose ce logement</h2>
            {Array.isArray(data.amenities) && data.amenities.length > 0 ? (
                <>
                    {(() => {
                        // Normaliser pour éviter les espaces/tirets qui bloquent l'affichage
                        const amenities = data.amenities
                            .map((a) => normalizeAmenity(a))
                            .filter((a) => !!a);

                        const preview = amenities.slice(0, 10);
                        const rest = amenities.slice(10);

                        return (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {preview.map((amenity) => {
                                        const Icon = getAmenityIcon(amenity);
                                        return (
                                            <div key={amenity} className="flex items-center gap-3 text-muted-foreground">
                                                <Icon className="h-5 w-5" />
                                                <span className="text-sm text-foreground">{amenity}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {rest.length > 0 && (
                                    <details className="mt-4">
                                        <summary className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md border text-sm hover:bg-accent cursor-pointer">
                                            Afficher les {amenities.length} équipements
                                        </summary>
                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {rest.map((amenity) => {
                                                const Icon = getAmenityIcon(amenity);
                                                return (
                                                    <div key={amenity} className="flex items-center gap-3 text-muted-foreground">
                                                        <Icon className="h-5 w-5" />
                                                        <span className="text-sm text-foreground">{amenity}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </details>
                                )}
                            </>
                        );
                    })()}
                </>
            ) : (
                <p className="text-sm text-muted-foreground">Aucun équipement renseigné.</p>
            )}
        </section>
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

      {/* Meublé / Non meublé */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Mobilier</h3>
        <div className="flex items-center gap-2">
          <Checkbox id="furnished" checked={!!data.furnished} onCheckedChange={(v) => updateData({ furnished: !!v })} />
          <Label htmlFor="furnished">Logement meublé</Label>
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
          {normalizeAmenities(data.amenities).length > 0 && (
            <span>• {normalizeAmenities(data.amenities).length} équipement{normalizeAmenities(data.amenities).length > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  );
};