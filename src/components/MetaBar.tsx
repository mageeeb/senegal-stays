import React from "react";
import { Star, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type MetaBarProps = {
  ratingText?: string; // e.g., "4,5"
  commentsCount?: number; // e.g., 12
  address?: string | null;
  city?: string | null;
  // Specs removed on mobile per request; props kept for backward-compat if needed
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  className?: string;
  onCommentsClick?: () => void;
  onLocationClick?: () => void;
};

const Separator = () => <span className="px-2 select-none">•</span>;

const MetaBar: React.FC<MetaBarProps> = ({
  ratingText = "4,5",
  commentsCount = 12,
  address,
  city,
  className,
  onCommentsClick,
  onLocationClick,
}) => {
  const locationText = [address, city].filter(Boolean).join(", ");

  const commentsText = `${commentsCount ?? 0} commentaire${(commentsCount ?? 0) >= 2 ? 's' : ''}`;
  const commentsAria = (commentsCount ?? 0) > 0
    ? `Voir les ${commentsCount} commentaires`
    : 'Aucun commentaire — ouvrir la section';

  return (
    <div
      className={cn(
        "text-sm leading-[1.45] text-muted-foreground",
        // Single line layout now; keep comfortable tap area on the row
        "[&>*]:min-h-11",
        className
      )}
      aria-label="Informations sur le logement"
    >
      {/* Line: rating + comments + location (truncated) */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-foreground">
          <Star className="h-4 w-4 text-yellow-400 fill-current" aria-hidden="true" />
          <span className="font-medium">{ratingText}</span>
        </span>
        <Separator />
        <button
          type="button"
          onClick={onCommentsClick}
          className={cn(
            "inline-flex items-center underline decoration-from-font",
            "px-1 py-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label={commentsAria}
        >
          {commentsText}
        </button>
        <Separator />
        <button
          type="button"
          onClick={onLocationClick}
          className={cn(
            "group inline-flex items-center gap-1 px-1 py-2 rounded",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-w-[60vw]"
          )}
          aria-label="Voir la localisation"
        >
          <MapPin className="h-4 w-4" aria-hidden="true" />
          <span className="truncate" title={locationText}>{locationText}</span>
        </button>
      </div>
    </div>
  );
};

export default MetaBar;
