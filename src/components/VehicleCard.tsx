import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Users, Settings, MapPin, Fuel, Calendar } from "lucide-react";
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
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const [showBookingForm, setShowBookingForm] = useState(false);

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

  return (
    <>
      <Card className="group hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="p-0">
          <div className="relative">
            <img
              src={vehicle.image_url || '/img/destPop/1.jpg'}
              alt={vehicle.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <Badge className={`absolute top-2 right-2 ${getCategoryColor(vehicle.category)}`}>
              {vehicle.category}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <CardTitle className="text-lg mb-2">{vehicle.name}</CardTitle>
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

          {vehicle.features && vehicle.features.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {vehicle.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {vehicle.features.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{vehicle.features.length - 3} autres
                  </Badge>
                )}
              </div>
            </div>
          )}

          {vehicle.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {vehicle.description}
            </p>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(vehicle.price_per_day)}
            </div>
            <div className="text-sm text-muted-foreground">par jour</div>
          </div>
          <Button onClick={() => setShowBookingForm(true)} className="ml-4">
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