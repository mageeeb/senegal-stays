import { NavLink } from "react-router-dom";
import { Home, Building2, CalendarRange, User, Plus, Car } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// Mobile bottom navigation bar (shows only on small screens)
// Uses semantic tokens and Tailwind classes consistent with the design system
const navItemCls = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs ${
    isActive ? "text-primary" : "text-muted-foreground"
  }`;

const MobileNav = () => {
  const { user } = useAuth();

  return (
    <nav
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navigation principale mobile"
    >
      <div className="mx-auto max-w-screen-md">
        <ul className="grid grid-cols-5 items-center">
          <li>
            <NavLink to="/" end className={navItemCls} aria-label="Accueil">
              <Home className="h-5 w-5" />
              <span>Accueil</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/properties" className={navItemCls} aria-label="Logements">
              <Building2 className="h-5 w-5" />
              <span>Logements</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/long-stays" className={navItemCls} aria-label="Séjours longue durée">
              <CalendarRange className="h-5 w-5" />
              <span>Long séjour</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/vehicles" className={navItemCls} aria-label="Véhicules">
              <Car className="h-5 w-5" />
              <span>Véhicules</span>
            </NavLink>
          </li>
          <li>
            {user ? (
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs text-muted-foreground">
                    <Plus className="h-5 w-5" />
                    <span>Publier</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-fit">
                  <SheetHeader>
                    <SheetTitle className="text-center">Que souhaitez-vous ajouter ?</SheetTitle>
                  </SheetHeader>
                  <div className="grid grid-cols-1 gap-4 py-6">
                    <Button asChild variant="outline" className="h-16 flex-col gap-2">
                      <NavLink to="/add-property">
                        <Building2 className="h-6 w-6" />
                        <span>Ajouter un logement</span>
                      </NavLink>
                    </Button>
                    <Button asChild variant="outline" className="h-16 flex-col gap-2">
                      <NavLink to="/add-vehicle">
                        <Car className="h-6 w-6" />
                        <span>Ajouter un véhicule</span>
                      </NavLink>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <NavLink to="/auth" className={navItemCls} aria-label="Mon compte">
                <User className="h-5 w-5" />
                <span>Compte</span>
              </NavLink>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default MobileNav;
