import { Search, MapPin, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

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
            <Button className="w-full md:w-auto mt-4" size="lg">
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
            {['Dakar', 'Saint-Louis', 'Saly'].map((city) => (
              <Card key={city} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-r from-primary/20 to-accent/20"></div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{city}</h3>
                  <p className="text-muted-foreground">
                    {city === 'Dakar' && 'La capitale dynamique'}
                    {city === 'Saint-Louis' && 'Patrimoine mondial UNESCO'}
                    {city === 'Saly' && 'Station balnéaire de rêve'}
                  </p>
                  <div className="flex items-center mt-4">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm">4.8 (120+ logements)</span>
                  </div>
                </CardContent>
              </Card>
            ))}
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
