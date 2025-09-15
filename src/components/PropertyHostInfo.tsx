import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useReviewsSummary, pluralizeCommentaires, formatAvgFr } from '@/hooks/useReviewsSummary';
import { supabase } from '@/integrations/supabase/client';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface PropertyHostInfoProps {
  propertyId: string;
  hostId: string;
}

interface HostProfile {
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

interface PropertyInfo {
  validation_status: string | null;
}

export const PropertyHostInfo = ({ propertyId, hostId }: PropertyHostInfoProps) => {
  const { data: reviewsData } = useReviewsSummary(propertyId);
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);
  const [propertyInfo, setPropertyInfo] = useState<PropertyInfo | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Laisser passer si le profil n'est pas accessible (RLS), mais récupérer quand même le statut
      try {
        const profilePromise = supabase
          .from('profiles')
          .select('first_name, last_name, created_at')
          .eq('user_id', hostId)
          .maybeSingle();

        const propertyPromise = supabase
          .from('properties')
          .select('validation_status')
          .eq('id', propertyId)
          .single();

        const [profileResult, propertyResult] = await Promise.allSettled([profilePromise, propertyPromise]);

        if (profileResult.status === 'fulfilled') {
          const { data } = profileResult.value as any;
          if (data) setHostProfile(data);
        } else {
          console.warn('Profil hôte inaccessible (attendu si RLS):', profileResult.reason);
        }

        if (propertyResult.status === 'fulfilled') {
          const { data } = propertyResult.value as any;
          setPropertyInfo(data);
        } else {
          console.error('Erreur récupération statut de validation:', propertyResult.reason);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (hostId && propertyId) {
      fetchData();
    }
  }, [hostId, propertyId]);

  const getHostSinceYear = () => {
    if (!hostProfile?.created_at) return new Date().getFullYear();
    return new Date(hostProfile.created_at).getFullYear();
  };

  const getHostName = () => {
    if (!hostProfile) return 'Hôte';
    const firstName = hostProfile.first_name || '';
    const lastName = hostProfile.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Hôte';
  };

  const getValidationStatus = () => {
    if (!propertyInfo?.validation_status) return 'pending';
    
    switch (propertyInfo.validation_status) {
      case 'verified':
      case 'approved':
        return 'verified';
      case 'rejected':
        return 'unverified';
      case 'pending':
      default:
        return 'pending';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 pt-4 border-t">
      {/* Avis */}
      {reviewsData && (
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">
            {formatAvgFr(reviewsData.avg) || '0,0'}
          </span>
          <span className="text-muted-foreground">
            ({pluralizeCommentaires(reviewsData.count)})
          </span>
        </div>
      )}

      {/* Badge de vérification */}
      <VerifiedBadge 
        status={getValidationStatus()}
        size="sm"
        className="text-xs"
      />

      {/* Info hôte */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Hôte :</span>
        <span className="font-medium text-foreground">{getHostName()}</span>
      </div>

      <div className="text-sm text-muted-foreground">
        Hôte depuis {getHostSinceYear()}
      </div>
    </div>
  );
};