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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-lg supports-[backdrop-filter]:bg-background/95 border-t shadow-lg">
        <div className="safe-area-bottom px-1">
            <ul
              className="flex items-center justify-around no-scrollbar"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
                    const Icon = iconMap[item.icon || "Home"];
                    return (
                        <li key={item.to}>
                            <Link
                                to={item.to}
                                className={`flex flex-col items-center justify-center min-h-[60px] px-2 py-2 text-xs transition-all duration-200 touch-target mobile-button no-select ${
                                    isActive ? "text-primary font-semibold scale-105" : "text-muted-foreground hover:text-foreground active:scale-95"
                                }`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                                    isActive ? "bg-primary/10 scale-110" : "hover:bg-muted/50"
                                }`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className="text-[10px] leading-tight mt-1 font-medium">{item.label}</span>
                            </Link>
                        </li>
                    );
                })}

                <li>
                    {user ? (
                        <Link 
                            to="/host" 
                            aria-label="Devenir Hôte" 
                            className={`flex flex-col items-center justify-center min-h-[60px] px-2 py-2 text-xs transition-all duration-200 touch-target mobile-button no-select ${
                                location.pathname === "/host" ? "text-primary font-semibold scale-105" : "text-muted-foreground hover:text-foreground active:scale-95"
                            }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                                location.pathname === "/host" ? "bg-primary/10 scale-110" : "hover:bg-muted/50"
                            }`}>
                                <Plus className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] leading-tight mt-1 font-medium">Hôte</span>
                        </Link>
                    ) : (
                        <Link 
                            to="/auth" 
                            className={`flex flex-col items-center justify-center min-h-[60px] px-2 py-2 text-xs transition-all duration-200 touch-target mobile-button no-select ${
                                location.pathname === "/auth" ? "text-primary font-semibold scale-105" : "text-muted-foreground hover:text-foreground active:scale-95"
                            }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                                location.pathname === "/auth" ? "bg-primary/10 scale-110" : "hover:bg-muted/50"
                            }`}>
                                <LogIn className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] leading-tight mt-1 font-medium">Connexion</span>
                        </Link>
                    )}
                </li>
        </ul>
      </div>
    </nav>
  );
};

export default MobileNav;