import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VehicleReviewsSummary {
  count: number;
  average: number | null;
}

// Simple in-memory cache
const cache = new Map<string, { data: VehicleReviewsSummary; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function pluralizeAvis(n: number): string {
  return n <= 1 ? 'avis' : 'avis';
}

export function formatAvgFr(avg: number | null): string | null {
  if (avg === null) return null;
  return avg.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function invalidateVehicleReviewsSummary(vehicleId: string) {
  cache.delete(vehicleId);
}

export function useVehicleReviewsSummary(vehicleId: string | undefined) {
  const [data, setData] = useState<VehicleReviewsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetcher = useCallback(async (id: string) => {
    // Check cache first
    const cached = cache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      const { data: reviews, error: reviewsError } = await supabase
        .from('vehicle_reviews')
        .select('rating')
        .eq('vehicle_id', id);

      if (reviewsError) throw reviewsError;

      const count = reviews?.length || 0;
      const average = count > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / count 
        : null;

      const result = { count, average };
      
      // Cache the result
      cache.set(id, { data: result, timestamp: Date.now() });
      setData(result);
    } catch (err) {
      console.error('Error fetching vehicle reviews summary:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (vehicleId) {
      cache.delete(vehicleId); // Clear cache
      setLoading(true);
      fetcher(vehicleId);
    }
  }, [vehicleId, fetcher]);

  useEffect(() => {
    if (vehicleId) {
      setLoading(true);
      fetcher(vehicleId);
    } else {
      setData(null);
      setLoading(false);
    }
  }, [vehicleId, fetcher]);

  return { data, loading, error, refetch };
}