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
    Coffee,
} from "lucide-react";

export type AmenityIcon = React.ComponentType<{ className?: string }>;

// 1) Liste canonique centralisée
export const AMENITIES_CANONICAL: readonly string[] = [
    "WiFi",
    "Parking",
    "Piscine",
    "Climatisation",
    "Cuisine équipée",
    "Télévision",
    "Lave-linge",
    "Terrasse",
    "Jardin",
    "Sécurité 24h/24",
    "Petit déjeuner",
] as const;

// 2) Synonymes/variantes -> libellé canonique
const AMENITY_SYNONYMS: Record<string, string> = {
    // Petit déjeuner
    "petit dejeuner": "Petit déjeuner",
    "petit-déjeuner": "Petit déjeuner",
    "petit-dejeuner": "Petit déjeuner",
    "breakfast": "Petit déjeuner",
};

function cleanupBase(name: string): string {
    return (name || "")
        .trim()
        .replace(/\s+/g, " ") // espaces multiples -> simple espace
        .replace(/[‐‑‒–—―]/g, "-") // normaliser tirets unicode en '-'
        .toLowerCase();
}

// 3) Normalisation écriture/lecture
export function normalizeAmenity(name: string): string {
    const raw = (name || "").trim();
    if (!raw) return "";

    const base = cleanupBase(raw)
        .replace(/-/g, "-")
        .replace(/dejeuner/g, "dejeuner"); // base FR sans accents pour mapping simple

    // supprimer accents pour la clé de mapping simple
    const key = base
        .normalize("NFD")
        .replace(/\p{Diacritic}+/gu, "");

    const mapped = AMENITY_SYNONYMS[key];
    if (mapped) return mapped;

    // Si déjà un libellé canonique (case/espaces différents), le renvoyer dans sa forme canonique
    const maybeCanonical = AMENITIES_CANONICAL.find((c) => cleanupBase(c) === cleanupBase(raw));
    if (maybeCanonical) return maybeCanonical;

    // Sinon on renvoie la version trim d'origine pour ne pas perdre l'info
    if (process?.env?.NODE_ENV !== 'production') {
        // Observabilité minimale pour futures harmonisations
        try { console.warn("[amenities] Valeur non normalisée:", raw); } catch (e) { /* noop */ }
    }
    return raw;
}

export function normalizeAmenities(list: unknown): string[] {
    const arr = Array.isArray(list) ? list as string[] : [];
    const set = new Set<string>();
    for (const item of arr) {
        const n = normalizeAmenity(item);
        if (n) set.add(n);
    }
    return Array.from(set);
}

// 4) Mapping des icônes par libellé canonique
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
    "Petit déjeuner": Coffee,
};

export function getAmenityIcon(name: string): AmenityIcon {
    // reconnaître variantes et renvoyer l'icône du canonique
    const canonical = normalizeAmenity(name);
    return AMENITY_ICONS[canonical] ?? Wifi; // fallback sûr
}