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
import { LogOut, User, Home, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { NAV_ITEMS } from "@/components/layout/navItems";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur Teranga Home !",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    }
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-14 md:h-16 lg:h-20 flex items-center justify-between">
                <Link
                    to="/"
                    className="flex items-center space-x-2 min-h-11 py-1"
                    aria-label="Teranga Home"
                >
          <span className="inline-flex items-center justify-center rounded-lg p-0.5">
            <img
                src="/teranga_home.png"
                alt="Teranga Home"
                className="block h-12 md:h-14 lg:h-[72px] w-auto select-none"
                loading="eager"
                decoding="async"
            />
          </span>
                    <span className="sr-only">Teranga Home</span>
                </Link>

                <nav className="hidden lg:flex items-center space-x-6">
                    <Link to="/" className="text-foreground hover:text-primary transition-colors">
                        Accueil
                    </Link>
                    <Link to="/properties" className="text-foreground hover:text-primary transition-colors">
                        Logements
                    </Link>
                    <Link to="/long-stays" className="text-foreground hover:text-primary transition-colors">
                        Séjours Longue Durée
                    </Link>
                    <Link to="/vehicles" className="text-foreground hover:text-primary transition-colors">
                        Véhicules
                    </Link>
                    {user && (
                        <Link to="/host" className="text-foreground hover:text-primary transition-colors">
                            Devenir hôte
                        </Link>
                    )}
                </nav>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <div className="hidden lg:flex items-center space-x-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link to="/add-property">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Ajouter un logement
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <Link to="/add-vehicle">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Ajouter un véhicule
                                    </Link>
                                </Button>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
                            <Button variant="ghost" asChild>
                                <Link to="/auth">Se connecter</Link>
                            </Button>
                            <Button asChild>
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