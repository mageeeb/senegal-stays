import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import {
  ArrowLeft, Car, Users, Settings, MapPin, Fuel, Calendar, 
  Star, Shield, CheckCircle2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VehicleBookingForm } from "@/components/VehicleBookingForm";
import { useAuth } from "@/hooks/useAuth";

interface VehicleImage {
  id: string;
  image_url: string;
  is_cover: boolean;
  alt_text: string | null;
  sort_order: number;
}

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
  is_available: boolean;
  owner_id: string;
  created_at: string;
  images?: VehicleImage[];
}

interface Profile {
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

const VehicleDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVehicle();
    }
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      
      // Récupérer le véhicule
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .eq('is_available', true)
        .maybeSingle();

      if (vehicleError) throw vehicleError;
      
      if (!vehicleData) {
        console.error('Vehicle not found');
        return;
      }

      // Récupérer les images du véhicule
      const { data: imagesData, error: imagesError } = await supabase
        .from('vehicle_images')
        .select('*')
        .eq('vehicle_id', id)
        .order('sort_order');

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
      }

      // Récupérer les infos du propriétaire
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('user_id', vehicleData.owner_id)
        .maybeSingle();

      if (ownerError) {
        console.error('Error fetching owner:', ownerError);
      }

      setVehicle({ ...vehicleData, images: imagesData || [] });
      setOwner(ownerData);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'economique': return 'bg-green-100 text-green-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'suv': return 'bg-orange-100 text-orange-800';
      case '4x4': return 'bg-red-100 text-red-800';
      case 'utilitaire': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getFuelTypeLabel = (fuelType: string) => {
    switch (fuelType) {
      case 'petrol': return 'Essence';
      case 'diesel': return 'Diesel';
      case 'hybrid': return 'Hybride';
      case 'electric': return 'Électrique';
      default: return fuelType;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Véhicule non trouvé</h1>
          <Button onClick={() => navigate('/vehicles')}>
            Retour aux véhicules
          </Button>
        </div>
      </div>
    );
  }

  // Utiliser les images de la table vehicle_images ou l'image_url par défaut
  const displayImages = vehicle.images && vehicle.images.length > 0 
    ? vehicle.images 
    : vehicle.image_url 
      ? [{ id: '1', image_url: vehicle.image_url, is_cover: true, alt_text: vehicle.name, sort_order: 0 }]
      : [];

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Bouton retour */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/vehicles')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux véhicules
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Section principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Images */}
              <div className="space-y-4">
                {displayImages.length > 0 && (
                  <div className="grid gap-4">
                    <div className="aspect-video">
                      <img
                        src={displayImages[0].image_url}
                        alt={vehicle.name}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                    </div>
                    {displayImages.length > 1 && (
                      <div className="grid grid-cols-3 gap-4">
                        {displayImages.slice(1, 4).map((image, index) => (
                          <div key={index} className="aspect-video">
                            <img
                              src={image.image_url}
                              alt={`${vehicle.name} ${index + 2}`}
                              className="w-full h-full object-cover rounded-lg border"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Informations du véhicule */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{vehicle.name}</h1>
                  <Badge className={getCategoryColor(vehicle.category)}>
                    {vehicle.category}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground text-lg">
                  {vehicle.brand} {vehicle.model} ({vehicle.year})
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{vehicle.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span>4.8 (12 avis)</span>
                  </div>
                </div>
              </div>

              {/* Caractéristiques */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Caractéristiques du véhicule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{vehicle.seats} places</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span className="text-sm">
                        {vehicle.transmission === 'manual' ? 'Manuelle' : 'Automatique'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4" />
                      <span className="text-sm">{getFuelTypeLabel(vehicle.fuel_type)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      <span className="text-sm">{vehicle.doors} portes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Équipements */}
              {vehicle.features && vehicle.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Équipements inclus
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vehicle.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              {vehicle.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {vehicle.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Propriétaire */}
              {owner && (
                <Card>
                  <CardHeader>
                    <CardTitle>Propriétaire</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        {owner.avatar_url ? (
                          <img 
                            src={owner.avatar_url} 
                            alt={`${owner.first_name} ${owner.last_name}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-primary font-medium">
                            {owner.first_name?.[0]}{owner.last_name?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {owner.first_name} {owner.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">Propriétaire</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar de réservation */}
            <div className="space-y-6">
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {formatPrice(vehicle.price_per_day)}
                    </div>
                    <div className="text-muted-foreground">par jour</div>
                  </div>
                  
                  <Button 
                    onClick={() => setShowBookingForm(true)}
                    className="w-full"
                    size="lg"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Réserver maintenant
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Vous ne serez débité qu'après confirmation
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <VehicleBookingForm
        vehicle={vehicle}
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
      />
    </>
  );
};

export default VehicleDetail;