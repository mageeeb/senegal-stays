import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { Home, DollarSign, Users, Shield, Calendar, Star } from "lucide-react";

const Host = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Devenez hôte avec <span className="text-primary">Teranga Home</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Partagez votre espace, rencontrez des voyageurs du monde entier et générez des revenus complémentaires en toute sécurité.
          </p>
          <Button size="lg" asChild>
            <Link to="/add-property">Commencer maintenant</Link>
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi devenir hôte ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <DollarSign className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Revenus supplémentaires</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gagnez jusqu'à 150,000 FCFA par mois en louant votre espace libre.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Rencontres enrichissantes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Accueillez des voyageurs du monde entier et partagez la culture sénégalaise.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Protection totale</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Assurance couvrant les dommages et support client 24h/24.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Créez votre annonce</h3>
              <p className="text-sm text-muted-foreground">
                Décrivez votre logement en quelques minutes
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Fixez vos tarifs</h3>
              <p className="text-sm text-muted-foreground">
                Déterminez votre prix et vos disponibilités
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Accueillez vos invités</h3>
              <p className="text-sm text-muted-foreground">
                Recevez des réservations et accueillez vos voyageurs
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Recevez vos paiements</h3>
              <p className="text-sm text-muted-foreground">
                Paiement sécurisé 24h après l'arrivée
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Témoignages d'hôtes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                </div>
                <p className="text-muted-foreground mb-4">
                  "Grâce à Teranga Home, je gagne 120,000 FCFA par mois en louant ma chambre d'amis. Les voyageurs sont respectueux et j'adore partager ma culture !"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-foreground font-semibold">AM</span>
                  </div>
                  <div>
                    <p className="font-semibold">Aminata Mbaye</p>
                    <p className="text-sm text-muted-foreground">Hôte depuis 2 ans - Dakar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                </div>
                <p className="text-muted-foreground mb-4">
                  "Ma villa à Saly est toujours réservée ! L'équipe Teranga Home m'aide beaucoup et les paiements arrivent toujours à temps."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-foreground font-semibold">MS</span>
                  </div>
                  <div>
                    <p className="font-semibold">Moussa Sall</p>
                    <p className="text-sm text-muted-foreground">Hôte depuis 3 ans - Saly</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Prêt à devenir hôte ?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Rejoignez plus de 500 hôtes qui font confiance à Teranga Home
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/add-property">Créer mon annonce</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Host;