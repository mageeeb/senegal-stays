import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, differenceInDays, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Car, CreditCard, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  price_per_day: number;
  location: string;
}

interface VehicleBookingFormProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  pickupDate: z.date({
    required_error: "La date de prise en charge est requise",
  }),
  returnDate: z.date({
    required_error: "La date de retour est requise",
  }),
  pickupLocation: z.string().min(1, "Le lieu de prise en charge est requis"),
  returnLocation: z.string().min(1, "Le lieu de retour est requis"),
  driverLicenseNumber: z.string().min(1, "Le numéro de permis de conduire est requis"),
  additionalDrivers: z.number().min(0).max(3),
  insuranceType: z.string(),
  specialRequests: z.string().optional(),
});

export const VehicleBookingForm = ({ vehicle, isOpen, onClose }: VehicleBookingFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pickupLocation: vehicle.location,
      returnLocation: vehicle.location,
      additionalDrivers: 0,
      insuranceType: "basic",
      specialRequests: "",
    },
  });

  const pickupDate = form.watch("pickupDate");
  const returnDate = form.watch("returnDate");

  const calculateTotal = () => {
    if (!pickupDate || !returnDate) return 0;
    const days = Math.max(1, differenceInDays(returnDate, pickupDate));
    const basePrice = days * vehicle.price_per_day;
    const insuranceType = form.watch("insuranceType");
    
    let insuranceCost = 0;
    if (insuranceType === "comprehensive") insuranceCost = days * 5000;
    if (insuranceType === "premium") insuranceCost = days * 8000;

    const additionalDrivers = form.watch("additionalDrivers") || 0;
    const additionalDriverCost = additionalDrivers * days * 2000;

    return basePrice + insuranceCost + additionalDriverCost;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour effectuer une réservation",
        variant: "destructive",
      });
      return;
    }

    if (!pickupDate || !returnDate) return;

    setLoading(true);

    try {
      const totalDays = Math.max(1, differenceInDays(returnDate, pickupDate));
      const totalPrice = calculateTotal();

      const { error } = await supabase.from("vehicle_bookings").insert({
        vehicle_id: vehicle.id,
        user_id: user.id,
        pickup_date: format(pickupDate, 'yyyy-MM-dd'),
        return_date: format(returnDate, 'yyyy-MM-dd'),
        pickup_location: values.pickupLocation,
        return_location: values.returnLocation,
        total_days: totalDays,
        total_price: totalPrice,
        driver_license_number: values.driverLicenseNumber,
        additional_drivers: values.additionalDrivers,
        insurance_type: values.insuranceType,
        special_requests: values.specialRequests,
      });

      if (error) throw error;

      toast({
        title: "Réservation effectuée",
        description: "Votre réservation de véhicule a été enregistrée avec succès",
      });

      form.reset();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la réservation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réservation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Réserver {vehicle.name}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pickupDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de prise en charge</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="returnDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de retour</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < (pickupDate || new Date())}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Lieux */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pickupLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu de prise en charge</FormLabel>
                    <FormControl>
                      <Input placeholder="Adresse de prise en charge" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="returnLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu de retour</FormLabel>
                    <FormControl>
                      <Input placeholder="Adresse de retour" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Informations conducteur */}
            <FormField
              control={form.control}
              name="driverLicenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de permis de conduire</FormLabel>
                  <FormControl>
                    <Input placeholder="Numéro du permis de conduire" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="additionalDrivers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conducteurs supplémentaires</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Nombre de conducteurs" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Aucun</SelectItem>
                        <SelectItem value="1">1 conducteur (+2 000 FCFA/jour)</SelectItem>
                        <SelectItem value="2">2 conducteurs (+4 000 FCFA/jour)</SelectItem>
                        <SelectItem value="3">3 conducteurs (+6 000 FCFA/jour)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="insuranceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'assurance</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir l'assurance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="basic">Basique (incluse)</SelectItem>
                        <SelectItem value="comprehensive">Complète (+5 000 FCFA/jour)</SelectItem>
                        <SelectItem value="premium">Premium (+8 000 FCFA/jour)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Demandes spéciales */}
            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Demandes spéciales (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Toute demande particulière..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Résumé des prix */}
            {pickupDate && returnDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Résumé de la réservation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Véhicule ({Math.max(1, differenceInDays(returnDate, pickupDate))} jour(s))</span>
                    <span>{formatPrice(Math.max(1, differenceInDays(returnDate, pickupDate)) * vehicle.price_per_day)}</span>
                  </div>
                  {form.watch("insuranceType") !== "basic" && (
                    <div className="flex justify-between">
                      <span>Assurance {form.watch("insuranceType")}</span>
                      <span>
                        {formatPrice(
                          Math.max(1, differenceInDays(returnDate, pickupDate)) * 
                          (form.watch("insuranceType") === "comprehensive" ? 5000 : 8000)
                        )}
                      </span>
                    </div>
                  )}
                  {form.watch("additionalDrivers") > 0 && (
                    <div className="flex justify-between">
                      <span>Conducteurs supplémentaires ({form.watch("additionalDrivers")})</span>
                      <span>
                        {formatPrice(
                          form.watch("additionalDrivers") * 
                          Math.max(1, differenceInDays(returnDate, pickupDate)) * 2000
                        )}
                      </span>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(calculateTotal())}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Réservation..." : "Confirmer la réservation"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};