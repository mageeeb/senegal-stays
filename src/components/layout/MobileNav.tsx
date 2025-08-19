import { Link, useLocation } from "react-router-dom";
import { Home, Building2, CalendarRange, Car, User, LogIn, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NAV_ITEMS } from "@/components/layout/navItems";

import type { ElementType } from "react";

const iconMap: Record<string, ElementType> = {
  Home,
  Building2,
  CalendarRange,
  Car,
  User,
  Plus,
};

const MobileNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <div className="mx-auto max-w-screen-md px-4 py-2 pb-[env(safe-area-inset-bottom)]">
        <ul className="grid grid-cols-4 gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
            const Icon = iconMap[item.icon || "Home"]; 
            return (
              <li key={item.to} className="flex">
                <Link
                  to={item.to}
                  className={`flex-1 inline-flex flex-col items-center justify-center gap-1 py-2 rounded-md transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              </li>
            );
          })}

          <li className="flex">
            {user ? (
              <Link to="/host" className="flex-1 inline-flex flex-col items-center justify-center gap-1 py-2 rounded-md text-muted-foreground hover:text-foreground">
                <Plus className="h-5 w-5" />
                <span className="text-xs">Devenir hôte</span>
              </Link>
            ) : (
              <Link to="/auth" className="flex-1 inline-flex flex-col items-center justify-center gap-1 py-2 rounded-md text-muted-foreground hover:text-foreground">
                <LogIn className="h-5 w-5" />
                <span className="text-xs">Connexion</span>
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default MobileNav;