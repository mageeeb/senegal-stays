import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { VillesPopulairesLongSejour } from "@/components/VillesPopulairesLongSejour";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

interface PropertyImage { id: string; image_url: string; is_cover: boolean; alt_text: string | null; sort_order: number; }
interface Property {
  id: string;
  title: string;
  city: string;
  price_per_night: number;
  monthly_price: number | null;
  long_term_enabled: boolean;
  min_months: number | null;
  furnished: boolean | null;
  utilities_included: boolean | null;
  amenities: string[] | null;
  property_images?: PropertyImage[];
}

type TabletSearchProps = {
  city: string;
  setCity: (v: string) => void;
  minBudget: string;
  setMinBudget: (v: string) => void;
  maxBudget: string;
  setMaxBudget: (v: string) => void;
  furnished: string; // 'all' | 'true' | 'false'
  setFurnished: (v: string) => void;
  onSearch: () => void;
  uniqueCities: string[];
};

const TabletSearchBlock = ({
  city,
  setCity,
  minBudget,
  setMinBudget,
  maxBudget,
  setMaxBudget,
  furnished,
  setFurnished,
  onSearch,
  uniqueCities,
}: TabletSearchProps) => {
  const [error, setError] = useState<string>("");

  const handleSearch = () => {
    // Validation: Budget min ≤ Budget max (if both provided)
    const min = minBudget ? parseInt(minBudget, 10) : undefined;
    const max = maxBudget ? parseInt(maxBudget, 10) : undefined;
    if (min !== undefined && max !== undefined && !Number.isNaN(min) && !Number.isNaN(max)) {
      if (min > max) {
        setError("Le budget min doit être inférieur ou égal au budget max.");
        return;
      }
    }
    setError("");
    onSearch();
  };

  const toggleFurnished = (next: 'true' | 'false') => {
    // Allow no default: clicking the active option again resets to 'all'
    if (furnished === next) setFurnished('all');
    else setFurnished(next);
  };

  return (
    <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
      {/* Row 1 */}
      <div className="col-span-1">
        <label className="text-sm text-muted-foreground mb-1 block">Ville</label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Toutes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {uniqueCities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-1">
        <label className="text-sm text-muted-foreground mb-1 block">Budget min (FCFA/mois)</label>
        <Input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          className="h-11"
          value={minBudget}
          onChange={(e) => setMinBudget(e.target.value)}
          placeholder="200000 (FCFA/mois)"
          aria-label="Budget minimum par mois en FCFA"
        />
      </div>
      {/* Row 2 */}
      <div className="col-span-1">
        <label className="text-sm text-muted-foreground mb-1 block">Budget max (FCFA/mois)</label>
        <Input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          className="h-11"
          value={maxBudget}
          onChange={(e) => setMaxBudget(e.target.value)}
          placeholder="1000000 (FCFA/mois)"
          aria-label="Budget maximum par mois en FCFA"
        />
      </div>
      <div className="col-span-1 flex items-end">
        <div className="w-full flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            <label className="text-sm text-muted-foreground mb-1 block">Meublé</label>
            <div role="group" aria-label="Filtre meublé" className="inline-flex rounded-md border overflow-hidden">
              <button
                type="button"
                className={`px-4 h-11 min-w-[64px] text-sm ${furnished === 'true' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
                aria-pressed={furnished === 'true'}
                onClick={() => toggleFurnished('true')}
              >
                Oui
              </button>
              <button
                type="button"
                className={`px-4 h-11 min-w-[64px] text-sm border-l ${furnished === 'false' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
                aria-pressed={furnished === 'false'}
                onClick={() => toggleFurnished('false')}
              >
                Non
              </button>
            </div>
          </div>
          <div className="flex items-end justify-end">
            <Button className="h-11 px-6" size="lg" onClick={handleSearch} aria-label="Lancer la recherche">
              Rechercher
            </Button>
          </div>
        </div>
      </div>
      {error ? (
        <div className="col-span-2 -mt-2" role="alert" aria-live="polite">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}
    </div>
  );
};

const LongStays = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [minBudget, setMinBudget] = useState<string>("");
  const [maxBudget, setMaxBudget] = useState<string>("");
  const [city, setCity] = useState<string>("all");
  const [furnished, setFurnished] = useState<string>("all"); // 'all', 'true', 'false'
  const [utilities, setUtilities] = useState<string>("all");

  const fetchProperties = async () => {
    setLoading(true);
    // Cast to any to avoid deep TS instantiation from Supabase generics (types are not generated in this project)
    let query: any = (supabase as any)
      .from('properties')
      .select(`id, title, city, price_per_night, monthly_price, long_term_enabled, min_months, furnished, utilities_included, amenities, property_images ( id, image_url, is_cover, alt_text, sort_order )`)
      .eq('is_active', true)
      .eq('long_term_enabled', true)
      .eq('country', 'Senegal')
      .gt('monthly_price', 0)
      .order('created_at', { ascending: false });

    if (city && city !== 'all') query = query.eq('city', city);
    const { data, error } = await query;
    if (!error && data) {
      let list = data.map((p: any) => ({
        ...p,
        property_images: (p.property_images || []).sort((a: PropertyImage, b: PropertyImage) => a.sort_order - b.sort_order)
      })) as Property[];

      // Client-side additional filters for MVP
      list = list.filter(p => {
        const mp = Number(p.monthly_price || 0);
        if (minBudget && mp < Number(minBudget)) return false;
        if (maxBudget && mp > Number(maxBudget)) return false;
        if (furnished === 'true' && p.furnished !== true) return false;
        if (furnished === 'false' && p.furnished !== false) return false;
        if (utilities === 'true' && p.utilities_included !== true) return false;
        return true;
      });

      setProperties(list);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  // Basic per-page SEO
  useEffect(() => {
    document.title = "Séjours longue durée | Locations mensuelles";
    const desc = "Trouvez des locations meublées longue durée au meilleur prix. Exemples inclus.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = desc;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = window.location.origin + "/long-stays";

    // Analytics tagging
    try {
      window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'page_view', section: 'monthly' } }));
    } catch {}
  }, []);

  const uniqueCities = Array.from(new Set(properties.map(p => p.city))).sort();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="border-b bg-muted/40">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col items-center text-center gap-4">
              <img
                src="/favicon.ico"
                alt="Logo - séjours longue durée"
                className="h-12 md:h-16 object-contain"
                loading="lazy"
              />
              <h1 className="text-3xl md:text-4xl font-bold">Locations longue durée</h1>
              <p className="text-muted-foreground max-w-2xl">
                Trouvez un logement pour plusieurs mois, meublé ou non, avec ou sans charges incluses.
              </p>
            </div>

            <div className="mt-6 md:mt-8">
              <Card className="shadow-sm">
                <CardContent className="p-4 md:p-6">
                  {/* Tablet-specific 2x2 layout (769–1024px) */}
                  <TabletSearchBlock
                    city={city}
                    setCity={setCity}
                    minBudget={minBudget}
                    setMinBudget={setMinBudget}
                    maxBudget={maxBudget}
                    setMaxBudget={setMaxBudget}
                    furnished={furnished}
                    setFurnished={setFurnished}
                    onSearch={fetchProperties}
                    uniqueCities={uniqueCities}
                  />

                  {/* Default layout for mobile (<769px) and desktop (>=1024px) */}
                  <div className="block md:hidden lg:block">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground">Ville</label>
                        <Select value={city} onValueChange={setCity}>
                          <SelectTrigger>
                            <SelectValue placeholder="Toutes" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Toutes</SelectItem>
                            {uniqueCities.map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Budget min (FCFA/mois)</label>
                        <Input type="number" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} placeholder="200000" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Budget max (FCFA/mois)</label>
                        <Input type="number" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} placeholder="1000000" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Meublé</label>
                        <Select value={furnished} onValueChange={setFurnished}>
                          <SelectTrigger>
                            <SelectValue placeholder="Meublé ?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="true">Meublé</SelectItem>
                            <SelectItem value="false">Non meublé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button className="w-full" onClick={fetchProperties}>Rechercher</Button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground">Charges</label>
                        <Select value={utilities} onValueChange={setUtilities}>
                          <SelectTrigger>
                            <SelectValue placeholder="Charges incluses ?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="true">Charges incluses</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <h2 className="text-xl font-semibold mb-4">Villes populaires</h2>
          <VillesPopulairesLongSejour
            onSelectCity={(selected) => {
              setCity(selected);
              window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
            }}
          />
        </section>

        <section className="container mx-auto px-4 pb-10">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-semibold">Résultats</h2>
            <Badge variant="secondary">{properties.length} logements</Badge>
          </div>

          {loading ? (
            <div>Chargement...</div>
          ) : properties.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[5,6,7].map((n) => (
                <Card key={n} className="overflow-hidden">
                  <img src={`/img/destPop/${n}.jpg`} alt="Exemple de logement longue durée" className="w-full h-48 object-cover" loading="lazy" />
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold line-clamp-1">Exemple d'appartement meublé</h3>
                      <Badge variant="secondary">Longue durée</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">Ville populaire</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold tabular-nums">350 000 FCFA</span>
                      <span className="text-sm text-muted-foreground">/ mois</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline">Charges incluses</Badge>
                      <Badge variant="outline">Meublé</Badge>
                      <Badge variant="outline">3 mois min</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {properties.map((p) => (
                <Link key={p.id} to={`/property/${p.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition">
                    {p.property_images && p.property_images[0] ? (
                      <img src={p.property_images[0].image_url} alt={p.title} className="w-full h-48 object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-48 bg-muted" />
                    )}
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold line-clamp-1">{p.title}</h3>
                        <Badge variant="secondary">Longue durée</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{p.city}</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold tabular-nums">{Number(p.monthly_price || 0).toLocaleString()} FCFA</span>
                        <span className="text-sm text-muted-foreground">/ mois</span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        {p.utilities_included ? <Badge variant="outline">Charges incluses</Badge> : null}
                        {p.furnished ? <Badge variant="outline">Meublé</Badge> : <Badge variant="outline">Non meublé</Badge>}
                        {p.min_months ? <Badge variant="outline">{p.min_months} mois min</Badge> : null}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default LongStays;
