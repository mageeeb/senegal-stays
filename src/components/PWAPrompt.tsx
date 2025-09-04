import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isInStandaloneMode = () => {
      return (window.matchMedia('(display-mode: standalone)').matches) || 
             (window.navigator as any).standalone || 
             document.referrer.includes('android-app://');
    };
    setIsStandalone(isInStandaloneMode());

    // Handle the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay if not dismissed before
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        const lastDismissed = localStorage.getItem('pwa-prompt-last-dismissed');
        const now = Date.now();
        const threeDays = 3 * 24 * 60 * 60 * 1000;
        
        if (!dismissed || (lastDismissed && now - parseInt(lastDismissed) > threeDays)) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show manual prompt
    if (isIOSDevice && !isInStandaloneMode()) {
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed-ios');
        const lastDismissed = localStorage.getItem('pwa-prompt-last-dismissed-ios');
        const now = Date.now();
        const threeDays = 3 * 24 * 60 * 60 * 1000;
        
        if (!dismissed || (lastDismissed && now - parseInt(lastDismissed) > threeDays)) {
          setShowPrompt(true);
        }
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    const storageKey = isIOS ? 'pwa-prompt-dismissed-ios' : 'pwa-prompt-dismissed';
    const lastDismissedKey = isIOS ? 'pwa-prompt-last-dismissed-ios' : 'pwa-prompt-last-dismissed';
    
    localStorage.setItem(storageKey, 'true');
    localStorage.setItem(lastDismissedKey, Date.now().toString());
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="shadow-lg border-2 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Installer l'app</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            {isIOS 
              ? "Ajoutez Teranga Home à votre écran d'accueil pour une expérience optimale"
              : "Installez Teranga Home pour un accès rapide et une expérience native"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {isIOS ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                1. Touchez le bouton <strong>Partager</strong> ⬆️ en bas
              </p>
              <p className="text-sm text-muted-foreground">
                2. Sélectionnez <strong>"Sur l'écran d'accueil"</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                3. Touchez <strong>"Ajouter"</strong>
              </p>
            </div>
          ) : (
            <Button 
              onClick={handleInstallClick}
              className="w-full mobile-button touch-target"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Installer maintenant
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};