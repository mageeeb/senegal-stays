import { NavLink } from "react-router-dom";
import { Home, Building2, CalendarRange, User, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navigation principale mobile"
    >
      <div className="mx-auto max-w-screen-md">
        <ul className="grid grid-cols-4 items-center">
          <li>
            <NavLink to="/" end className={navItemCls} aria-label="Accueil">
              <Home className="h-5 w-5" />
              <span>Accueil</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/long-stays" className={navItemCls} aria-label="Séjours longue durée">
              <CalendarRange className="h-5 w-5" />
              <span>Long séjour</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/properties" className={navItemCls} aria-label="Logements">
              <Building2 className="h-5 w-5" />
              <span>Logements</span>
            </NavLink>
          </li>
          <li>
            {user ? (
              <NavLink to="/add-property" className={navItemCls} aria-label="Ajouter un logement">
                <Plus className="h-5 w-5" />
                <span>Publier</span>
              </NavLink>
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
