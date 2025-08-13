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
  maxMonths?: number;
  monthlyPrice?: number | null;
}

export const BookingForm = ({ propertyId, pricePerNight, maxGuests, longTermEnabled, minMonths, maxMonths, monthlyPrice }: BookingFormProps) => {
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

  // Helpers disponibilité et dates
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
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const addMonths = (d: Date, months: number) => new Date(d.getFullYear(), d.getMonth() + months, 1);
  const monthsDiffInclusive = (start: Date, end: Date) => {
    const s = startOfMonth(start);
    const e = endOfMonth(end);
    return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
  };
  const isMonthFullyAvailable = (year: number, monthIndex: number) => {
    const first = new Date(year, monthIndex, 1);
    const last = new Date(year, monthIndex + 1, 0);
    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
      if (isUnavailable(d)) return false;
    }
    return true;
  };
  const isRangeMonthsFullyAvailable = (start: Date, end: Date) => {
    const s = startOfMonth(start);
    const count = monthsDiffInclusive(start, end);
    for (let i = 0; i < count; i++) {
      const cur = addMonths(s, i);
      if (!isMonthFullyAvailable(cur.getFullYear(), cur.getMonth())) return false;
    }
    return true;
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

  const calculateMonths = () => {
    if (!checkIn || !checkOut) return 0;
    return monthsDiffInclusive(checkIn, checkOut);
  };

  const roundFcfa = (n: number) => Math.round(n);

  const computeBreakdown = (opts?: { serviceFeeRate?: number; vatRate?: number; cleaningFee?: number; discountAmount?: number }) => {
    const serviceFeeRate = opts?.serviceFeeRate ?? 0.12;
    const vatRate = opts?.vatRate ?? 0.18;
    const cleaningFee = roundFcfa(opts?.cleaningFee ?? 0);
    const discountAmount = roundFcfa(opts?.discountAmount ?? 0);

    if (longTermEnabled) {
      const months = calculateMonths();
      const unit = roundFcfa(monthlyPrice || 0);
      const baseRaw = roundFcfa(months * unit) - discountAmount;
      const baseAmount = Math.max(baseRaw, 0);
      const serviceFeeAmount = roundFcfa(baseAmount * serviceFeeRate);
      const vatOnService = roundFcfa(serviceFeeAmount * vatRate);
      const total = baseAmount + serviceFeeAmount + vatOnService + cleaningFee;
      return {
        months,
        baseAmount,
        serviceFeeAmount,
        vatOnService,
        cleaningFee,
        discountAmount,
        serviceFeeRate,
        vatRate,
        total,
        unit,
      } as const;
    }

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

  // In monthly mode, normalize on selection and enforce constraints
  const normalizeMonthlySelection = (from?: Date, to?: Date) => {
    if (!from) return { from: undefined, to: undefined } as { from?: Date; to?: Date };
    const normFrom = startOfMonth(from);
    const normTo = to ? endOfMonth(to) : endOfMonth(from);
    return { from: normFrom, to: normTo } as { from?: Date; to?: Date };
  };

  const minM = Math.max(1, minMonths || 1);
  const maxM = Math.max(minM, maxMonths || 12);

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
        description: longTermEnabled ? "Veuillez sélectionner vos mois d'arrivée et de départ." : "Veuillez sélectionner vos dates d'arrivée et de départ.",
        variant: "destructive",
      });
      return;
    }

    if (longTermEnabled) {
      // validate monthly rules
      const months = calculateMonths();
      if (months < minM) {
        toast({
          title: "Durée insuffisante",
          description: `La durée minimale est de ${minM} mois.`,
          variant: "destructive",
        });
        return;
      }
      if (months > maxM) {
        toast({
          title: "Durée trop longue",
          description: `La durée maximale est de ${maxM} mois.`,
          variant: "destructive",
        });
        return;
      }
      if (!isRangeMonthsFullyAvailable(checkIn, checkOut)) {
        toast({
          title: "Indisponible",
          description: "Un ou plusieurs mois de la période sont partiellement indisponibles.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (checkOut <= checkIn) {
        toast({
          title: "Dates invalides",
          description: "La date de départ doit être après la date d'arrivée.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const payload: Record<string, unknown> = {
        property_id: propertyId,
        guest_id: user.id,
        check_in: format(checkIn, 'yyyy-MM-dd'),
        check_out: format(checkOut, 'yyyy-MM-dd'),
        guests_count: guests,
        discount_amount: 0,
        cleaning_fee: 0,
        service_fee_rate: 0.12,
        vat_rate: 0.18,
        currency: 'FCFA',
        total_price: calculateTotal(),
        status: 'pending',
      };
      if (longTermEnabled) {
        payload.is_monthly = true;
        payload.months_count = calculateMonths();
        payload.monthly_unit_price = roundFcfa(monthlyPrice || 0);
      }
      const { data, error } = await supabase
        .from('bookings')
        .insert(payload)
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

      // Analytics tagging for bookings
      try {
        window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'booking_created', section: longTermEnabled ? 'monthly' : 'nightly', property_id: propertyId, total: calculateTotal() } }));
      } catch {}

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
  const months = calculateMonths();
  const total = calculateTotal();

  return (
    <Card className="sticky top-4">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="text-2xl font-bold">
            {!longTermEnabled ? (
              <>
                <span className="tabular-nums">{pricePerNight.toLocaleString()} FCFA</span>
                <span className="text-base font-normal text-muted-foreground"> / nuit</span>
              </>
            ) : (
              <>
                <span className="tabular-nums">{Number(monthlyPrice || 0).toLocaleString()} FCFA</span>
                <span className="text-base font-normal text-muted-foreground"> / mois</span>
              </>
            )}
          </div>
          {longTermEnabled && (
            <div className="text-xs text-muted-foreground mt-1">Réservation mensuelle</div>
          )}
        </div>

        <div className="space-y-4">
          {!longTermEnabled ? (
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
          ) : (
            <div className="grid grid-cols-1 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal h-auto p-3",
                      !checkIn && !checkOut && "text-muted-foreground"
                    )}
                  >
                    <div>
                      <div className="text-xs font-medium">PÉRIODE</div>
                      <div className="text-sm">
                        {checkIn && checkOut
                          ? `${format(startOfMonth(checkIn), "MMM yyyy", { locale: fr })} → ${format(endOfMonth(checkOut), "MMM yyyy", { locale: fr })}`
                          : "Sélectionner des mois"}
                      </div>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    numberOfMonths={2}
                    selected={{ from: checkIn, to: checkOut }}
                    onSelect={(range) => {
                      const from = range?.from;
                      const to = range?.to;
                      if (!from && !to) {
                        setCheckIn(undefined);
                        setCheckOut(undefined);
                        return;
                      }
                      const norm = normalizeMonthlySelection(from || undefined, to || undefined);
                      const normFrom = norm.from as Date | undefined;
                      const normTo = norm.to as Date | undefined;
                      if (normFrom && normTo) {
                        const months = monthsDiffInclusive(normFrom, normTo);
                        if (months < minM || months > maxM) {
                          toast({
                            title: months < minM ? "Durée insuffisante" : "Durée trop longue",
                            description: months < minM ? `Minimum ${minM} mois.` : `Maximum ${maxM} mois.`,
                            variant: "destructive",
                          });
                          return;
                        }
                        if (!isRangeMonthsFullyAvailable(normFrom, normTo)) {
                          toast({
                            title: "Indisponible",
                            description: "Un mois de la période est partiellement indisponible.",
                            variant: "destructive",
                          });
                          return;
                        }
                      }
                      setCheckIn(normFrom);
                      setCheckOut(normTo);
                    }}
                    disabled={(date) => {
                      const now = new Date();
                      now.setHours(0,0,0,0);
                      const firstDayShown = new Date(date.getFullYear(), date.getMonth(), 1);
                      // Disable months strictly before today month
                      if (endOfMonth(firstDayShown) < startOfMonth(now)) return true;
                      // Disable if month is not fully available
                      return !isMonthFullyAvailable(date.getFullYear(), date.getMonth());
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="text-xs text-muted-foreground">
                Sélection par mois. Arrivée le 1er, départ le dernier jour du mois.
                {minM || maxM ? ` (min ${minM} · max ${maxM} mois)` : null}
              </div>
            </div>
          )}
          
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
          
          {(!longTermEnabled && nights === 0) || (longTermEnabled && months === 0) ? (
            <p className="text-center text-sm text-muted-foreground">
              {longTermEnabled ? "Sélectionnez vos mois pour voir le détail du prix" : "Sélectionnez vos dates pour voir le détail du prix"}
            </p>
          ) : null}
          
          {(() => {
            const b = computeBreakdown();
            if (!longTermEnabled && nights > 0) {
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
            }
            if (longTermEnabled && months > 0) {
              return (
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="underline tabular-nums">{Number(b.unit || monthlyPrice || 0).toLocaleString()} FCFA x {months} mois</span>
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
            }
            return null;
          })()}
        </div>
      </CardContent>
    </Card>
  );
};