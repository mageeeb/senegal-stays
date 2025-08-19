import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Car, RefreshCcw } from "lucide-react";
import EnhancedVehicleCard from "./EnhancedVehicleCard";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  fuel_type: string;
  transmission: string;
  seats: number;
  doors: number;
  price_per_day: number;
  image_url?: string;
  features: string[];
  location: string;
  description?: string;
}

export const VehiclesList = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [transmission, setTransmission] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("is_available", true)
        .order("price_per_day", { ascending: true });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des véhicules:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les véhicules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || vehicle.category === selectedCategory;
    const matchesLocation = selectedLocation === "all" || vehicle.location === selectedLocation;
    const matchesTransmission = transmission === "all" || vehicle.transmission === transmission;
    
    let matchesPrice = true;
    if (priceRange !== "all") {
      const price = vehicle.price_per_day;
      switch (priceRange) {
        case "0-30000":
          matchesPrice = price <= 30000;
          break;
        case "30000-50000":
          matchesPrice = price > 30000 && price <= 50000;
          break;
        case "50000+":
          matchesPrice = price > 50000;
          break;
      }
    }

    return matchesSearch && matchesCategory && matchesLocation && matchesTransmission && matchesPrice;
  });

  const categories = [...new Set(vehicles.map(v => v.category))];
  const locations = [...new Set(vehicles.map(v => v.location))];

  if (loading) {
    // Skeletons while loading
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Chargement des filtres...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="rounded-xl overflow-hidden">
              <Skeleton className="aspect-[16/10] w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" /> Filtres
            </span>
            <Button variant="outline" size="sm" onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedLocation("all");
              setPriceRange("all");
              setTransmission("all");
            }}>
              <RefreshCcw className="h-3.5 w-3.5 mr-2" /> Réinitialiser
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un véhicule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Lieu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les lieux</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Prix par jour" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les prix</SelectItem>
                <SelectItem value="0-30000">Moins de 30 000 FCFA</SelectItem>
                <SelectItem value="30000-50000">30 000 - 50 000 FCFA</SelectItem>
                <SelectItem value="50000+">Plus de 50 000 FCFA</SelectItem>
              </SelectContent>
            </Select>

            <Select value={transmission} onValueChange={setTransmission}>
              <SelectTrigger>
                <SelectValue placeholder="Transmission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes transmissions</SelectItem>
                <SelectItem value="manual">Manuelle</SelectItem>
                <SelectItem value="automatic">Automatique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active filters chips */}
          {(searchTerm || selectedCategory !== 'all' || selectedLocation !== 'all' || priceRange !== 'all' || transmission !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchTerm && <Badge variant="secondary">Recherche: {searchTerm}</Badge>}
              {selectedCategory !== 'all' && <Badge variant="secondary">Catégorie: {selectedCategory}</Badge>}
              {selectedLocation !== 'all' && <Badge variant="secondary">Lieu: {selectedLocation}</Badge>}
              {priceRange !== 'all' && <Badge variant="secondary">Prix: {priceRange}</Badge>}
              {transmission !== 'all' && <Badge variant="secondary">Trans.: {transmission === 'manual' ? 'Manuelle' : 'Automatique'}</Badge>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résultats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Car className="h-5 w-5" />
            Véhicules disponibles ({filteredVehicles.length})
          </h2>
        </div>

        {filteredVehicles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun véhicule trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedLocation("all");
                setPriceRange("all");
                setTransmission("all");
              }}>Réinitialiser les filtres</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVehicles.map((vehicle) => (
              <EnhancedVehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};