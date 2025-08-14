import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import InteractiveMap from "@/components/MapCluster";
import { ArrowLeft, Star, MapPin, Users, Bed, Bath, Wifi, Car, Waves } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAmenityIcon } from "@/utils/amenityIcons";
import { getRegionBySlug, REGION_CITIES, mapLocationToRegion } from "@/utils/regions";
import Gallery from "@/components/Gallery";
interface PropertyImage {
  id: string;
  image_url: string;
  is_cover: boolean;
  alt_text: string | null;
  sort_order: number;
}


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
  images?: PropertyImage[];
  latitude?: number | null;
  longitude?: number | null;
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
      const region = getRegionBySlug(area || '');
      
      // Recherche par ville ou région selon la destination
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_images (
            id,
            image_url,
            is_cover,
            alt_text,
            sort_order
          )
        `)
        .eq('is_active', true)
        .or('long_term_enabled.is.null,long_term_enabled.eq.false');

      if (region) {
        const cities = REGION_CITIES[region.slug];
        if (cities?.length) {
          query = query.in('city', cities);
        }
      } else if (areaInfo.city) {
        // Filtrer par ville selon la destination
        query = query.eq('city', areaInfo.city);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des propriétés:', error);
        return;
      }

      let list = data || [];

      // Si c'est une région mais qu'on n'a pas pu filtrer précisément côté base (variantes), filtrer côté client
      if (region) {
        list = list.filter((p: any) => mapLocationToRegion(p.city, p.address) === region.slug);
      }

      // Trier les images par sort_order pour chaque propriété
      const propertiesWithSortedImages = list.map((property: any) => ({
        ...property,
        images: property.property_images?.sort((a: PropertyImage, b: PropertyImage) => a.sort_order - b.sort_order) || []
      }));

      setProperties(propertiesWithSortedImages);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAreaInfo = (areaSlug: string) => {
    // Si c'est une région (nos 8 blocs), utiliser la config région
    const region = getRegionBySlug(areaSlug);
    if (region) {
      const descriptions: Record<string, string> = {
        'dakar': 'Capitale dynamique du Sénégal, entre patrimoine et modernité',
        'saint-louis': 'Ville historique classée UNESCO au bord du fleuve Sénégal',
        'saly': 'Station balnéaire de la Petite Côte, idéale pour se détendre',
        'casamance': 'Région luxuriante au sud, plages et nature préservée',
        'sine-saloum': 'Delta et mangroves, terres d\'eau et d\'oiseaux',
        'goree': 'Île mémoire, patrimoine et charme authentique',
        'lompoul': 'Dunes orangées et bivouacs au désert de Lompoul',
        'thies': 'Petite Côte et villages côtiers, entre nature et culture',
      };
      return {
        name: region.name,
        description: descriptions[region.slug] || region.name,
        image: region.image,
        regionSlug: region.slug,
      };
    }

    const areaMap = {
      'plateau': {
        name: 'Dakar-Capitale',
        city: 'Dakar',
        description: 'Le cœur historique et administratif de Dakar',
        image: '/img/destPop/15.jpg'
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
        image: '/img/destPop/2.jpg'
      },
      'île-de-saint-louis': {
        name: 'Île de Saint-Louis',
        city: 'Saint-Louis',
        description: 'Centre historique classé au patrimoine mondial de l\'UNESCO',
        image: '/img/destPop/6.jpg'
      },
      'saly-portudal': {
        name: 'Saly Portudal',
        city: 'Saly',
        description: 'Station balnéaire avec plages de sable fin',
        image: '/img/destPop/17.jpg'
      },
      'desert-de-lompoul': {
        name: 'Désert de Lompoul',
        city: 'Lompoul',
        description: 'Unique désert de sable du Sénégal avec ses dunes orangées',
        image: '/img/destPop/4.jpg'
      },
      'goree': {
        name: 'Île de Gorée',
        city: 'Dakar',
        description: 'Île historique marquée par son passé lié à la traite négrière',
        image: '/img/destPop/19.jpg'
      },
      'cap-skirring': {
        name: 'Cap Skirring',
        city: 'Casamance',
        description: 'Station balnéaire paradisiaque au sud du Sénégal',
        image: '/img/destPop/17.jpg'
      }
    } as const;
    
    return (areaMap as any)[areaSlug || ''] || {
      name: 'Lac Rose',
      city: 'Sénégal',
      description: 'Découvrez cette magnifique destination',
      image: '/img/destPop/13.jpg'
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
        <section
            className="relative h-[500px] bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `url(${areaInfo.image})`,
                backgroundPosition: 'center 25%'
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30"></div>
            <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-12">
                <div className="text-white max-w-3xl">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/90 hover:bg-white text-black mb-6 backdrop-blur-sm shadow-lg"
                        asChild
                    >
                        <Link to="/">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Link>
                    </Button>
                    <h1 className="text-5xl font-bold mb-4 drop-shadow-lg text-white">
                        {areaInfo.name}
                    </h1>
                    <p className="text-xl opacity-90 drop-shadow-md">
                        {areaInfo.description}
                    </p>
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

      {/* Properties + Map Split View */}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <Link to={`/property/${property.id}`} key={property.id}>
                      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
                        <div className="relative">
                          {property.images && property.images.length > 0 ? (
                            <Gallery
                              images={property.images}
                              variant="card"
                              showDots={true}
                              showCounter={false}
                              showArrows={false}
                              loop={false}
                            />
                          ) : (
                            <div className="w-full aspect-[4/3] bg-gray-200 overflow-hidden flex items-center justify-center">
                              <p className="text-muted-foreground">Photo à venir</p>
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md">
                            <div className="flex items-center text-sm">
                              <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                              4.5
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-4 flex flex-col gap-3 grow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg leading-tight line-clamp-2">{property.title}</h3>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
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

                          <div className="mt-auto pt-2 flex justify-between items-center">
                            <div>
                              <span className="font-bold text-lg tabular-nums">{Number(property.price_per_night).toLocaleString()} FCFA</span>
                              <span className="text-muted-foreground text-sm"> / nuit</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                              4.5 (12)
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="lg:sticky lg:top-24 h-[70vh]">
                <InteractiveMap
                  className="h-full w-full"
                  properties={properties.map((p) => ({
                    id: p.id,
                    title: p.title,
                    latitude: p.latitude ?? null,
                    longitude: p.longitude ?? null,
                    price_per_night: p.price_per_night,
                    image_url: p.images && p.images[0] ? p.images[0].image_url : null,
                  }))}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Destination;