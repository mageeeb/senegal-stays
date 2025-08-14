import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export type GalleryImage = {
  id?: string | number
  image_url: string
  alt_text?: string | null
};

export type GalleryProps = {
  images: GalleryImage[]
  initialIndex?: number
  showDots?: boolean
  showCounter?: boolean
  showArrows?: boolean
  loop?: boolean
  onSlideChange?: (index: number) => void
  variant?: "card" | "detail"
  enableZoom?: boolean
  className?: string
};

// Lightweight placeholder/fallback
const FALLBACK_URL =
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&h=800&fit=crop";

const Gallery: React.FC<GalleryProps> = ({
  images,
  initialIndex = 0,
  showDots = true,
  showCounter = false,
  showArrows = true,
  loop = false,
  onSlideChange,
  variant = "card",
  enableZoom = false,
  className,
}) => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [announced, setAnnounced] = useState("");
  const liveRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const opts = useMemo(() => {
    return {
      loop,
      align: "start" as const,
      dragFree: false,
      direction: getDocumentDirection(),
      containScroll: "trimSnaps" as const,
      // Embla will handle pointer events for vertical vs horizontal intention well by default.
      // Reduced-motion: keep default but we avoid extra CSS transitions.
      // duration is animation speed; keep default for fluid momentum.
    };
  }, [loop]);

  useEffect(() => {
    if (!api) return;
    // Set initial index when ready
    if (initialIndex > 0) {
      api.scrollTo(initialIndex);
    }

    const onSelect = () => {
      const i = api.selectedScrollSnap();
      setSelectedIndex(i);
      setAnnounced(`Image ${i + 1} sur ${images.length}`);
      if (onSlideChange) onSlideChange(i);
    };

    api.on("select", onSelect);
    api.on("reInit", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, images.length, initialIndex, onSlideChange]);

  if (!images || images.length === 0) return null;

  const isDetail = variant === "detail";

  return (
    <div
      className={cn(
        "relative",
        isDetail ? "w-full" : "w-full",
        className
      )}
    >
      <Carousel
        setApi={setApi}
        opts={opts}
        className={cn(
          "group",
          isDetail ? "aspect-[16/9]" : "aspect-[4/3]"
        )}
        aria-label={isDetail ? "Galerie d'images du logement" : "Galerie d'images"}
      >
        <CarouselContent className={cn(isDetail ? "h-full" : "h-full")}
          style={reducedMotion ? { scrollBehavior: "auto" } : undefined}
        >
          {images.map((img, idx) => (
            <CarouselItem key={img.id ?? idx} className={cn(isDetail ? "basis-full" : "basis-full")}
              aria-label={`Slide ${idx + 1}`}
            >
              {isDetail && enableZoom ? (
                <ZoomableImage
                  src={img.image_url}
                  alt={img.alt_text || `Photo ${idx + 1}`}
                  className={cn(
                    "w-full h-full object-contain bg-black",
                    "rounded-lg"
                  )}
                />
              ) : (
                <ImageWithFallback
                  src={img.image_url}
                  alt={img.alt_text || `Photo ${idx + 1}`}
                  className={cn(
                    "w-full h-full object-cover",
                    isDetail ? "rounded-lg" : "rounded-md"
                  )}
                  loading={isDetail ? (idx <= 1 ? "eager" : "lazy") : "lazy"}
                  decoding="async"
                />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Arrows: show on desktop, hide on mobile for compact UI */}
        {showArrows && (
          <>
            <CarouselPrevious
              className={cn(
                "hidden md:flex items-center justify-center bg-white/80 backdrop-blur-sm shadow border hover:bg-white",
                isDetail ? "left-2 -left-0 md:-left-2" : "left-2 -left-0 md:-left-2"
              )}
              aria-label="Image précédente"
            />
            <CarouselNext
              className={cn(
                "hidden md:flex items-center justify-center bg-white/80 backdrop-blur-sm shadow border hover:bg-white",
                isDetail ? "right-2 -right-0 md:-right-2" : "right-2 -right-0 md:-right-2"
              )}
              aria-label="Image suivante"
            />
          </>
        )}

        {/* Pagination bullets and/or counter */}
        {(showDots || showCounter) && (
          <div className={cn(
            "absolute left-1/2 -translate-x-1/2 flex items-center gap-2",
            isDetail ? "bottom-3" : "bottom-2"
          )}
          >
            {showDots && (
              <Dots
                count={images.length}
                activeIndex={selectedIndex}
                onDotClick={(i) => api?.scrollTo(i)}
              />
            )}
            {showCounter && (
              <div className="px-2 py-0.5 text-xs rounded-full bg-black/50 text-white">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>
        )}

        {/* Live region for slide change announcements */}
        <div
          ref={liveRef}
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {announced}
        </div>
      </Carousel>
    </div>
  );
};

function Dots({
  count,
  activeIndex,
  onDotClick,
}: { count: number; activeIndex: number; onDotClick: (i: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onDotClick(i)}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === activeIndex ? "bg-white w-4" : "bg-white/60 w-1.5 hover:bg-white/80"
          )}
          aria-label={`Aller à l'image ${i + 1}`}
        />
      ))}
    </div>
  );
}

function ImageWithFallback({
  src,
  alt,
  className,
  loading,
  decoding,
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [error, setError] = useState(false);
  return (
    <img
      src={error ? FALLBACK_URL : src}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding as any}
      onError={() => setError(true)}
      sizes="(max-width: 768px) 100vw, 800px"
      srcSet={buildSrcSet(error ? FALLBACK_URL : (src || ""))}
    />
  );
}

function buildSrcSet(url: string) {
  // Very lightweight srcset generator for common widths if using Unsplash or typical CDNs
  try {
    if (!url) return undefined;
    const widths = [320, 480, 640, 800, 1024, 1280];
    const parts = widths.map((w) => `${withParam(url, "w", String(w))} ${w}w`);
    return parts.join(", ");
  } catch {
    return undefined;
  }
}

function withParam(url: string, key: string, value: string) {
  try {
    const u = new URL(url);
    u.searchParams.set(key, value);
    return u.toString();
  } catch {
    return url;
  }
}

function getDocumentDirection(): "ltr" | "rtl" {
  if (typeof document === "undefined") return "ltr";
  const dir = document?.documentElement?.getAttribute("dir") || "ltr";
  return dir === "rtl" ? "rtl" : "ltr";
}

function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setPrefers(mql.matches);
    handler();
    try {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    } catch {
      // Safari
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
  }, []);
  return prefers;
}

export default Gallery;

// Zoomable image with pinch and double-tap, without blocking vertical scroll.
function ZoomableImage({ src, alt, className }: { src?: string; alt?: string | null; className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [error, setError] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const lastTouch = useRef<{ d: number; cx: number; cy: number } | null>(null);
  const lastTap = useRef<number>(0);

  const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

  const onDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // toggle zoom
      setScale((s) => (s > 1 ? 1 : 2));
      setOffset({ x: 0, y: 0 });
    }
    lastTap.current = now;
  };

  const distance = (t1: Touch, t2: Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  };

  const center = (t1: Touch, t2: Touch) => ({ x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 });

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const d = distance(e.touches[0], e.touches[1]);
      const c = center(e.touches[0], e.touches[1]);
      lastTouch.current = { d, cx: c.x, cy: c.y };
    }
  };

  const lastPan = useRef<{ x: number; y: number } | null>(null);

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouch.current) {
      // pinch zoom
      e.preventDefault(); // prevent default during pinch gesture only
      const d = distance(e.touches[0], e.touches[1]);
      const c = center(e.touches[0], e.touches[1]);
      const ds = d / lastTouch.current.d;
      const newScale = clamp(scale * ds, 1, 3);
      setScale(newScale);
      // Basic pan following pinch center
      setOffset((prev) => ({ x: prev.x + (c.x - lastTouch.current!.cx), y: prev.y + (c.y - lastTouch.current!.cy) }));
      lastTouch.current = { d, cx: c.x, cy: c.y };
      lastPan.current = null;
    } else if (e.touches.length === 1 && scale > 1) {
      // one finger pan when zoomed
      const t = e.touches[0];
      const pos = { x: t.clientX, y: t.clientY };
      if (!lastPan.current) {
        lastPan.current = pos;
      } else {
        const dx = pos.x - lastPan.current.x;
        const dy = pos.y - lastPan.current.y;
        setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        lastPan.current = pos;
      }
    }
  };

  const onTouchEnd = () => {
    lastTouch.current = null;
    // clamp offset within bounds (simple approach)
    if (containerRef.current && imgRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const maxX = (scale - 1) * rect.width * 0.5;
      const maxY = (scale - 1) * rect.height * 0.5;
      setOffset((prev) => ({ x: clamp(prev.x, -maxX, maxX), y: clamp(prev.y, -maxY, maxY) }));
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full overflow-hidden touch-pan-y", className)}
      onClick={onDoubleTap as any}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <img
        ref={imgRef}
        src={error ? FALLBACK_URL : src}
        alt={alt || undefined}
        onError={() => setError(true)}
        className="w-full h-full select-none"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "center center",
          transition: scale === 1 ? "transform 150ms ease" : undefined,
        }}
        draggable={false}
      />
    </div>
  );
}
