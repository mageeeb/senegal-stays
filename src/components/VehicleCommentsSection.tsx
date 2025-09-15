import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, ChevronDown, ChevronUp, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useVehicleReviewsSummary, pluralizeAvis, formatAvgFr, invalidateVehicleReviewsSummary } from "@/hooks/useVehicleReviewsSummary";

interface VehicleCommentsSectionProps {
  vehicleId: string;
}

interface VehicleReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const PAGE_SIZE = 5;

const formatReviewDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export function VehicleCommentsSection({ vehicleId }: VehicleCommentsSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: summary, loading: summaryLoading, refetch: refetchSummary } = useVehicleReviewsSummary(vehicleId);

  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState<VehicleReviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Add review dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const fetchReviews = useCallback(async (opts?: { append?: boolean }) => {
    const append = opts?.append || false;
    const currentOffset = append ? offset : 0;

    try {
      setError(null);
      if (!append) setLoading(true);

      const { data, error } = await supabase
        .from('vehicle_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer_id
        `)
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + PAGE_SIZE - 1);

      if (error) throw error;

      // Fetch profiles separately to avoid join issues
      const reviewerIds = data?.map(review => review.reviewer_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', reviewerIds);

      // Combine the data
      const reviewsWithProfiles = data?.map(review => ({
        ...review,
        profiles: profilesData?.find(profile => profile.user_id === review.reviewer_id) || null
      })) || [];

      if (append) {
        setReviews(prev => [...prev, ...reviewsWithProfiles]);
        setOffset(prev => prev + PAGE_SIZE);
      } else {
        setReviews(reviewsWithProfiles);
        setOffset(PAGE_SIZE);
      }

      setHasMore(reviewsWithProfiles.length === PAGE_SIZE);
      if (!hasLoadedOnce) setHasLoadedOnce(true);

    } catch (err) {
      console.error('Error fetching vehicle reviews:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [vehicleId, offset, hasLoadedOnce]);

  // Check if user can review this vehicle
  const ensureEligibility = useCallback(async () => {
    if (!user) {
      setCanReview(false);
      return;
    }

    try {
      setCheckingEligibility(true);

      // Check if user has completed a booking for this vehicle
      const { data: bookings, error: bookingsError } = await supabase
        .from('vehicle_bookings')
        .select('id')
        .eq('vehicle_id', vehicleId)
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (bookingsError) throw bookingsError;

      if (!bookings || bookings.length === 0) {
        setCanReview(false);
        return;
      }

      // Check if user has already reviewed this vehicle
      const { data: existingReview, error: reviewError } = await supabase
        .from('vehicle_reviews')
        .select('id')
        .eq('vehicle_id', vehicleId)
        .eq('reviewer_id', user.id)
        .maybeSingle();

      if (reviewError) throw reviewError;

      setCanReview(!existingReview);

    } catch (err) {
      console.error('Error checking review eligibility:', err);
      setCanReview(false);
    } finally {
      setCheckingEligibility(false);
    }
  }, [user, vehicleId]);

  const handleAddClick = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    await ensureEligibility();
    setIsAddDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canReview) return;

    try {
      setIsSubmitting(true);

      // Get the user's completed booking for this vehicle
      const { data: booking, error: bookingError } = await supabase
        .from('vehicle_bookings')
        .select('id')
        .eq('vehicle_id', vehicleId)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .limit(1)
        .single();

      if (bookingError) throw bookingError;

      const { error } = await supabase
        .from('vehicle_reviews')
        .insert({
          vehicle_id: vehicleId,
          reviewer_id: user.id,
          booking_id: booking.id,
          rating: newRating,
          comment: newComment.trim() || null,
        });

      if (error) throw error;

      // Add optimistic update
      const newReview: VehicleReviewRow = {
        id: `temp-${Date.now()}`,
        rating: newRating,
        comment: newComment.trim() || null,
        created_at: new Date().toISOString(),
        profiles: {
          first_name: user.user_metadata?.first_name || null,
          last_name: user.user_metadata?.last_name || null,
        }
      };

      setReviews(prev => [newReview, ...prev]);
      invalidateVehicleReviewsSummary(vehicleId);
      refetchSummary();
      
      setIsAddDialogOpen(false);
      setNewRating(5);
      setNewComment("");
      setCanReview(false);
      
      toast.success("Votre avis a été ajouté avec succès !");

    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error("Erreur lors de l'ajout de votre avis");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen && !hasLoadedOnce) {
      await fetchReviews();
    }
  };

  const retry = async () => {
    await fetchReviews();
  };

  const loadMore = async () => {
    await fetchReviews({ append: true });
  };

  useEffect(() => {
    if (user && isOpen) {
      ensureEligibility();
    }
  }, [user, isOpen, ensureEligibility]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderClickableStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-6 w-6 cursor-pointer transition-colors ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
        }`}
        onClick={() => onRatingChange(i + 1)}
      />
    ));
  };

  if (summaryLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Chargement des avis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {renderStars(Math.round(summary?.average || 0))}
                  </div>
                  <span className="text-lg font-semibold">
                    {summary?.average ? formatAvgFr(summary.average) : 'Aucun avis'}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  ({summary?.count || 0} {pluralizeAvis(summary?.count || 0)})
                </span>
              </div>
              
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddClick}
                  disabled={checkingEligibility}
                >
                  {checkingEligibility ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <MessageSquare className="h-4 w-4 mr-2" />
                  )}
                  Laisser un avis
                </Button>
              )}
            </div>

            {/* Toggle button */}
            {(summary?.count || 0) > 0 && (
              <Button
                variant="ghost"
                onClick={handleToggle}
                className="w-full justify-between"
                aria-expanded={isOpen}
                aria-controls="vehicle-reviews-content"
              >
                <span>
                  {isOpen ? 'Masquer les avis' : 'Voir tous les avis'}
                </span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Reviews content */}
            {isOpen && (
              <div id="vehicle-reviews-content" className="space-y-4">
                {loading && reviews.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={retry} variant="outline" size="sm">
                      Réessayer
                    </Button>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucun avis pour le moment.</p>
                  </div>
                ) : (
                  <>
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                            </div>
                            <span className="font-medium">
                              {review.profiles?.first_name && review.profiles?.last_name
                                ? `${review.profiles.first_name} ${review.profiles.last_name}`
                                : 'Utilisateur anonyme'}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatReviewDate(review.created_at)}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground mt-2">{review.comment}</p>
                        )}
                      </div>
                    ))}

                    {hasMore && (
                      <div className="text-center">
                        <Button
                          onClick={loadMore}
                          variant="outline"
                          size="sm"
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Afficher plus d'avis
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Review Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Laisser un avis</DialogTitle>
          </DialogHeader>
          
          {!canReview ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                Vous devez avoir effectué une location de ce véhicule pour laisser un avis.
              </p>
              <Button onClick={() => setIsAddDialogOpen(false)} variant="outline">
                Fermer
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Note</label>
                <div className="flex items-center gap-1">
                  {renderClickableStars(newRating, setNewRating)}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Commentaire (optionnel)</label>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Partagez votre expérience avec ce véhicule..."
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Publier l'avis
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}