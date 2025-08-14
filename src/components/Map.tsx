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
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-17.45, 14.69], // Dakar default
        zoom: 10,
        pitch: 45,
        bearing: 0,
      });

      // Add custom controls with animation
      const nav = new mapboxgl.NavigationControl({ 
        visualizePitch: true,
        showCompass: true,
        showZoom: true 
      });
      mapRef.current.addControl(nav, "top-right");
      mapRef.current.scrollZoom.enable();

      // Add smooth animations on load
      mapRef.current.on('load', () => {
        mapRef.current?.easeTo({
          pitch: 30,
          duration: 2000,
          easing: (t) => t * (2 - t) // ease-out
        });
      });
    }

    const map = mapRef.current;

    // Add markers with enhanced styling
    const markers: mapboxgl.Marker[] = [];
    const bounds = new mapboxgl.LngLatBounds();

    points.forEach((p, index) => {
      // Create animated marker element
      const el = document.createElement("div");
      el.className = "relative transform transition-all duration-300 hover:scale-110 cursor-pointer";
      el.style.animation = `fadeInBounce 0.6s ease-out ${index * 0.1}s both`;
      
      // Create marker content with gradient background
      const markerContent = document.createElement("div");
      markerContent.className = "relative px-3 py-2 text-xs font-semibold text-white rounded-full shadow-lg";
      markerContent.style.background = "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-foreground)) 100%)";
      markerContent.style.backdropFilter = "blur(10px)";
      markerContent.style.border = "2px solid rgba(255, 255, 255, 0.2)";
      markerContent.style.fontVariantNumeric = "tabular-nums";
      markerContent.textContent = p.price_per_night ? `${Number(p.price_per_night).toLocaleString()} FCFA` : p.title;
      
      // Add pulsing dot for animation
      const pulseEl = document.createElement("div");
      pulseEl.className = "absolute -inset-1 rounded-full animate-pulse opacity-30";
      pulseEl.style.background = "hsl(var(--primary))";
      pulseEl.style.animation = "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite";
      
      el.appendChild(pulseEl);
      el.appendChild(markerContent);

      // Add hover effects
      el.addEventListener('mouseenter', () => {
        markerContent.style.transform = 'scale(1.05)';
        markerContent.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
      });
      
      el.addEventListener('mouseleave', () => {
        markerContent.style.transform = 'scale(1)';
        markerContent.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
      });

      const marker = new mapboxgl.Marker({ 
        element: el,
        anchor: 'center'
      })
        .setLngLat([p.longitude as number, p.latitude as number])
        .addTo(map);

      // Enhanced popup with modern styling
      const popupHtml = `
        <div style="min-width: 280px; padding: 16px; background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%); border-radius: 16px; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 20px 40px rgba(0,0,0,0.15);">
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            ${p.image_url ? `
              <div style="position: relative; overflow: hidden; border-radius: 12px; width: 80px; height: 80px; flex-shrink: 0;">
                <img src="${p.image_url}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;"/>
                <div style="position: absolute; inset: 0; background: linear-gradient(45deg, transparent 0%, rgba(0,0,0,0.1) 100%);"></div>
              </div>
            ` : ""}
            <div style="flex: 1;">
              <h3 style="font-weight: 700; margin: 0 0 8px 0; color: #1f2937; font-size: 16px; line-height: 1.3;">${p.title}</h3>
              ${p.price_per_night ? `
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 12px; font-variant-numeric: tabular-nums; display: flex; align-items: center; gap: 4px;">
                  <span style="color: #059669; font-weight: 600; font-size: 15px;">${Number(p.price_per_night).toLocaleString()} FCFA</span>
                  <span>/ nuit</span>
                </div>
              ` : ""}
              <a href="/property/${p.id}" style="
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 16px;
                background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-foreground)) 100%);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 13px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'">
                Voir le logement
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </div>`;

      const popup = new mapboxgl.Popup({ 
        offset: 15, 
        closeButton: false,
        className: 'custom-popup'
      }).setHTML(popupHtml);
      
      marker.setPopup(popup);

      // Add click animation
      el.addEventListener('click', () => {
        el.style.animation = 'bounce 0.6s ease-in-out';
        setTimeout(() => {
          el.style.animation = '';
        }, 600);
      });

      markers.push(marker);
      bounds.extend([p.longitude as number, p.latitude as number]);
    });

    // Fit bounds with smooth animation
    if (!bounds.isEmpty()) {
      setTimeout(() => {
        map.fitBounds(bounds, { 
          padding: { top: 60, bottom: 60, left: 40, right: 40 }, 
          maxZoom: 14, 
          duration: 1500,
          easing: (t) => t * (2 - t)
        });
      }, 100);
    }

    // Add custom styles for animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInBounce {
        0% {
          opacity: 0;
          transform: translateY(-20px) scale(0.8);
        }
        50% {
          transform: translateY(-5px) scale(1.05);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      @keyframes bounce {
        0%, 20%, 53%, 100% {
          transform: translateY(0) scale(1);
        }
        40%, 43% {
          transform: translateY(-8px) scale(1.1);
        }
        70% {
          transform: translateY(-4px) scale(1.05);
        }
        90% {
          transform: translateY(-2px) scale(1.02);
        }
      }
      
      .custom-popup .mapboxgl-popup-content {
        padding: 0 !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
        border: none !important;
        background: transparent !important;
      }
      
      .custom-popup .mapboxgl-popup-tip {
        border-top-color: rgba(255,255,255,0.95) !important;
      }
    `;
    
    if (!document.head.querySelector('#map-animations')) {
      style.id = 'map-animations';
      document.head.appendChild(style);
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
