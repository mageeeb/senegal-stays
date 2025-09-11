import { useEffect, useState } from 'react';
import { Star, Clock } from 'lucide-react';
import { useReviewsSummary, pluralizeCommentaires, formatAvgFr } from '@/hooks/useReviewsSummary';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface PropertyHostInfoProps {
  propertyId: string;
  hostId: string;
}

interface HostProfile {
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

export const PropertyHostInfo = ({ propertyId, hostId }: PropertyHostInfoProps) => {
  const { data: reviewsData } = useReviewsSummary(propertyId);
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);

  useEffect(() => {
    const fetchHostProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, created_at')
          .eq('user_id', hostId)
          .single();

        if (error) throw error;
        setHostProfile(data);
      } catch (error) {
        console.error('Error fetching host profile:', error);
      }
    };

    if (hostId) {
      fetchHostProfile();
    }
  }, [hostId]);

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
      <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
        <Clock className="h-3 w-3 mr-1" />
        En cours de vérification
      </Badge>

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