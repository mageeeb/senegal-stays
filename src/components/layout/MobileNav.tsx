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
        <div className="mx-auto max-w-screen-md px-2 md:px-4 py-1.5 md:py-2 pb-[env(safe-area-inset-bottom)]">
            <ul
              className="flex flex-nowrap items-stretch gap-1 md:gap-2 overflow-x-auto md:overflow-x-visible no-scrollbar snap-x snap-proximity md:snap-none justify-start md:justify-center pr-[calc(env(safe-area-inset-right)+0.75rem)]"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
                    const Icon = iconMap[item.icon || "Home"];
                    return (
                        <li key={item.to} className="shrink-0">
                            <Link
                                to={item.to}
                                className={`min-w-[72px] md:min-w-[84px] px-2 md:px-3 inline-flex flex-col items-center justify-center gap-1 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background snap-center ${
                                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                }`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <Icon className="h-5 w-5 md:h-5 md:w-5" />
                                <span className="text-[11px] md:text-xs max-w-[6.5rem] md:max-w-[8rem] truncate whitespace-nowrap text-center">{item.label}</span>
                            </Link>
                        </li>
                    );
                })}

                <li className="shrink-0">
                    {user ? (
                        <Link to="/host" aria-label="Devenir Hôte" className="min-w-[72px] md:min-w-[84px] px-2 md:px-3 inline-flex flex-col items-center justify-center gap-1 py-2 rounded-md transition-colors text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background snap-center">
                            <Plus className="h-5 w-5 md:h-5 md:w-5" />
                            <span className="text-[11px] md:text-xs max-w-[6.5rem] md:max-w-[8rem] truncate whitespace-nowrap text-center">Hôte</span>
                        </Link>
                    ) : (
                        <Link to="/auth" className="min-w-[72px] md:min-w-[84px] px-2 md:px-3 inline-flex flex-col items-center justify-center gap-1 py-2 rounded-md transition-colors text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background snap-center">
                            <LogIn className="h-5 w-5 md:h-5 md:w-5" />
                            <span className="text-[11px] md:text-xs max-w-[6.5rem] md:max-w-[8rem] truncate whitespace-nowrap text-center">Connexion</span>
                        </Link>
                    )}
                </li>
        </ul>
      </div>
    </nav>
  );
};

export default MobileNav;