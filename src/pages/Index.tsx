import { Search, MapPin, Star, Users, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { REGIONS, SHOW_EMPTY_REGIONS, mapLocationToRegion, RegionSlug } from "@/utils/regions";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState("");
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [regionCounts, setRegionCounts] = useState<Record<RegionSlug, number>>({
    'dakar': 0,
    'saint-louis': 0,
    'saly': 0,
    'casamance': 0,
    'sine-saloum': 0,
    'goree': 0,
    'lompoul': 0,
    'thies': 0,
  });

  useEffect(() => {
    const loadCounts = async () => {
      try {
        setLoadingRegions(true);
        const { data, error } = await supabase
          .from('properties')
          .select('id, city, address')
          .eq('is_active', true)
          .or('long_term_enabled.is.null,long_term_enabled.eq.false');
        if (error) throw error;
        const base: Record<RegionSlug, number> = REGIONS.reduce((acc, r) => {
          acc[r.slug] = 0;
          return acc;
        }, {} as Record<RegionSlug, number>);
        for (const p of data || []) {
          const region = mapLocationToRegion(p.city as string | undefined, p.address as string | undefined);
          if (region) base[region]++;
        }
        setRegionCounts(base);
      } catch (e) {
        console.error('Erreur chargement des régions:', e);
      } finally {
        setLoadingRegions(false);
      }
    };
    loadCounts();
  }, []);
  
  const handleSearch = () => {
    if (searchLocation.trim()) {
      // Convertir la recherche en slug utilisable
      const locationSlug = searchLocation.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ç]/g, 'c');
      
      navigate(`/destination/${locationSlug}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Découvrez le <span className="text-primary">Sénégal</span> autrement
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Réservez des logements uniques chez l'habitant et vivez une expérience authentique au cœur de la Téranga sénégalaise.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-6 border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Où allez-vous ?" 
                  className="pl-10"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Input type="date" placeholder="Arrivée" />
              <Input type="date" placeholder="Départ" />
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Voyageurs" 
                  className="pl-10"
                />
              </div>
            </div>
            <Button className="w-full md:w-auto mt-4" size="lg" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </Button>
          </div>
        </div>
      </section>

      {/* Régions */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Explorer par régions</h2>
          {loadingRegions ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {REGIONS.filter(r => SHOW_EMPTY_REGIONS || regionCounts[r.slug] > 0).map((region) => (
                <Link key={region.slug} to={`/destination/${region.slug}`} aria-label={`Voir les logements en ${region.name}`}>
                  <Card
                    className="group relative overflow-hidden border-0 rounded-xl shadow-sm bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-transform duration-200 will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]"
                  >
                    <div className="relative" style={{ aspectRatio: '995/576' }}>
                      <img
                        src={region.image}
                        alt={region.name}
                        loading="lazy"
                        className="h-full w-full object-cover transform-gpu transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                        style={{ width: '995px', height: '576px', maxWidth: '100%', maxHeight: '100%' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-200" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {region.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-white/80 text-black shadow-sm">
                            <Tag className="h-3 w-3 mr-1" />{tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white drop-shadow">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white inline-block bg-black/60 supports-[backdrop-filter]:bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md ring-1 ring-white/10">{region.name}</h3>
                          <span className="text-sm bg-black/60 supports-[backdrop-filter]:bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 ring-1 ring-white/10">
                            {regionCounts[region.slug]} logements
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Recherchez</h3>
              <p className="text-muted-foreground">
                Trouvez le logement parfait selon vos critères et votre destination
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Réservez</h3>
              <p className="text-muted-foreground">
                Réservez en toute sécurité avec paiement mobile ou carte bancaire
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Profitez</h3>
              <p className="text-muted-foreground">
                Vivez une expérience unique et partagez vos souvenirs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Prêt à découvrir le Sénégal ?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Rejoignez notre communauté et commencez votre aventure dès aujourd'hui
            </p>
            <Button size="lg" asChild>
              <a href="/auth">Commencer l'aventure</a>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
