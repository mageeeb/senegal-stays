import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ReviewsSummary = {
  count: number;
  avg: number | null;
};

const cache = new Map<string, { data: ReviewsSummary; ts: number }>();
const STALE_MS = 60_000; // 60s basic client cache

export function pluralizeCommentaires(n: number): string {
  // Rules: 0 → "0 commentaire", 1 → "1 commentaire", n ≥ 2 → "n commentaires"
  return `${n} commentaire${n >= 2 ? 's' : ''}`;
}

export function formatAvgFr(avg: number | null): string | null {
  if (avg == null) return null;
  return avg.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function invalidateReviewsSummary(propertyId: string) {
  cache.delete(propertyId);
}

export function useReviewsSummary(propertyId: string | undefined) {
  const [data, setData] = useState<ReviewsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetcher = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);

    try {
      const now = Date.now();
      const cached = cache.get(propertyId);
      if (cached && now - cached.ts < STALE_MS) {
        setData(cached.data);
        return;
      }

      // Fetch count via HEAD with count: 'exact'
      const countPromise = supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('property_id', propertyId);

      // Fetch average rating via aggregate select
      const avgPromise = supabase
        .from('reviews')
        .select('avg:avg(rating)')
        .eq('property_id', propertyId)
        .single();

      const [countRes, avgRes] = await Promise.all([countPromise, avgPromise]);

      const count = (countRes as { count: number | null }).count ?? 0;
      const avg = (avgRes as { data: { avg: number | null } | null }).data?.avg ?? null;

      const result: ReviewsSummary = { count, avg: avg != null ? Math.round(avg * 10) / 10 : null };
      cache.set(propertyId, { data: result, ts: now });
      if (mountedRef.current) setData(result);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur inconnue';
      if (mountedRef.current) setError(message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    mountedRef.current = true;
    if (propertyId) {
      fetcher();
    } else {
      setData(null);
    }
    return () => {
      mountedRef.current = false;
    };
  }, [propertyId, fetcher]);

  const refetch = useCallback(async () => {
    await fetcher();
  }, [fetcher]);

  return { data, loading, error, refetch } as const;
}
