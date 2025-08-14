import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyData } from "../PropertyListingFlow";
import { MapPin, Loader2 } from "lucide-react";
import LocationPickerMap from "@/components/LocationPickerMap";
import { supabase } from "@/integrations/supabase/client";

interface LocationStepProps {
  data: PropertyData;
  updateData: (data: Partial<PropertyData>) => void;
}

export const LocationStep = ({ data, updateData }: LocationStepProps) => {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>(
    data.coordinates || { lat: 14.6937, lng: -17.4441 }
  );
  const [token, setToken] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [precision, setPrecision] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, any>>(new Map());
  const debounceRef = useRef<number | null>(null);
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (!data?.token) throw new Error('MAPBOX_PUBLIC_TOKEN non configuré');
        if (mounted) setToken(data.token as string);
      } catch (e: any) {
        console.error(e);
        if (mounted) setGeoError("Impossible de récupérer la clé de géocodage");
      }
    })();
    return () => { mounted = false; };
  }, []);

  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    "Dakar": { lat: 14.6937, lng: -17.4441 },
    "Saint-Louis": { lat: 16.0181, lng: -16.4934 },
    "Saly": { lat: 14.4503, lng: -16.7615 },
    "Thiès": { lat: 14.7886, lng: -16.9246 },
    "Kaolack": { lat: 14.1617, lng: -16.0734 },
    "Ziguinchor": { lat: 12.5681, lng: -16.2722 },
  };

  const handleCityChange = (city: string) => {
    updateData({ city });
    if (cityCoordinates[city]) {
      setCoordinates(cityCoordinates[city]);
      updateData({ coordinates: cityCoordinates[city] });
    }
  };

  const labelFromFeature = (f: any) => f?.place_name_fr || f?.text_fr || f?.place_name || f?.text || '';
  const precisionFromFeature = (f: any) => {
    const types: string[] = f?.place_type || [];
    const rel: number = f?.relevance ?? 0;
    if (types.includes('address') || types.includes('poi')) return 'Adresse exacte';
    if (types.includes('neighborhood') || types.includes('locality') || rel >= 0.6) return 'Approximation au quartier';
    return 'Approximation';
  };

  const geocode = async (query: string, takeFirst = false) => {
    if (!token || !query || query.trim().length < 3) return;
    const q = query.trim();
    if (cacheRef.current.has(q)) {
      const cached = cacheRef.current.get(q);
      setSuggestions(cached.features);
      setShowSuggestions(!takeFirst);
      if (takeFirst && cached.features[0]) {
        const [lng, lat] = cached.features[0].center;
        const p = precisionFromFeature(cached.features[0]);
        setPrecision(p);
        setCoordinates({ lat, lng });
        updateData({ coordinates: { lat, lng } });
      }
      return;
    }
    try {
      setGeoLoading(true);
      setGeoError(null);
      const params = new URLSearchParams({
        access_token: token,
        language: 'fr',
        country: 'SN',
        limit: '5',
      });
      // Biasing with bbox Senegal
      params.set('bbox', '-17.686,12.332,-11.345,16.692');
      // Proximity if city known
      const prox = data.city && cityCoordinates[data.city] ? cityCoordinates[data.city] : undefined;
      if (prox) params.set('proximity', `${prox.lng},${prox.lat}`);
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erreur réseau');
      const json = await res.json();
      cacheRef.current.set(q, json);
      setSuggestions(json.features || []);
      setShowSuggestions(!takeFirst);
      if (takeFirst && json.features?.[0]) {
        const [lng, lat] = json.features[0].center;
        const p = precisionFromFeature(json.features[0]);
        setPrecision(p);
        setCoordinates({ lat, lng });
        updateData({ coordinates: { lat, lng } });
      }
      if (!json.features || json.features.length === 0) {
        setGeoError("Adresse introuvable, essayez une autre formulation");
      }
    } catch (e) {
      console.error(e);
      setGeoError("Erreur lors du géocodage");
    } finally {
      setGeoLoading(false);
    }
  };

  // Debounce on address changes
  useEffect(() => {
    if (!data.address) { setSuggestions([]); setShowSuggestions(false); return; }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => geocode(data.address), 500);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [data.address, token]);

  const handleSelectSuggestion = (f: any) => {
    const label = labelFromFeature(f);
    updateData({ address: label });
    const [lng, lat] = f.center;
    setCoordinates({ lat, lng });
    updateData({ coordinates: { lat, lng } });
    setPrecision(precisionFromFeature(f));
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  const reverseGeocode = async (lng: number, lat: number) => {
    if (!token) return;
    try {
      const params = new URLSearchParams({
        access_token: token,
        language: 'fr',
      });
      params.set('types', 'address,neighborhood,locality,place');
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const json = await res.json();
      const feat = json.features?.[0];
      if (feat) {
        updateData({ address: labelFromFeature(feat) });
        setPrecision(precisionFromFeature(feat));
      }
    } catch (e) {
      console.warn('Reverse geocode failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="city">Ville *</Label>
        <Select value={data.city} onValueChange={handleCityChange}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Sélectionnez une ville" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Dakar">Dakar</SelectItem>
            <SelectItem value="Saint-Louis">Saint-Louis</SelectItem>
            <SelectItem value="Saly">Saly</SelectItem>
            <SelectItem value="Thiès">Thiès</SelectItem>
            <SelectItem value="Kaolack">Kaolack</SelectItem>
            <SelectItem value="Ziguinchor">Ziguinchor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <Label htmlFor="address">Adresse complète *</Label>
        <Input
          id="address"
          value={data.address}
          onChange={(e) => { setGeoError(null); updateData({ address: e.target.value }); }}
          onBlur={() => geocode(data.address, true)}
          onKeyDown={(e) => {
            if (!showSuggestions || suggestions.length === 0) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
            if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); handleSelectSuggestion(suggestions[activeIndex]); }
            if (e.key === 'Escape') { setShowSuggestions(false); setActiveIndex(-1); }
          }}
          placeholder="Ex: Quartier Almadies, Rue des Ambassades, Villa n°25"
          className="mt-1"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls="address-suggestions"
          aria-autocomplete="list"
        />
        {geoLoading && (
          <div className="absolute right-3 top-9 text-muted-foreground animate-spin" aria-hidden>
            <Loader2 className="h-4 w-4" />
          </div>
        )}
        {showSuggestions && suggestions.length > 0 && (
          <ul
            id="address-suggestions"
            role="listbox"
            className="absolute z-10 mt-1 w-full bg-popover border rounded-md shadow-md max-h-60 overflow-auto"
          >
            {suggestions.map((s, idx) => (
              <li
                key={s.id || idx}
                role="option"
                aria-selected={idx === activeIndex}
                className={`px-3 py-2 cursor-pointer text-sm ${idx === activeIndex ? 'bg-accent' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(s); }}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                {labelFromFeature(s)}
              </li>
            ))}
          </ul>
        )}
        <div className="sr-only" aria-live="polite">
          {geoError ? geoError : precision ? `Précision: ${precision}` : ''}
        </div>
        {geoError && (
          <div className="text-xs text-destructive mt-1">
            {geoError}
            <button
              type="button"
              className="ml-2 underline"
              onClick={() => setShowSuggestions(false)}
            >
              Placer le point manuellement
            </button>
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          Cette adresse ne sera pas visible dans l'annonce pour des raisons de sécurité
        </p>
      </div>

      <div>
        <Label>Localisation sur la carte</Label>
        <LocationPickerMap
          className="mt-2"
          value={coordinates}
          animate={!prefersReducedMotion}
          zoom={precision === 'Adresse exacte' ? 15 : 12}
          onChange={(c) => {
            setCoordinates(c);
            updateData({ coordinates: c });
          }}
          onDragEnd={(c) => reverseGeocode(c.lng, c.lat)}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Point sélectionné: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)} {precision ? `• ${precision}` : ''}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          La localisation exacte sera visible aux invités après réservation
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">À propos de la localisation</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Les invités verront seulement la zone générale avant de réserver. L'adresse exacte 
              leur sera communiquée après confirmation de la réservation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};