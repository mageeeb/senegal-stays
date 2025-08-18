import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useReviewsSummary, formatAvgFr, pluralizeCommentaires, invalidateReviewsSummary } from '@/hooks/useReviewsSummary';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CommentsSectionProps {
  propertyId: string;
}

type ReviewRow = Tables<'reviews'> & {
  profiles?: { first_name: string | null; last_name: string | null } | null;
};

const PAGE_SIZE = 10;

function formatReviewDate(iso: string): string {
  try {
    return format(new Date(iso), 'MMM yyyy', { locale: fr });
  } catch {
    return iso?.slice(0, 10);
  }
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ propertyId }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const firstLoadDoneRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const showPagination = useMemo(() => (total ?? 0) > PAGE_SIZE, [total]);

  // Auth & navigation
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Eligibility state
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [ineligibleReason, setIneligibleReason] = useState<string | null>(null);
  const [eligibleBookingId, setEligibleBookingId] = useState<string | null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState<boolean>(false);

  // Add review dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | ''>('');
  const [comment, setComment] = useState<string>('');

  const fetchReviews = useCallback(async (opts?: { append?: boolean }) => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);

    try {
      // Always paginate with PAGE_SIZE = 10
      const nextPage = opts?.append ? page + 1 : 0;
      const rangeFrom = nextPage * PAGE_SIZE;
      const rangeTo = rangeFrom + PAGE_SIZE - 1;

      const query = supabase
        .from('reviews')
        .select(
          'id,rating,comment,created_at,reviewer_id,property_id, profiles:profiles!reviews_reviewer_id_fkey(first_name,last_name)',
          { count: total == null ? 'exact' : undefined }
        )
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .range(rangeFrom, rangeTo);

      const { data, error: err, count } = await query;

      if (err) throw err;

      if (count != null && total == null) {
        setTotal(count);
      }

      const rows = (data || []) as unknown as ReviewRow[];

      setReviews(prev => (opts?.append ? [...prev, ...rows] : rows));

      const totalCount = total ?? count ?? 0;
      const loadedCount = (opts?.append ? (reviews.length + rows.length) : rows.length);
      const more = totalCount > loadedCount; // paginate if there are more than loaded
      setHasMore(more);
      setPage(nextPage);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur inconnue';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [propertyId, page, reviews.length, total]);

  const ensureEligibility = useCallback(async () => {
    if (!user) {
      setEligible(null);
      setIneligibleReason(null);
      setEligibleBookingId(null);
      setAlreadyReviewed(false);
      return;
    }
    setEligibilityLoading(true);
    setIneligibleReason(null);
    setEligible(null);
    setAlreadyReviewed(false);
    setEligibleBookingId(null);
    try {
      // Find the most recent completed booking for this user and property
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, created_at')
        .eq('property_id', propertyId)
        .eq('guest_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (bookingsError) throw bookingsError;

      const booking = bookings && bookings.length > 0 ? bookings[0] : null;
      if (!booking) {
        setEligible(false);
        setIneligibleReason('Vous devez avoir séjourné ici pour commenter.');
        return;
      }

      // Check if a review already exists for this booking
      const { data: existing, error: existingError } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', booking.id)
        .limit(1);
      if (existingError) throw existingError;

      if (existing && existing.length > 0) {
        setEligible(false);
        setAlreadyReviewed(true);
        setIneligibleReason('Vous avez déjà laissé un avis pour ce séjour.');
        setEligibleBookingId(booking.id);
        return;
      }

      setEligible(true);
      setEligibleBookingId(booking.id);
    } catch (e) {
      setEligible(false);
      setIneligibleReason('Impossible de vérifier votre éligibilité pour le moment.');
    } finally {
      setEligibilityLoading(false);
    }
  }, [propertyId, user]);

  const handleToggle = async () => {
    const willOpen = !open;
    setOpen(willOpen);

    if (willOpen && !firstLoadDoneRef.current) {
      await fetchReviews();
      // Eligibility is lazy-loaded when section opens
      await ensureEligibility();
      firstLoadDoneRef.current = true;
      // Scroll into view
      requestAnimationFrame(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  const retry = async () => {
    await fetchReviews();
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    await fetchReviews({ append: true });
  };

  const handleAddClick = async () => {
    if (!user) {
      const returnUrl = `${window.location.pathname}${window.location.search}`;
      navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }
    // Ensure eligibility available
    if (eligible === null && !eligibilityLoading) {
      await ensureEligibility();
    }
    setShowDialog(true);
  };

  const canSubmit = user && eligible && eligibleBookingId && !alreadyReviewed && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (rating === '' || rating < 1 || rating > 5) {
      setFormError('Veuillez sélectionner une note entre 1 et 5.');
      return;
    }
    if (!user || !eligibleBookingId) {
      setFormError('Vous ne pouvez pas soumettre un avis pour le moment.');
      return;
    }

    setSubmitting(true);
    try {
      // Optimistic update
      const optimistic: ReviewRow = {
        id: (`optimistic-${Date.now()}` as unknown) as string,
        rating: Number(rating),
        comment: comment || null,
        created_at: new Date().toISOString(),
        reviewer_id: user.id,
        property_id: propertyId,
        booking_id: eligibleBookingId,
        profiles: null,
      } as unknown as ReviewRow;

      setReviews(prev => [optimistic, ...prev]);
      setTotal(prev => (prev != null ? prev + 1 : 1));

      const { error: insertError } = await supabase.from('reviews').insert({
        property_id: propertyId,
        reviewer_id: user.id,
        booking_id: eligibleBookingId,
        rating: Number(rating),
        comment: comment || null,
      });
      if (insertError) throw insertError;

      // Reset and close
      setShowDialog(false);
      setRating('');
      setComment('');

      // Revalidate list to get server-side data (and reviewer name)
      await fetchReviews();
      // Invalidate and refetch summary cache for count/avg
      invalidateReviewsSummary(propertyId);
      await refetchSummary();

      // After success, eligibility should now mark as already reviewed
      setAlreadyReviewed(true);
      setEligible(false);
      setIneligibleReason('Vous avez déjà laissé un avis pour ce séjour.');
    } catch (e: unknown) {
      // Rollback optimistic update by refetching
      await fetchReviews();
      const msg = e instanceof Error ? e.message : '';
      if (/policy|rls/i.test(msg)) {
        setFormError("Vous n'êtes pas autorisé à laisser un avis pour ce logement.");
      } else {
        setFormError('Erreur lors de lenvoi de votre avis. Veuillez réessayer.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Summary hook (count + average) with client-side cache
  const { data: summary, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useReviewsSummary(propertyId);

  const averageRating = useMemo(() => {
    // Use global average from summary if available; fallback to local slice average
    if (summary?.avg != null) return summary.avg;
    if (!reviews.length) return null;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews, summary]);

  return (
    <section id="reviews-section" className="mb-12 pb-8 border-b" aria-label="Commentaires">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Star className="h-6 w-6 text-yellow-400 fill-current" />
          <span className="text-2xl font-semibold">
            {summaryLoading ? (
              '…'
            ) : (
              <>
                {summary?.avg != null ? `${formatAvgFr(summary.avg)} • ` : ''}
                {summary ? pluralizeCommentaires(summary.count) : 'Avis des voyageurs'}
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleToggle}
            aria-expanded={open}
            aria-controls="reviews-list"
            aria-label={summary && summary.count > 0 ? `Voir les ${summary.count} commentaires` : 'Aucun commentaire — ouvrir la section'}
          >
            {open ? 'Masquer les commentaires' : 'Afficher tous les commentaires'}
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={handleAddClick}
                  disabled={(eligible === false && !user) || alreadyReviewed || (eligible === false && !!ineligibleReason) || eligibilityLoading}
                  aria-disabled={(eligible === false && !!ineligibleReason) || alreadyReviewed}
                >
                  {eligibilityLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Vérification…</>
                  ) : (
                    'Ajouter un commentaire'
                  )}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {(!user) ? 'Connectez-vous pour commenter.' : (alreadyReviewed ? 'Vous avez déjà laissé un avis pour ce séjour.' : (eligible === false ? (ineligibleReason || 'Non éligible') : ''))}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un commentaire</DialogTitle>
          </DialogHeader>
          {!user ? (
            <div className="text-sm text-muted-foreground">Veuillez vous connecter pour laisser un avis.</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="rating">Note</Label>
                <div className="mt-2 flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      aria-label={`Donner ${i + 1} étoile${i + 1 > 1 ? 's' : ''}`}
                      className="focus:outline-none"
                    >
                      <Star className={(rating !== '' && (i < Number(rating))) ? 'h-6 w-6 text-yellow-400 fill-current' : 'h-6 w-6 text-muted-foreground'} />
                    </button>
                  ))}
                </div>
                <input type="number" id="rating" name="rating" value={rating as number || ''} onChange={(e) => setRating(Number(e.target.value))} min={1} max={5} className="sr-only" aria-invalid={rating === ''} required />
              </div>
              <div>
                <Label htmlFor="comment">Commentaire (optionnel)</Label>
                <Textarea id="comment" name="comment" maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Partagez votre expérience" aria-invalid={false} />
                <div className="text-xs text-muted-foreground mt-1">{comment.length}/1000</div>
              </div>
              {ineligibleReason && !eligible && (
                <div className="text-sm text-muted-foreground">{ineligibleReason}</div>
              )}
              {formError && (
                <div role="alert" className="text-sm text-red-600">{formError}</div>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
                <Button type="submit" disabled={!canSubmit}>
                  {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi…</> : 'Envoyer'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {open && (
        <div id="reviews-list" ref={containerRef} className="space-y-4" role="region" aria-live="polite">
          {loading && (
            <div role="status" className="text-sm text-muted-foreground">Chargement…</div>
          )}

          {error && !loading && (
            <div className="p-4 border rounded-lg bg-red-50 text-red-700 flex items-center justify-between">
              <span>Une erreur est survenue lors du chargement des commentaires.</span>
              <Button size="sm" variant="outline" onClick={retry}>Réessayer</Button>
            </div>
          )}

          {!loading && !error && reviews.length === 0 && (
            <div className="text-sm text-muted-foreground">Aucun commentaire pour l’instant.</div>
          )}

          {!loading && !error && reviews.length > 0 && (
            <ul className="flex flex-col gap-4">
              {reviews.map((r) => {
                const name = r.profiles ? `${r.profiles.first_name ?? ''} ${r.profiles.last_name ?? ''}`.trim() : '';
                return (
                  <li key={r.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={i < Math.round(r.rating) ? 'h-4 w-4 text-yellow-400 fill-current' : 'h-4 w-4 text-muted-foreground'}
                            />
                          ))}
                        </div>
                        <span className="sr-only">Note: {r.rating} sur 5</span>
                        {name && <span className="font-medium">{name}</span>}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatReviewDate(r.created_at)}</span>
                    </div>
                    {r.comment && <p className="text-sm text-foreground">{r.comment}</p>}
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && !error && hasMore && (
            <div className="pt-2">
              <Button variant="outline" onClick={loadMore}>Afficher plus</Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CommentsSection;
