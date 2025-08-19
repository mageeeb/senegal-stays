export type NavItem = {
  label: string;
  to: string;
  icon?: string; // lucide icon name as string for potential future use
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Accueil", to: "/", icon: "Home" },
  { label: "Logements", to: "/properties", icon: "Building2" },
  { label: "Séjours", to: "/long-stays", icon: "CalendarRange" },
  { label: "Véhicules", to: "/vehicles", icon: "Car" },
];
