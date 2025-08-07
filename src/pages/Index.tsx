import { Search, MapPin, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState("");
  
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

      {/* Popular Destinations */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Destinations populaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dakar */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-center">Dakar</h3>
              <div className="space-y-4">
                {[
                  { 
                    name: 'Plateau', 
                    description: 'Centre-ville historique', 
                    rating: '4.9', 
                    properties: '45',
                    image: '/img/destPop/5.jpg'
                  },
                  { 
                    name: 'Sine-Saloum',
                    description: 'Quartier résidentiel chic', 
                    rating: '4.8', 
                    properties: '32',
                    image: '/img/destPop/9.jpg'
                  },
                  { 
                    name: 'Ngor', 
                    description: 'Village de pêcheurs authentique', 
                    rating: '4.7', 
                    properties: '28',
                    image: '/img/destPop/10.jpg'
                  }
                ].map((area) => (
                  <Link key={area.name} to={`/destination/${area.name.toLowerCase()}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105">
                      <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url(${area.image})` }}>
                        <div className="absolute inset-0 bg-black/20"></div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold">{area.name}</h4>
                        <p className="text-sm text-muted-foreground">{area.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="ml-1 text-xs">{area.rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{area.properties} logements</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Saint-Louis */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-center">Saint-Louis</h3>
              <div className="space-y-4">
                {[
                  { 
                    name: 'Île de Saint-Louis', 
                    description: 'Centre historique UNESCO', 
                    rating: '4.9', 
                    properties: '22',
                    image: '/img/destPop/6.jpg'
                  },
                  { 
                    name: 'Lac Rose',
                    description: 'Quartier traditionnel', 
                    rating: '4.6', 
                    properties: '18',
                    image: '/img/destPop/13.jpg'
                  },
                  { 
                    name: 'Cap Skirring',
                    description: 'Plage et nature', 
                    rating: '4.8', 
                    properties: '15',
                    image: '/img/destPop/14.jpg'
                  }
                ].map((area) => (
                  <Link key={area.name} to={`/destination/${area.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105">
                      <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url(${area.image})` }}>
                        <div className="absolute inset-0 bg-black/20"></div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold">{area.name}</h4>
                        <p className="text-sm text-muted-foreground">{area.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="ml-1 text-xs">{area.rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{area.properties} logements</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Saly */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-center">Saly</h3>
              <div className="space-y-4">
                {[
                  { 
                    name: 'Saly Portudal', 
                    description: 'Front de mer touristique', 
                    rating: '4.8', 
                    properties: '38',
                    image: '/img/destPop/3.jpg'
                  },
                  { 
                    name: 'Gorée',
                    description: 'île authentique',
                    rating: '4.7', 
                    properties: '25',
                    image: '/img/destPop/7.jpg'
                  },
                  { 
                    name: 'Desert de Lompoul',
                    description: 'Plages paradisiaques', 
                    rating: '4.9', 
                    properties: '30',
                    image: '/img/destPop/4.jpg'
                  }
                ].map((area) => (
                  <Link key={area.name} to={`/destination/${area.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105">
                      <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url(${area.image})` }}>
                        <div className="absolute inset-0 bg-black/20"></div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold">{area.name}</h4>
                        <p className="text-sm text-muted-foreground">{area.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="ml-1 text-xs">{area.rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{area.properties} logements</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
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
