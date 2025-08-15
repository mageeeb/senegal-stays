import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PropertyImage { id: string; image_url: string; is_cover: boolean; alt_text: string | null; sort_order: number; }
interface Property {
  id: string;
  title: string;
  city: string;
  price_per_night: number;
  long_term_enabled: boolean | null;
  amenities: string[] | null;
  property_images?: PropertyImage[];
}

const Logements = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Nightly filters
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [city, setCity] = useState<string>("all");

  const fetchProperties = async () => {
    setLoading(true);
    // Base query: active properties in Senegal, NOT long-term
    let query: any = (supabase as any)
      .from('properties')
      .select(`id, title, city, price_per_night, long_term_enabled, amenities, property_images ( id, image_url, is_cover, alt_text, sort_order )`)
      .eq('is_active', true)
      .eq('country', 'Senegal')
      .or('long_term_enabled.is.null,long_term_enabled.eq.false')
      .order('created_at', { ascending: false });

    if (city && city !== 'all') query = query.eq('city', city);

    const { data, error } = await query;
    if (!error && data) {
      let list = data.map((p: any) => ({
        ...p,
        property_images: (p.property_images || []).sort((a: PropertyImage, b: PropertyImage) => a.sort_order - b.sort_order)
      })) as Property[];

      // Client-side nightly price filter (MVP)
      list = list.filter(p => {
        const pn = Number(p.price_per_night || 0);
        if (minPrice && pn < Number(minPrice)) return false;
        if (maxPrice && pn > Number(maxPrice)) return false;
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

  // Basic per-page SEO + analytics tag
  useEffect(() => {
    document.title = "Logements | Réservations à la nuit";
    const desc = "Trouvez des logements disponibles à la nuit au Sénégal.";
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
    link.href = window.location.origin + "/logements";

    // Analytics tagging
    try {
      window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'page_view', section: 'nightly' } }));
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
                alt="Logo - logements"
                className="h-12 md:h-16 object-contain"
                loading="lazy"
              />
              <h1 className="text-3xl md:text-4xl font-bold">Logements à la nuit</h1>
              <p className="text-muted-foreground max-w-2xl">
                Réservez des logements disponibles à la nuit partout au Sénégal.
              </p>
            </div>

            <div className="mt-6 md:mt-8">
              <Card className="shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                      <label className="text-sm text-muted-foreground">Prix min (FCFA/nuit)</label>
                      <Input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="15000" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Prix max (FCFA/nuit)</label>
                      <Input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="200000" />
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full" onClick={fetchProperties}>Rechercher</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-semibold">Résultats</h2>
            <Badge variant="secondary">{properties.length} logements</Badge>
          </div>

          {loading ? (
            <div>Chargement...</div>
          ) : properties.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[12,13,14].map((n) => (
                <Card key={n} className="overflow-hidden">
                  <img src={`/img/destPop/${n}.jpg`} alt="Exemple de logement" className="w-full h-48 object-cover" loading="lazy" />
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold line-clamp-1">Exemple de logement</h3>
                      <Badge variant="secondary">Nuitée</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">Ville populaire</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold tabular-nums">25 000 FCFA</span>
                      <span className="text-sm text-muted-foreground">/ nuit</span>
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
                        <Badge variant="secondary">Nuitée</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{p.city}</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold tabular-nums">{Number(p.price_per_night || 0).toLocaleString()} FCFA</span>
                        <span className="text-sm text-muted-foreground">/ nuit</span>
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

export default Logements;
