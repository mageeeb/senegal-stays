import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";

export type MapProperty = {
  id: string;
  title: string;
  latitude: number | null;
  longitude: number | null;
  price_per_night?: number | null;
  image_url?: string | null;
};

// Minimal, reusable interactive map component with markers for properties
const InteractiveMap: React.FC<{
  properties: MapProperty[];
  className?: string;
}> = ({ properties, className }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Only keep properties that have valid coordinates
  const points = useMemo(
    () =>
      properties
        .filter((p) => typeof p.longitude === "number" && typeof p.latitude === "number")
        .map((p) => ({
          ...p,
          longitude: Number(p.longitude),
          latitude: Number(p.latitude),
        })),
    [properties]
  );

  useEffect(() => {
    let aborted = false;

    async function fetchToken() {
      try {
        const { data, error } = await supabase.functions.invoke("get-mapbox-token");
        if (error) throw error;
        if (!data?.token) throw new Error("MAPBOX_PUBLIC_TOKEN non configuré");
        if (!aborted) setToken(data.token as string);
      } catch (e: any) {
        console.error("Erreur récupération token Mapbox:", e);
        if (!aborted) setError(e?.message || "Impossible de récupérer le token Mapbox");
      }
    }

    fetchToken();
    return () => {
      aborted = true;
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;

    // Initialize the map once
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-17.45, 14.69], // Dakar default
        zoom: 10,
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
      mapRef.current.scrollZoom.enable();
    }

    const map = mapRef.current;

    // Add markers
    const markers: mapboxgl.Marker[] = [];
    const bounds = new mapboxgl.LngLatBounds();

    points.forEach((p) => {
      const el = document.createElement("div");
      el.className =
        "rounded-full bg-background/90 border border-border shadow px-2 py-1 text-xs font-medium";
      el.style.backdropFilter = "blur(6px)";
      el.textContent = p.price_per_night ? `${Number(p.price_per_night).toLocaleString()} FCFA` : p.title;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([p.longitude as number, p.latitude as number])
        .addTo(map);

      const popupHtml = `
        <div style="min-width:220px;">
          <div style="display:flex; gap:8px; align-items:center;">
            ${p.image_url ? `<img src="${p.image_url}" alt="${p.title}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;"/>` : ""}
            <div style="flex:1;">
              <div style="font-weight:600; margin-bottom:4px;">${p.title}</div>
              ${p.price_per_night ? `<div style="color:#444; font-size:12px;">${Number(p.price_per_night).toLocaleString()} FCFA / nuit</div>` : ""}
              <a href="/property/${p.id}" style="display:inline-block;margin-top:6px;color:#2563eb;font-weight:600;">Voir le logement</a>
            </div>
          </div>
        </div>`;

      const popup = new mapboxgl.Popup({ offset: 12, closeButton: true }).setHTML(popupHtml);
      marker.setPopup(popup);

      markers.push(marker);
      bounds.extend([p.longitude as number, p.latitude as number]);
    });

    // Fit bounds if we have multiple points
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 40, maxZoom: 14, duration: 500 });
    }

    // Cleanup markers on update
    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [token, points]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  if (error) {
    return (
      <div className={className}>
        <div className="h-full w-full flex items-center justify-center border rounded-md">
          <div className="text-sm text-muted-foreground px-4 text-center">
            Impossible d'initialiser la carte. Configurez votre token Mapbox dans Supabase (Edge Functions Secrets).
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
    </div>
  );
};

export default InteractiveMap;
