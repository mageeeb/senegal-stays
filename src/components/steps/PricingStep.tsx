import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyData } from "../PropertyListingFlow";
import { DollarSign, Calendar, TrendingUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface PricingStepProps {
  data: PropertyData;
  updateData: (data: Partial<PropertyData>) => void;
}

export const PricingStep = ({ data, updateData }: PricingStepProps) => {
  const [suggestedPrice, setSuggestedPrice] = useState(0);

  useEffect(() => {
    // Simulation d'une suggestion de prix basée sur la localisation et le type
    const basePrices: Record<string, number> = {
      "Dakar": 35000,
      "Saint-Louis": 25000,
      "Saly": 45000,
      "Thiès": 20000,
      "Kaolack": 18000,
      "Ziguinchor": 22000,
    };

    const typeMultipliers: Record<string, number> = {
      "appartement": 1.0,
      "maison": 1.2,
      "villa": 1.8,
      "studio": 0.7,
      "chambre": 0.5,
      "lit": 0.3,
    };

    const basePrice = basePrices[data.city] || 25000;
    const multiplier = typeMultipliers[data.property_type] || 1.0;
    const capacityBonus = Math.max(0, (data.max_guests - 2) * 2000);
    
    setSuggestedPrice(Math.round(basePrice * multiplier + capacityBonus));
  }, [data.city, data.property_type, data.max_guests]);

  const calculateFees = (price: number) => {
    const serviceFee = Math.round(price * 0.03); // 3% de frais de service
    const hostEarnings = price - serviceFee;
    return { serviceFee, hostEarnings };
  };

  const fees = calculateFees(data.price_per_night);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Fixez votre tarif
        </h3>
        <p className="text-muted-foreground">
          Vous pouvez toujours modifier votre tarif après publication
        </p>
      </div>

      {/* Prix principal */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="price">Prix par nuit (FCFA) *</Label>
          <div className="relative mt-1">
            <Input
              id="price"
              type="number"
              value={data.price_per_night || ""}
              onChange={(e) => updateData({ price_per_night: parseInt(e.target.value) || 0 })}
              placeholder="25000"
              className="pl-12"
              min="5000"
              max="1000000"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              FCFA
            </span>
          </div>
        </div>

        {/* Prix suggéré */}
        {suggestedPrice > 0 && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Prix suggéré
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-100 tabular-nums">
                    {suggestedPrice.toLocaleString()} FCFA
                  </div>
                  <button 
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => updateData({ price_per_night: suggestedPrice })}
                  >
                    Utiliser ce prix
                  </button>
                </div>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                Basé sur des logements similaires dans votre région
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Aperçu des gains */}
      {data.price_per_night > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aperçu de vos gains</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Prix de base</span>
              <span className="font-medium tabular-nums">{data.price_per_night.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-sm">Frais de service Teranga Home</span>
              <span className="text-sm tabular-nums">-{fees.serviceFee.toLocaleString()} FCFA</span>
            </div>
            <hr />
            <div className="flex justify-between items-center font-medium">
              <span>Vous recevez</span>
              <span className="text-green-600 tabular-nums">{fees.hostEarnings.toLocaleString()} FCFA</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estimations mensuelles */}
      {data.price_per_night > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Potentiel de revenus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">
                  {(fees.hostEarnings * 5).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">5 nuits/mois</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {(fees.hostEarnings * 10).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">10 nuits/mois</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {(fees.hostEarnings * 15).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">15 nuits/mois</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Estimations basées sur le taux d'occupation moyen dans votre région
            </p>
          </CardContent>
        </Card>
      )}

      {/* Long-term settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Séjours longue durée (mensuel)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Activer les séjours longue durée</div>
              <div className="text-sm text-muted-foreground">Permettre des réservations d'au moins 1 mois</div>
            </div>
            <Switch checked={data.long_term_enabled} onCheckedChange={(v) => updateData({ long_term_enabled: !!v })} />
          </div>

          {data.long_term_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthly_price">Prix mensuel (FCFA)</Label>
                <div className="relative mt-1">
                  <Input
                    id="monthly_price"
                    type="number"
                    value={data.monthly_price || ''}
                    onChange={(e) => updateData({ monthly_price: parseInt(e.target.value) || 0 })}
                    placeholder="500000"
                    className="pl-12"
                    min="0"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">FCFA</span>
                </div>
                {(!data.monthly_price || data.monthly_price <= 0) && (
                  <p className="text-xs text-red-600 mt-1">Requis lorsque la longue durée est activée.</p>
                )}
              </div>
              <div>
                <Label htmlFor="deposit_amount">Dépôt de garantie (FCFA)</Label>
                <div className="relative mt-1">
                  <Input
                    id="deposit_amount"
                    type="number"
                    value={data.deposit_amount || 0}
                    onChange={(e) => updateData({ deposit_amount: parseInt(e.target.value) || 0 })}
                    placeholder="200000"
                    className="pl-12"
                    min="0"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">FCFA</span>
                </div>
                {(data.deposit_amount !== undefined && data.deposit_amount < 0) && (
                  <p className="text-xs text-red-600 mt-1">Le dépôt doit être ≥ 0.</p>
                )}
              </div>
              <div>
                <Label htmlFor="min_months">Durée minimale (mois)</Label>
                <Input id="min_months" type="number" value={data.min_months || 1} min={1} onChange={(e) => updateData({ min_months: parseInt(e.target.value) || 1 })} />
                {(data.min_months !== undefined && data.min_months < 1) && (
                  <p className="text-xs text-red-600 mt-1">Minimum 1 mois.</p>
                )}
              </div>
              <div>
                <Label htmlFor="max_months">Durée maximale (mois)</Label>
                <Input id="max_months" type="number" value={data.max_months || 12} min={1} onChange={(e) => updateData({ max_months: parseInt(e.target.value) || 12 })} />
                {(data.max_months && data.min_months && data.max_months < data.min_months) && (
                  <p className="text-xs text-red-600 mt-1">Doit être ≥ durée minimale.</p>
                )}
              </div>
              <div>
                <Label htmlFor="notice_period_days">Préavis de départ (jours)</Label>
                <Input id="notice_period_days" type="number" value={data.notice_period_days || 30} min={0} onChange={(e) => updateData({ notice_period_days: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label htmlFor="available_from">Disponible à partir de</Label>
                <Input id="available_from" type="date" value={data.available_from || ''} onChange={(e) => updateData({ available_from: e.target.value || null })} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <input id="utilities_included" type="checkbox" checked={!!data.utilities_included} onChange={(e) => updateData({ utilities_included: e.target.checked })} />
                  <Label htmlFor="utilities_included">Charges incluses</Label>
                </div>
                <Input
                  placeholder="Détails des charges (eau, électricité, internet...)"
                  value={data.utilities_notes || ''}
                  onChange={(e) => updateData({ utilities_notes: e.target.value })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conseils tarifaires */}
      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
          Conseils pour optimiser vos revenus
        </h4>
        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
          <li>• Ajustez vos prix selon la saison et les événements locaux</li>
          <li>• Offrez des réductions pour les longs séjours</li>
          <li>• Maintenez un calendrier à jour</li>
          <li>• Répondez rapidement aux demandes de réservation</li>
        </ul>
      </div>
    </div>
  );
};