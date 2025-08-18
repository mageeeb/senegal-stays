import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface VehicleImageUploadProps {
  imageUrl: string;
  onImageUpload: (url: string) => void;
}

export const VehicleImageUpload = ({ imageUrl, onImageUpload }: VehicleImageUploadProps) => {
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = async (files: FileList) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour uploader une image",
        variant: "destructive",
      });
      return;
    }

    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Fichier non valide",
        description: "Veuillez sélectionner une image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "Fichier trop volumineux",
        description: "L'image ne doit pas dépasser 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Créer un nom de fichier unique pour les véhicules
      const fileExt = file.name.split('.').pop();
      const fileName = `vehicles/${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Uploader vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-images') // Utilise le même bucket que les propriétés
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Erreur d'upload",
          description: `Impossible d'uploader l'image: ${uploadError.message}`,
          variant: "destructive",
        });
        return;
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(uploadData.path);

      onImageUpload(urlData.publicUrl);
      
      toast({
        title: "Image ajoutée",
        description: "L'image a été uploadée avec succès",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = () => {
    onImageUpload("");
  };

  return (
    <div className="space-y-4">
      {/* Zone de upload */}
      {!imageUrl && (
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
            accept="image/*"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            disabled={uploading}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-2">
                {uploading ? "Upload en cours..." : "Glissez votre photo ici"}
              </h4>
              <p className="text-muted-foreground mb-4">
                ou cliquez pour sélectionner un fichier
              </p>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera className="h-4 w-4 mr-2" />
                {uploading ? "Upload en cours..." : "Choisir une photo"}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP jusqu'à 10MB
            </p>
          </div>
        </div>
      )}

      {/* Image uploadée */}
      {imageUrl && (
        <div className="relative">
          <div className="relative aspect-video max-w-md">
            <img
              src={imageUrl}
              alt="Véhicule"
              className="w-full h-full object-cover rounded-lg border"
            />
            
            {/* Bouton de suppression */}
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="mt-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-sm"
            >
              <Camera className="h-3 w-3 mr-2" />
              Changer l'image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};