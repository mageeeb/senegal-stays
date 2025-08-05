import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PropertyData } from "../PropertyListingFlow";
import { Upload, X, Camera, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotosStepProps {
  data: PropertyData;
  updateData: (data: Partial<PropertyData>) => void;
}

export const PhotosStep = ({ data, updateData }: PhotosStepProps) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Fichier non valide",
          description: "Veuillez sélectionner uniquement des images",
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: "Fichier trop volumineux",
          description: `${file.name} dépasse 10MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      // En production, vous uploaderiez les fichiers vers Supabase Storage
      // Pour cette démo, on simule des URLs
      const newPhotos = validFiles.map((file, index) => 
        `https://images.unsplash.com/photo-${Date.now() + index}?w=800&h=600&fit=crop`
      );
      
      updateData({ photos: [...data.photos, ...newPhotos].slice(0, 20) }); // Max 20 photos
      
      toast({
        title: "Photos ajoutées",
        description: `${validFiles.length} photo(s) ajoutée(s) avec succès`,
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = data.photos.filter((_, i) => i !== index);
    updateData({ photos: newPhotos });
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...data.photos];
    const [moved] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, moved);
    updateData({ photos: newPhotos });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Photos de votre logement</h3>
        <p className="text-muted-foreground mb-4">
          Ajoutez au moins 5 photos de qualité. La première sera votre photo de couverture.
        </p>
      </div>

      {/* Zone de upload */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-2">Glissez vos photos ici</h4>
            <p className="text-muted-foreground mb-4">
              ou cliquez pour sélectionner des fichiers
            </p>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4 mr-2" />
              Choisir des photos
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP jusqu'à 10MB chacune (max 20 photos)
          </p>
        </div>
      </div>

      {/* Photos existantes */}
      {data.photos.length > 0 && (
        <div>
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Vos photos ({data.photos.length}/20)
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.photos.map((photo, index) => (
              <div key={index} className="group relative aspect-square">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border"
                />
                
                {/* Badge pour la photo principale */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Principale
                  </div>
                )}
                
                {/* Bouton de suppression */}
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                
                {/* Indicateur d'ordre */}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            Glissez-déposez les photos pour les réorganiser. La première photo sera votre image de couverture.
          </p>
        </div>
      )}

      {/* Conseils */}
      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Conseils pour de belles photos
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Utilisez la lumière naturelle autant que possible</li>
          <li>• Montrez toutes les pièces importantes</li>
          <li>• Assurez-vous que l'espace est propre et bien rangé</li>
          <li>• Incluez des photos extérieures si applicable</li>
          <li>• Évitez les photos floues ou sombres</li>
        </ul>
      </div>
    </div>
  );
};