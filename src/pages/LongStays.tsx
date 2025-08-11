import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

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
    let query = supabase
      .from('properties')
      .select(`*, property_images ( id, image_url, is_cover, alt_text, sort_order )`)
      .eq('is_active', true)
      .eq('long_term_enabled', true)
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

  const uniqueCities = Array.from(new Set(properties.map(p => p.city))).sort();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Séjours Longue Durée</h1>
          <p className="text-muted-foreground">Locations mensuelles (1 mois minimum)</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
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
          <div className="flex items-end gap-2">
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
            <Select value={utilities} onValueChange={setUtilities}>
              <SelectTrigger>
                <SelectValue placeholder="Charges incl." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="true">Charges incluses</SelectItem>
              </SelectContent>
            </Select>
            <button className="text-sm underline" onClick={fetchProperties}>Filtrer</button>
          </div>
        </div>

        {loading ? (
          <div>Chargement...</div>
        ) : properties.length === 0 ? (
          <div>Aucun logement longue durée disponible.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {properties.map((p) => (
              <Link key={p.id} to={`/property/${p.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition">
                  {p.property_images && p.property_images[0] ? (
                    <img src={p.property_images[0].image_url} alt={p.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-200" />
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
      </div>
    </div>
  );
};

export default LongStays;
