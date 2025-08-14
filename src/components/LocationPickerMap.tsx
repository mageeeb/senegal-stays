import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";

interface LocationPickerMapProps {
  value?: { lat: number; lng: number };
  onChange?: (coords: { lat: number; lng: number }) => void;
  className?: string;
  animate?: boolean;
  onDragEnd?: (coords: { lat: number; lng: number }) => void;
  zoom?: number;
}

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({ value, onChange, className, animate = true, onDragEnd, zoom = 13 }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-mapbox-token");
        if (error) throw error;
        if (!data?.token) throw new Error("MAPBOX_PUBLIC_TOKEN non configuré");
        if (mounted) setToken(data.token as string);
      } catch (e: any) {
        console.error(e);
        if (mounted) setError(e?.message || "Erreur récupération token");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;

    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: value ? [value.lng, value.lat] : [-17.4441, 14.6937],
        zoom: value ? zoom : 10,
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

      mapRef.current.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        if (!markerRef.current) {
          const el = document.createElement('div');
          el.style.width = '24px';
          el.style.height = '24px';
          el.style.borderRadius = '50%';
          el.style.background = '#ef4444';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 6px 12px rgba(0,0,0,0.2)';
          el.style.transformOrigin = 'bottom center';
          markerRef.current = new mapboxgl.Marker({ draggable: true, element: el })
            .setLngLat([lng, lat])
            .addTo(mapRef.current!);
          markerRef.current.on("dragend", () => {
            const pos = markerRef.current!.getLngLat();
            onChange?.({ lat: pos.lat, lng: pos.lng });
            onDragEnd?.({ lat: pos.lat, lng: pos.lng });
          });
        } else {
          markerRef.current.setLngLat([lng, lat]);
        }
        if (animate && markerRef.current) {
          try {
            const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (!prefersReduced) {
              const el = markerRef.current.getElement();
              el.style.transition = 'transform 200ms ease, opacity 200ms ease';
              el.style.transform = 'translateY(-8px) scale(0.9)';
              el.style.opacity = '0.7';
              setTimeout(() => {
                el.style.transform = 'translateY(0) scale(1)';
                el.style.opacity = '1';
              }, 0);
            }
          } catch {}
        }
        onChange?.({ lat, lng });
      });
    }

    // Initialize or move marker if value changes
    if (value && mapRef.current) {
      if (!markerRef.current) {
        const el = document.createElement('div');
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.background = '#ef4444';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 6px 12px rgba(0,0,0,0.2)';
        el.style.transformOrigin = 'bottom center';
        markerRef.current = new mapboxgl.Marker({ draggable: true, element: el })
          .setLngLat([value.lng, value.lat])
          .addTo(mapRef.current);
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current!.getLngLat();
          onChange?.({ lat: pos.lat, lng: pos.lng });
          onDragEnd?.({ lat: pos.lat, lng: pos.lng });
        });
      } else {
        markerRef.current.setLngLat([value.lng, value.lat]);
      }
      const prefersReduced = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
      const duration = animate && !prefersReduced ? 500 : 0;
      mapRef.current.easeTo({ center: [value.lng, value.lat], zoom, duration });
      if (animate && markerRef.current && !prefersReduced) {
        const el = markerRef.current.getElement();
        el.style.transition = 'transform 200ms ease, opacity 200ms ease';
        el.style.transform = 'translateY(-8px) scale(0.9)';
        el.style.opacity = '0.7';
        setTimeout(() => {
          el.style.transform = 'translateY(0) scale(1)';
          el.style.opacity = '1';
        }, 0);
      }
    }

    return () => {
      // do not remove map on value updates; only on unmount
    };
  }, [token, value]);

  useEffect(() => {
    return () => {
      markerRef.current?.remove();
      mapRef.current?.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  if (error) {
    return (
      <div className={className}>
        <div className="h-64 w-full flex items-center justify-center border rounded-md">
          <div className="text-sm text-muted-foreground px-4 text-center">
            Impossible d'initialiser la carte. Ajoutez le MAPBOX_PUBLIC_TOKEN pour activer la sélection sur la carte.
          </div>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className={`w-full h-64 rounded-lg overflow-hidden ${className || ""}`} />;
};

export default LocationPickerMap;
