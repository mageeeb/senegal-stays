import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import { ArrowLeft, Star, MapPin, Users, Bed, Bath, Wifi, Car, Waves } from "lucide-react";

const Destination = () => {
  const { area } = useParams();

  // Mock data pour les logements
  const properties = [
    {
      id: 1,
      title: "Villa moderne avec piscine",
      image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=400&fit=crop",
      price: 45000,
      rating: 4.9,
      reviews: 128,
      guests: 6,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ["Piscine", "WiFi", "Parking", "Climatisation"],
      host: "Aminata D."
    },
    {
      id: 2,
      title: "Appartement cosy centre-ville",
      image: "https://images.unsplash.com/photo-1466442929976-97f336a657be?w=600&h=400&fit=crop",
      price: 25000,
      rating: 4.7,
      reviews: 89,
      guests: 4,
      bedrooms: 2,
      bathrooms: 1,
      amenities: ["WiFi", "Cuisine équipée", "Terrasse"],
      host: "Moussa S."
    },
    {
      id: 3,
      title: "Maison traditionnelle authentique",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&h=400&fit=crop",
      price: 35000,
      rating: 4.8,
      reviews: 156,
      guests: 8,
      bedrooms: 4,
      bathrooms: 3,
      amenities: ["Jardin", "WiFi", "Parking", "Cuisine"],
      host: "Fatou K."
    },
    {
      id: 4,
      title: "Studio moderne proche plage",
      image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=400&fit=crop",
      price: 18000,
      rating: 4.6,
      reviews: 67,
      guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ["Vue mer", "WiFi", "Climatisation"],
      host: "Ibrahima L."
    },
    {
      id: 5,
      title: "Villa de luxe avec vue panoramique",
      image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&h=400&fit=crop",
      price: 75000,
      rating: 4.9,
      reviews: 203,
      guests: 10,
      bedrooms: 5,
      bathrooms: 4,
      amenities: ["Piscine", "Jardin", "Parking", "WiFi", "Chef privé"],
      host: "Mariama B."
    },
    {
      id: 6,
      title: "Chambre chez l'habitant",
      image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=400&fit=crop",
      price: 12000,
      rating: 4.5,
      reviews: 45,
      guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ["Petit-déjeuner", "WiFi", "Accueil familial"],
      host: "Ousmane D."
    }
  ];

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="relative">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md">
                    <div className="flex items-center text-sm">
                      <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                      {property.rating}
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg leading-tight">{property.title}</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    Hôte: {property.host}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {property.guests}
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
                    {property.amenities.slice(0, 3).map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {property.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{property.amenities.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-lg">{property.price.toLocaleString()} FCFA</span>
                      <span className="text-muted-foreground text-sm"> / nuit</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                      {property.rating} ({property.reviews})
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Destination;