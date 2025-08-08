// TypeScript
// src/utils/amenityIcons.ts
import {
    Wifi,
    Car,
    Waves,
    Snowflake,
    ChefHat,
    Tv,
    WashingMachine,
    TreePine,
    Home,
    Shield,
} from "lucide-react";

export type AmenityIcon = React.ComponentType<{ className?: string }>;

export const AMENITY_ICONS: Record<string, AmenityIcon> = {
    "WiFi": Wifi,
    "Parking": Car,
    "Piscine": Waves,
    "Climatisation": Snowflake,
    "Cuisine équipée": ChefHat,
    "Télévision": Tv,
    "Lave-linge": WashingMachine,
    "Terrasse": Home,
    "Jardin": TreePine,
    "Sécurité 24h/24": Shield,
};

export function getAmenityIcon(name: string): AmenityIcon {
    return AMENITY_ICONS[name] ?? Wifi; // fallback
}