import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Home, Plus, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { NAV_ITEMS } from "@/components/layout/navItems";

const Header = () => {
  const { user, signOut } = useAuth();
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debug log pour vérifier le rôle
  console.log('User:', user?.email, 'isSuperAdmin:', isSuperAdmin, 'roleLoading:', roleLoading);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur Teranga Home !",
      });
      navigate("/");
    } catch (error: any) {
      // Only show error if it's not a session not found error
      if (!error.message?.includes('Session not found')) {
        toast({
          title: "Erreur",
          description: "Impossible de se déconnecter",
          variant: "destructive",
        });
      } else {
        // Session was already expired, treat as successful logout
        toast({
          title: "Déconnexion réussie",
          description: "À bientôt sur Teranga Home !",
        });
        navigate("/");
      }
    }
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-top md:static">
            <div className="container mx-auto px-4 h-14 md:h-16 lg:h-20 flex items-center justify-between">
                <Link
                    to="/"
                    className="flex items-center space-x-2 min-h-11 py-1 touch-target"
                    aria-label="Teranga Home"
                >
          <span className="inline-flex items-center justify-center rounded-lg p-0.5">
            <img
                src="/teranga_home.png"
                alt="Teranga Home"
                className="block h-10 md:h-14 lg:h-[72px] w-auto select-none"
                loading="eager"
                decoding="async"
            />
          </span>
                    <span className="sr-only">Teranga Home</span>
                </Link>

                {/* Navigation hidden on mobile - handled by MobileNav */}
                <nav className="hidden md:flex items-center space-x-6">
                    <Link to="/" className="text-foreground hover:text-primary transition-colors touch-target">
                        Accueil
                    </Link>
                    <Link to="/properties" className="text-foreground hover:text-primary transition-colors touch-target">
                        Logements
                    </Link>
                    <Link to="/long-stays" className="text-foreground hover:text-primary transition-colors touch-target">
                        Séjours Longue Durée
                    </Link>
                    <Link to="/vehicles" className="text-foreground hover:text-primary transition-colors touch-target">
                        Véhicules
                    </Link>
                    {isSuperAdmin && (
                        <Link to="/admin" className="text-foreground hover:text-primary transition-colors font-medium text-red-600 touch-target">
                            Admin
                        </Link>
                    )}
                    {user && (
                        <Link to="/host" className="text-foreground hover:text-primary transition-colors touch-target">
                            Devenir hôte
                        </Link>
                    )}
                </nav>

                <div className="flex items-center space-x-2 md:space-x-4">
                    {user ? (
                        <>
                            <div className="hidden md:flex items-center space-x-2">
                                <Button variant="outline" size="sm" asChild className="mobile-button">
                                    <Link to="/add-property" className="touch-target">
                                        <Plus className="h-4 w-4 mr-2" />
                                        <span className="hidden lg:inline">Ajouter un logement</span>
                                        <span className="lg:hidden">Logement</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild className="mobile-button">
                                    <Link to="/add-vehicle" className="touch-target">
                                        <Plus className="h-4 w-4 mr-2" />
                                        <span className="hidden lg:inline">Ajouter un véhicule</span>
                                        <span className="lg:hidden">Véhicule</span>
                                    </Link>
                                </Button>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full touch-target mobile-button">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="" alt="Profil" />
                                            <AvatarFallback>{getInitials(user.email || "U")}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <div className="flex flex-col space-y-1 p-2">
                                        <p className="text-sm font-medium leading-none">{user.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Mon profil</span>
                                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                         <Link to="/my-properties">
                             <Home className="mr-2 h-4 w-4" />
                             <span>Mes logements</span>
                         </Link>
                     </DropdownMenuItem>
                     
                     {/* FORCE AFFICHAGE ADMIN - TOUJOURS VISIBLE */}
                     <DropdownMenuItem asChild>
                         <Link to="/admin">
                             <Shield className="mr-2 h-4 w-4" />
                             <span>🔧 Administration</span>
                         </Link>
                     </DropdownMenuItem>
                     
                                     <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleSignOut}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Se déconnecter</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" asChild className="mobile-button touch-target">
                                <Link to="/auth">Se connecter</Link>
                            </Button>
                            <Button asChild className="mobile-button touch-target">
                                <Link to="/auth">S'inscrire</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
// ... existing code ...
};

export default Header;