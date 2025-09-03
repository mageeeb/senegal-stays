import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink } from "lucide-react";
import { useState } from "react";

interface VirtualTourProps {
  matterportUrl?: string;
  propertyTitle: string;
}

const VirtualTour = ({ matterportUrl, propertyTitle }: VirtualTourProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // URL par défaut pour démo si aucune URL Matterport fournie
  const defaultUrl = "https://my.matterport.com/show/?m=SxQL3iGyoDo";
  const tourUrl = matterportUrl || defaultUrl;

  const handleLoadTour = () => {
    setIsLoaded(true);
  };

  return (
    <div className="py-8 border-b">
      <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
        <Eye className="h-6 w-6 text-primary" />
        Visite guidée virtuelle
      </h3>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {!isLoaded ? (
            <div className="relative">
              <div 
                className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/10 flex flex-col items-center justify-center"
                style={{
                  backgroundImage: `linear-gradient(45deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.05)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="hsl(var(--primary))" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>')`,
                }}
              >
                <div className="text-center space-y-4 max-w-md mx-auto px-6">
                  <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                    <Eye className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-xl font-semibold">
                    Explorez {propertyTitle} en 3D
                  </h4>
                  <p className="text-muted-foreground">
                    Découvrez chaque recoin de ce logement grâce à notre visite virtuelle immersive
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={handleLoadTour} className="gap-2">
                      <Eye className="h-4 w-4" />
                      Lancer la visite
                    </Button>
                    <Button 
                      variant="outline" 
                      asChild
                      className="gap-2"
                    >
                      <a 
                        href={tourUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ouvrir en plein écran
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <iframe
                src={tourUrl}
                width="100%"
                height="480"
                frameBorder="0"
                allowFullScreen
                allow="vr"
                className="w-full"
                title={`Visite virtuelle de ${propertyTitle}`}
                loading="lazy"
              />
              <div className="absolute top-4 right-4">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  asChild
                  className="gap-2 bg-background/90 backdrop-blur-sm"
                >
                  <a 
                    href={tourUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Plein écran
                  </a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          <strong>Conseil :</strong> Utilisez votre souris ou votre doigt pour naviguer dans l'espace. 
          Cliquez sur les points bleus pour vous déplacer d'une pièce à l'autre.
        </p>
      </div>
    </div>
  );
};

export default VirtualTour;