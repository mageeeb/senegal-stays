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
  longTermEnabled?: boolean;
  minMonths?: number;
}

export const BookingForm = ({ propertyId, pricePerNight, maxGuests, longTermEnabled, minMonths }: BookingFormProps) => {
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

  const roundFcfa = (n: number) => Math.round(n);

  const computeBreakdown = (opts?: { serviceFeeRate?: number; vatRate?: number; cleaningFee?: number; discountAmount?: number }) => {
    const serviceFeeRate = opts?.serviceFeeRate ?? 0.12;
    const vatRate = opts?.vatRate ?? 0.18;
    const cleaningFee = roundFcfa(opts?.cleaningFee ?? 0);
    const discountAmount = roundFcfa(opts?.discountAmount ?? 0);

    const nights = calculateNights();
    const baseRaw = roundFcfa(nights * pricePerNight) - discountAmount;
    const baseAmount = Math.max(baseRaw, 0);
    const serviceFeeAmount = roundFcfa(baseAmount * serviceFeeRate);
    const vatOnService = roundFcfa(serviceFeeAmount * vatRate);
    const total = baseAmount + serviceFeeAmount + vatOnService + cleaningFee;

    return {
      nights,
      baseAmount,
      serviceFeeAmount,
      vatOnService,
      cleaningFee,
      discountAmount,
      serviceFeeRate,
      vatRate,
      total,
    };
  };

  const calculateTotal = () => {
    return computeBreakdown().total;
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
          // Let server trigger compute all monetary fields; send optional inputs as 0 for now
          discount_amount: 0,
          cleaning_fee: 0,
          service_fee_rate: 0.12,
          vat_rate: 0.18,
          currency: 'FCFA',
          total_price: calculateTotal(), // still provided for type compatibility; server will validate/overwrite
          status: 'pending'
        })
        .select()
        .single();

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
            <span className="tabular-nums">{pricePerNight.toLocaleString()} FCFA</span>
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
          
          {(longTermEnabled && nights >= Math.max(30, (minMonths || 1) * 30)) && (
            <div className="p-3 border rounded text-sm bg-blue-50 text-blue-900">
              Séjour de longue durée détecté (≥ 30 nuits). Les conditions mensuelles s’appliquent. Consultez les offres sur la page « Séjours Longue Durée ».
            </div>
          )}

          {nights === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Sélectionnez vos dates pour voir le détail du prix
            </p>
          )}
          
          {nights > 0 && (() => {
            const b = computeBreakdown();
            return (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="underline tabular-nums">{pricePerNight.toLocaleString()} FCFA x {nights} nuit{nights > 1 ? 's' : ''}</span>
                  <span className="tabular-nums">{b.baseAmount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Frais de service ({Math.round(b.serviceFeeRate * 100)}%)</span>
                  <span className="tabular-nums">{b.serviceFeeAmount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    TVA ({Math.round(b.vatRate * 100)}% des frais)
                    <span className="text-muted-foreground" title="La TVA (18%) est appliquée aux frais de service ‘teranga-home’.">ℹ️</span>
                  </span>
                  <span className="tabular-nums">{b.vatOnService.toLocaleString()} FCFA</span>
                </div>
                {b.cleaningFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Frais de ménage</span>
                    <span className="tabular-nums">{b.cleaningFee.toLocaleString()} FCFA</span>
                  </div>
                )}
                {b.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Remise</span>
                    <span className="tabular-nums">-{b.discountAmount.toLocaleString()} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span className="tabular-nums">{b.total.toLocaleString()} FCFA</span>
                </div>
              </div>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
};