import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const Properties = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('host_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos logements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePropertyStatus = async (propertyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: !currentStatus })
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(prev => 
        prev.map(property => 
          property.id === propertyId 
            ? { ...property, is_active: !currentStatus }
            : property
        )
      );

      toast({
        title: "Succès",
        description: `Logement ${!currentStatus ? 'activé' : 'désactivé'}`,
      });
    } catch (error) {
      console.error('Error updating property status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du logement",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mes logements</h1>
            <p className="text-muted-foreground">
              Gérez vos propriétés et leurs annonces
            </p>
          </div>
          <Button onClick={() => window.location.href = '/add-property'}>
            Ajouter un logement
          </Button>
        </div>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-lg mb-4">Vous n'avez pas encore de logements</p>
              <Button onClick={() => window.location.href = '/add-property'}>
                Créer votre première annonce
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {properties.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {property.title}
                        <Badge variant={property.is_active ? "default" : "secondary"}>
                          {property.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </CardTitle>
                      <p className="text-muted-foreground mt-1">
                        {property.address}, {property.city}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => togglePropertyStatus(property.id, property.is_active)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Description</p>
                      <p className="line-clamp-3">{property.description}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <span className="text-sm">{property.property_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Prix/nuit:</span>
                        <span className="text-sm font-medium">{property.price_per_night}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Capacité:</span>
                        <span className="text-sm">{property.max_guests} personnes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Chambres/SDB:</span>
                        <span className="text-sm">{property.bedrooms}ch / {property.bathrooms}sdb</span>
                      </div>
                    </div>
                  </div>
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Équipements:</p>
                      <div className="flex flex-wrap gap-1">
                        {property.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;