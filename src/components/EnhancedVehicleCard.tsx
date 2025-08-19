import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Settings, MapPin, Fuel, Calendar } from "lucide-react";
import { VehicleBookingForm } from "./VehicleBookingForm";

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
  is_available?: boolean;
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const EnhancedVehicleCard = ({ vehicle }: VehicleCardProps) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const isAvailable = vehicle.is_available !== false;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'economy': return 'bg-green-100 text-green-800';
      case 'compact': return 'bg-blue-100 text-blue-800';
      case 'suv': return 'bg-orange-100 text-orange-800';
      case 'luxury': return 'bg-purple-100 text-purple-800';
      case 'van': return 'bg-gray-100 text-gray-800';
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

  const featureBadges = () => {
    const badges: string[] = [];
    if (vehicle.transmission === 'automatic' || vehicle.transmission === 'automatique') badges.push('Automatique');
    if (vehicle.transmission === 'manual') badges.push('Manuelle');
    if (vehicle.features?.some(f => /clim|air.?condition/i.test(f))) badges.push('Clim');
    if (vehicle.features?.some(f => /illimit|km/i.test(f))) badges.push('KM inclus');
    if (vehicle.features?.some(f => /annulation|flex/i.test(f))) badges.push('Annulation flexible');
    return badges;
  };

  return (
    <>
      <Card className="group rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 border-border/60">
        <CardHeader className="p-0">
          <div className="relative">
            <Link to={`/vehicle/${vehicle.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
              <div className="aspect-[16/10] w-full bg-muted/40">
                <img
                  src={vehicle.image_url || '/img/destPop/1.jpg'}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </Link>
            <Badge className={`absolute top-2 right-2 ${getCategoryColor(vehicle.category)}`}>
              {vehicle.category}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <CardTitle className="text-lg leading-tight">
              <Link to={`/vehicle/${vehicle.id}`} className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded">
                {vehicle.name}
              </Link>
            </CardTitle>
            <div className="flex items-center gap-1 text-amber-500 text-sm" aria-label="Note moyenne">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.869 1.402-8.168L.132 9.21l8.2-1.192z"/></svg>
              <span>4.7</span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mb-3">
            {vehicle.brand} {vehicle.model} ({vehicle.year})
          </p>
          
          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{vehicle.seats} places</span>
            </div>
            <div className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>{vehicle.transmission === 'manual' ? 'Manuelle' : 'Automatique'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Fuel className="h-4 w-4" />
              <span className="capitalize">{vehicle.fuel_type}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{vehicle.location}</span>
            </div>
          </div>

          {(vehicle.features && vehicle.features.length > 0) || featureBadges().length > 0 ? (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1.5">
                {featureBadges().map((b, idx) => (
                  <Badge key={`fb-${idx}`} variant="outline" className="text-xs">
                    {b}
                  </Badge>
                ))}
                {vehicle.features?.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {vehicle.features && vehicle.features.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{vehicle.features.length - 3} autres
                  </Badge>
                )}
              </div>
            </div>
          ) : null}

          {vehicle.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {vehicle.description}
            </p>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-col gap-3">
          <div className="w-full flex items-center justify-between">
            <div className="text-right ml-auto">
              <div className="text-2xl font-bold text-primary tabular-nums">
                {formatPrice(vehicle.price_per_day)}
              </div>
              <div className="text-sm text-muted-foreground">par jour</div>
            </div>
          </div>
          <Button
            onClick={() => setShowBookingForm(true)}
            className="w-full"
            size="lg"
            aria-label={`Réserver ${vehicle.name}`}
            disabled={!isAvailable}
            title={!isAvailable ? 'Non disponible' : undefined}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Réserver
          </Button>
        </CardFooter>
      </Card>

      <VehicleBookingForm
        vehicle={vehicle}
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
      />
    </>
  );
};

export default EnhancedVehicleCard;
