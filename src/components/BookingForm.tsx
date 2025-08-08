import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Users } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface BookingFormProps {
  propertyId: string;
  pricePerNight: number;
  maxGuests: number;
}

export const BookingForm = ({ propertyId, pricePerNight, maxGuests }: BookingFormProps) => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [unavailableSet, setUnavailableSet] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchAvailability = async () => {
    const { data, error } = await supabase
      .from('property_availability')
      .select('date, is_available')
      .eq('property_id', propertyId)
      .eq('is_available', false);
    if (!error && data) {
      setUnavailableSet(new Set(data.map((d: { date: string }) => d.date)));
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [propertyId]);

  // Helpers disponibilité
  const formatKey = (d: Date) => format(d, 'yyyy-MM-dd');
  const isUnavailable = (d: Date) => unavailableSet.has(formatKey(d));
  const hasBlockedBetween = (start: Date, end: Date) => {
    if (end <= start) return false;
    const cursor = new Date(start);
    cursor.setDate(cursor.getDate() + 1);
    while (cursor <= end) {
      if (isUnavailable(cursor)) return true;
      cursor.setDate(cursor.getDate() + 1);
    }
    return false;
  };

  useEffect(() => {
    if (checkIn && checkOut) {
      if (checkOut <= checkIn || isUnavailable(checkOut) || hasBlockedBetween(checkIn, checkOut)) {
        setCheckOut(undefined);
      }
    }
  }, [checkIn, unavailableSet]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * pricePerNight;
  };

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour effectuer une réservation.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!checkIn || !checkOut) {
      toast({
        title: "Dates manquantes",
        description: "Veuillez sélectionner vos dates d'arrivée et de départ.",
        variant: "destructive",
      });
      return;
    }

    if (checkOut <= checkIn) {
      toast({
        title: "Dates invalides",
        description: "La date de départ doit être après la date d'arrivée.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          property_id: propertyId,
          guest_id: user.id,
          check_in: format(checkIn, 'yyyy-MM-dd'),
          check_out: format(checkOut, 'yyyy-MM-dd'),
          guests_count: guests,
          total_price: calculateTotal(),
          status: 'pending'
        });

      if (error) {
        console.error('Erreur lors de la réservation:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la réservation. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Réservation confirmée !",
        description: "Votre demande de réservation a été envoyée avec succès.",
      });

      // Réinitialiser le formulaire
      setCheckIn(undefined);
      setCheckOut(undefined);
      setGuests(1);

    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nights = calculateNights();
  const total = calculateTotal();

  return (
    <Card className="sticky top-4">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="text-2xl font-bold">
            {pricePerNight.toLocaleString()} FCFA
            <span className="text-base font-normal text-muted-foreground"> / nuit</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal h-auto p-3",
                    !checkIn && "text-muted-foreground"
                  )}
                >
                  <div>
                    <div className="text-xs font-medium">ARRIVÉE</div>
                    <div className="text-sm">
                      {checkIn ? format(checkIn, "dd/MM/yyyy", { locale: fr }) : "Sélectionner"}
                    </div>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={setCheckIn}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal h-auto p-3",
                    !checkOut && "text-muted-foreground"
                  )}
                >
                  <div>
                    <div className="text-xs font-medium">DÉPART</div>
                    <div className="text-sm">
                      {checkOut ? format(checkOut, "dd/MM/yyyy", { locale: fr }) : "Sélectionner"}
                    </div>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={setCheckOut}
                  disabled={(date) => date < new Date() || (checkIn && date <= checkIn)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
            <SelectTrigger className="h-auto p-3">
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="text-xs font-medium">VOYAGEURS</div>
                  <div className="text-sm">{guests} voyageur{guests > 1 ? 's' : ''}</div>
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} voyageur{num > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleBooking}
            disabled={isLoading || !checkIn || !checkOut}
          >
            {isLoading ? "Réservation..." : "Réserver"}
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            Aucun frais pour le moment
          </p>
          
          {nights > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span className="underline">{pricePerNight.toLocaleString()} FCFA x {nights} nuit{nights > 1 ? 's' : ''}</span>
                <span>{total.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total avant taxes</span>
                <span>{total.toLocaleString()} FCFA</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};