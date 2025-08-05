import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import { ArrowLeft, Star, MapPin, Users, Bed, Bath, Wifi, Car, Waves } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Property {
  id: string;
  title: string;
  description: string;
  price_per_night: number;
  address: string;
  city: string;
  property_type: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  is_active: boolean;
  created_at: string;
}

const Destination = () => {
  const { area } = useParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, [area]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const areaInfo = getAreaInfo(area || '');
      
      // Recherche par ville ou région selon la destination
      let query = supabase
        .from('properties')
        .select('*')
        .eq('is_active', true);

      // Filtrer par ville selon la destination
      if (areaInfo.city) {
        query = query.eq('city', areaInfo.city);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors du chargement des propriétés:', error);
        return;
      }

      setProperties(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAreaInfo = (areaSlug: string) => {
    const areaMap: Record<string, any> = {
      'plateau': {
        name: 'Plateau',
        city: 'Dakar',
        description: 'Le cœur historique et administratif de Dakar',
        image: 'https://images.unsplash.com/photo-1466442929976-97f336a657be?w=1200&h=400&fit=crop'
      },
      'almadies': {
        name: 'Almadies',
        city: 'Dakar',
        description: 'Quartier résidentiel huppé avec plages et restaurants',
        image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=1200&h=400&fit=crop'
      },
      'ngor': {
        name: 'Ngor',
        city: 'Dakar',
        description: 'Village de pêcheurs authentique avec île paradisiaque',
        image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200&h=400&fit=crop'
      },
      'île-de-saint-louis': {
        name: 'Île de Saint-Louis',
        city: 'Saint-Louis',
        description: 'Centre historique classé au patrimoine mondial de l\'UNESCO',
        image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&h=400&fit=crop'
      },
      'saly-portudal': {
        name: 'Saly Portudal',
        city: 'Saly',
        description: 'Station balnéaire avec plages de sable fin',
        image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=400&fit=crop'
      },
      'dakar': {
        name: 'Dakar',
        city: 'Dakar',
        description: 'Capitale dynamique du Sénégal',
        image: 'https://images.unsplash.com/photo-1466442929976-97f336a657be?w=1200&h=400&fit=crop'
      }
    };
    
    return areaMap[areaSlug || ''] || {
      name: 'Destination',
      city: 'Sénégal',
      description: 'Découvrez cette magnifique destination',
      image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=1200&h=400&fit=crop'
    };
  };

  const areaInfo = getAreaInfo(area || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Chargement des logements...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${areaInfo.image})` }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 mb-4" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
            </Button>
            <h1 className="text-4xl font-bold mb-2">{areaInfo.name}</h1>
            <p className="text-xl opacity-90">{areaInfo.description}</p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-4 border-b">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-4">
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
              Tous les logements
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
              Maisons entières
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
              Chambres privées
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
              Avec piscine
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
              Vue mer
            </Badge>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Logements à {areaInfo.name}</h2>
            <p className="text-muted-foreground">{properties.length} logements disponibles</p>
          </div>
          
          {properties.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-muted-foreground">Aucun logement disponible pour le moment dans cette destination.</p>
              <Button asChild className="mt-4">
                <Link to="/add-property">Ajouter un logement</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <div className="relative">
                    <div className="w-full h-48 bg-gray-200 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                      <p className="text-muted-foreground">Photo à venir</p>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md">
                      <div className="flex items-center text-sm">
                        <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                        4.5
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg leading-tight">{property.title}</h3>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {property.address}, {property.city}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {property.max_guests}
                      </div>
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {property.bedrooms}
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {property.bathrooms}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {property.amenities?.slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {property.amenities && property.amenities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{property.amenities.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-lg">{Number(property.price_per_night).toLocaleString()} FCFA</span>
                        <span className="text-muted-foreground text-sm"> / nuit</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                        4.5 (12)
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Destination;