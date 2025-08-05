import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyData } from "../PropertyListingFlow";

interface BasicInfoStepProps {
  data: PropertyData;
  updateData: (data: Partial<PropertyData>) => void;
}

export const BasicInfoStep = ({ data, updateData }: BasicInfoStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Titre de votre annonce *</Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="Ex: Magnifique appartement avec vue sur l'océan"
          className="mt-1"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Choisissez un titre accrocheur qui décrit bien votre logement
        </p>
      </div>

      <div>
        <Label htmlFor="property_type">Type de logement *</Label>
        <Select value={data.property_type} onValueChange={(value) => updateData({ property_type: value })}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Sélectionnez le type de logement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="appartement">Appartement entier</SelectItem>
            <SelectItem value="maison">Maison entière</SelectItem>
            <SelectItem value="villa">Villa entière</SelectItem>
            <SelectItem value="studio">Studio</SelectItem>
            <SelectItem value="chambre">Chambre privée</SelectItem>
            <SelectItem value="lit">Lit dans un dortoir</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Décrivez votre logement, les équipements, le quartier, ce qui le rend spécial..."
          rows={6}
          className="mt-1"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Minimum 50 caractères. Décrivez ce qui rend votre logement unique.
        </p>
      </div>
    </div>
  );
};