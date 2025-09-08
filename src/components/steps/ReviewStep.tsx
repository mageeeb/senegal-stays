import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertyData } from "../PropertyListingFlow";
import { 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  DollarSign, 
  Camera, 
  CheckCircle 
} from "lucide-react";

interface ReviewStepProps {
  data: PropertyData;
  updateData: (data: Partial<PropertyData>) => void;
}

export const ReviewStep = ({ data }: ReviewStepProps) => {
  const isComplete = {
    basicInfo: !!(data.title && data.description && data.property_type),
    location: !!(data.city && data.address),
    details: !!(data.max_guests && data.bedrooms && data.bathrooms),
    photos: data.photos.length >= 5,
    pricing: data.price_per_night > 0,
  };

  const allComplete = Object.values(isComplete).every(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Vérifiez votre annonce</h3>
        <p className="text-muted-foreground">
          Voici un aperçu de votre annonce avant publication
        </p>
      </div>

      {/* Statut de completion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className={`h-5 w-5 ${allComplete ? 'text-green-500' : 'text-muted-foreground'}`} />
            Statut de l'annonce
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: 'basicInfo', label: 'Informations de base', complete: isComplete.basicInfo },
              { key: 'location', label: 'Localisation', complete: isComplete.location },
              { key: 'details', label: 'Détails du logement', complete: isComplete.details },
              { key: 'photos', label: 'Photos (min. 5)', complete: isComplete.photos },
              { key: 'pricing', label: 'Tarification', complete: isComplete.pricing },
            ].map(({ key, label, complete }) => (
              <div key={key} className="flex items-center justify-between p-2 rounded border">
                <span className="text-sm">{label}</span>
                <Badge variant={complete ? "default" : "secondary"}>
                  {complete ? "Terminé" : "Incomplet"}
                </Badge>
              </div>
            ))}
          </div>
          
          {!allComplete && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Complétez toutes les sections pour publier votre annonce
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aperçu de l'annonce */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aperçu de votre annonce</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Photo principale */}
            {data.photos.length > 0 && (
              <div className="bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: '995/576' }}>
                <img
                  src={data.photos[0]}
                  alt="Photo principale"
                  className="w-full h-full object-cover"
                  style={{ width: '995px', height: '576px', maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
            )}

            {/* Titre et lieu */}
            <div>
              <h4 className="text-lg font-semibold">{data.title || "Titre de votre annonce"}</h4>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {data.city || "Ville"}, Sénégal
              </p>
            </div>

            {/* Détails */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {data.max_guests} voyageur{data.max_guests > 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                {data.bedrooms} chambre{data.bedrooms > 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                {data.bathrooms} salle{data.bathrooms > 1 ? 's' : ''} de bain
              </span>
            </div>

            {/* Équipements */}
            {data.amenities.length > 0 && (() => {
              const amenities = Array.from(new Set(data.amenities));
              return (
              <div>
                <p className="text-sm font-medium mb-2">Équipements</p>
                <div className="flex flex-wrap gap-2">
                  {amenities.slice(0, 6).map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {amenities.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{amenities.length - 6} autres
                    </Badge>
                  )}
                </div>
              </div>
              );
            })()}

            {/* Prix */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Camera className="h-4 w-4" />
                  {data.photos.length} photo{data.photos.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-lg font-bold">
                    {data.price_per_night ? data.price_per_night.toLocaleString() : '0'} FCFA
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">par nuit</span>
              </div>
            </div>

            {/* Longue durée - résumé */}
            {data.long_term_enabled && (
              <div className="mt-4 p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Longue durée</span>
                  <Badge variant="secondary">Activée</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Prix mensuel</span>
                    <div className="font-semibold tabular-nums">{(data.monthly_price || 0).toLocaleString()} FCFA</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Durée</span>
                    <div className="font-semibold">{data.min_months || 1}–{data.max_months || 12} mois</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dépôt</span>
                    <div className="font-semibold tabular-nums">{(data.deposit_amount || 0).toLocaleString()} FCFA</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Charges</span>
                    <div className="font-semibold">{data.utilities_included ? 'Incluses' : 'Non incluses'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Meublé</span>
                    <div className="font-semibold">{data.furnished ? 'Oui' : 'Non'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Préavis</span>
                    <div className="font-semibold">{data.notice_period_days || 30} jours</div>
                  </div>
                  {data.available_from && (
                    <div>
                      <span className="text-muted-foreground">Disponible à partir du</span>
                      <div className="font-semibold">{data.available_from}</div>
                    </div>
                  )}
                </div>
                {data.utilities_notes && (
                  <div className="text-xs text-muted-foreground mt-2">{data.utilities_notes}</div>
                )}
              </div>
            )}

            {/* Description */}
            {data.description && (
              <div>
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {data.description}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message de confirmation */}
      {allComplete && (
        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-green-900 dark:text-green-100">
              Prêt à publier !
            </h4>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            Votre annonce est complète et prête à être publiée. Vous pourrez la modifier 
            à tout moment après publication.
          </p>
        </div>
      )}
    </div>
  );
};