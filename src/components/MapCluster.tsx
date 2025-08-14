import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";

// Local error boundary to avoid white screens if something goes wrong in the map
class LocalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // eslint-disable-next-line no-console
    console.error("Map ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center border rounded-md">
          <div className="text-sm text-muted-foreground px-4 text-center">
            Une erreur est survenue lors de l'affichage de la carte. Veuillez réessayer.
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

export type MapProperty = {
  id: string;
  title: string;
  latitude: number | null;
  longitude: number | null;
  price_per_night?: number | null;
  image_url?: string | null;
};

const InteractiveMap: React.FC<{
  properties: MapProperty[];
  className?: string;
}> = ({ properties, className }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // tick to re-run effect after style becomes ready
  const [styleReadyTick, setStyleReadyTick] = useState(0);

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
    return () => { aborted = true; };
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-17.45, 14.69],
        zoom: 10,
        pitch: 45,
        bearing: 0,
      });
      const nav = new mapboxgl.NavigationControl({ visualizePitch: true, showCompass: true, showZoom: true });
      mapRef.current.addControl(nav, "top-right");
      mapRef.current.scrollZoom.enable();
      mapRef.current.on("load", () => {
        mapRef.current?.easeTo({ pitch: 30, duration: 2000, easing: (t) => t * (2 - t) });
      });
    }

    const map = mapRef.current;

    // Wait for the style to be fully loaded before adding sources/layers to avoid
    // "Style is not done loading" errors, especially during fast refresh or style changes.
    if (!map.isStyleLoaded()) {
      const onLoad = () => setStyleReadyTick((t) => t + 1);
      map.once("load", onLoad);
      // Early exit; the effect will re-run when styleReadyTick changes.
      return;
    }

    const featureCollection: GeoJSON.FeatureCollection<GeoJSON.Point, any> = {
      type: "FeatureCollection",
      features: points.map((p, idx) => ({
        type: "Feature",
        id: idx,
        properties: {
          id: p.id,
          title: p.title,
          price: p.price_per_night ?? null,
          image_url: p.image_url ?? null,
        },
        geometry: { type: "Point", coordinates: [p.longitude as number, p.latitude as number] },
      })),
    };

    const sourceId = "properties";
    const clustersLayerId = "clusters";
    const clusterCountLayerId = "cluster-count";
    const unclusteredLayerId = "unclustered-point";

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(featureCollection as any);
    } else {
      map.addSource(sourceId, {
        type: "geojson",
        data: featureCollection as any,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
        generateId: true,
      } as mapboxgl.GeoJSONSourceRaw);

      map.addLayer({
        id: clustersLayerId,
        type: "circle",
        source: sourceId,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "hsl(210, 80%, 40%)",
            10,
            "hsl(210, 80%, 45%)",
            25,
            "hsl(210, 80%, 50%)",
            50,
            "hsl(210, 80%, 55%)",
          ],
          "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 25, 24, 50, 28],
          "circle-opacity": 0.9,
          "circle-stroke-width": 2,
          "circle-stroke-color": "rgba(255,255,255,0.6)",
        },
      });

      map.addLayer({
        id: clusterCountLayerId,
        type: "symbol",
        source: sourceId,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: { "text-color": "#ffffff" },
      });

      map.addLayer({
        id: unclusteredLayerId,
        type: "circle",
        source: sourceId,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "hsl(210, 100%, 60%)",
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 5, 12, 7, 16, 9],
          "circle-stroke-width": ["case", ["boolean", ["feature-state", "hover"], false], 3, 2],
          "circle-stroke-color": ["case", ["boolean", ["feature-state", "hover"], false], "#ffffff", "rgba(255,255,255,0.7)"],
          "circle-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 1, 0.9],
        },
      });

      map.setPaintProperty(clustersLayerId, "circle-color-transition", { duration: 300 } as any);
      map.setPaintProperty(clustersLayerId, "circle-radius-transition", { duration: 300 } as any);
      map.setPaintProperty(unclusteredLayerId, "circle-radius-transition", { duration: 200 } as any);
      map.setPaintProperty(unclusteredLayerId, "circle-opacity-transition", { duration: 200 } as any);

      map.on("click", clustersLayerId, (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [clustersLayerId] });
        const clusterId = features[0].properties && (features[0].properties as any).cluster_id;
        const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({ center: (features[0].geometry as any).coordinates as any, zoom, duration: 500 });
        });
      });

      map.on("mouseenter", clustersLayerId, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", clustersLayerId, () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", unclusteredLayerId, (e) => {
        map.getCanvas().style.cursor = "pointer";
        if (e.features && e.features[0] && typeof e.features[0].id === "number") {
          map.setFeatureState({ source: sourceId, id: e.features[0].id }, { hover: true });
        }
      });
      map.on("mouseleave", unclusteredLayerId, (e) => {
        map.getCanvas().style.cursor = "";
        if (e.features && e.features[0] && typeof e.features[0].id === "number") {
          map.setFeatureState({ source: sourceId, id: e.features[0].id }, { hover: false });
        }
      });

      let hoverPopup: mapboxgl.Popup | null = null;
      map.on("mousemove", unclusteredLayerId, (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const coords = (f.geometry as any).coordinates.slice();
        const title = (f.properties as any).title as string;
        if (!hoverPopup) {
          hoverPopup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 8, className: "custom-popup" });
        }
        hoverPopup
          .setLngLat(coords)
          .setHTML(
            `<div style="padding:8px 10px;font-size:12px;font-weight:600;color:#1f2937;background:rgba(255,255,255,0.95);border-radius:8px;border:1px solid rgba(0,0,0,0.06);">${title}</div>`
          )
          .addTo(map);
      });
      map.on("mouseleave", unclusteredLayerId, () => {
        hoverPopup?.remove();
        hoverPopup = null;
      });

      map.on("click", unclusteredLayerId, (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const props = f.properties as any;
        const coords = (f.geometry as any).coordinates.slice();

        const pricePart = props.price
          ? `
          <div style=\"color: #6b7280; font-size: 13px; margin-bottom: 12px; font-variant-numeric: tabular-nums; display: flex; align-items: center; gap: 4px;\">
            <span style=\"color: #059669; font-weight: 600; font-size: 15px;\">${Number(props.price).toLocaleString()} FCFA</span>
            <span>/ nuit</span>
          </div>`
          : "";

        const html = `
          <div style=\"min-width: 280px; padding: 16px; background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%); border-radius: 16px; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 20px 40px rgba(0,0,0,0.15);\">
            <div style=\"display: flex; gap: 12px; align-items: flex-start;\">
              ${props.image_url ? `
                <div style=\\\"position: relative; overflow: hidden; border-radius: 12px; width: 80px; height: 80px; flex-shrink: 0;\\\"> 
                  <img src=\\\"${props.image_url}\\\" alt=\\\"${props.title}\\\" style=\\\"width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;\\\"/>
                  <div style=\\\"position: absolute; inset: 0; background: linear-gradient(45deg, transparent 0%, rgba(0,0,0,0.1) 100%);\\\"></div>
                </div>` : ""}
              <div style=\"flex: 1;\">
                <h3 style=\"font-weight: 700; margin: 0 0 8px 0; color: #1f2937; font-size: 16px; line-height: 1.3;\">${props.title}</h3>
                ${pricePart}
                <a href=\"/property/${'${props.id}'}\" style=\"
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
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);\">
                  <span>Voir le logement</span>
                  <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <path d=\"M7 17L17 7M17 7H7M17 7V17\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n                  </svg>
                </a>
              </div>
            </div>
          </div>`;

        new mapboxgl.Popup({ offset: 15, closeButton: true, className: "custom-popup" })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(map);
      });
    }

    const bounds = new mapboxgl.LngLatBounds();
    points.forEach((p) => bounds.extend([p.longitude as number, p.latitude as number]));
    if (!bounds.isEmpty()) {
      setTimeout(() => {
        map.fitBounds(bounds, {
          padding: { top: 60, bottom: 60, left: 40, right: 40 },
          maxZoom: 12,
          duration: 1200,
          easing: (t) => t * (2 - t),
        });
      }, 100);
    }

    const style = document.createElement("style");
    style.textContent = `
      .custom-popup .mapboxgl-popup-content { padding: 0 !important; border-radius: 16px !important; box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important; border: none !important; background: transparent !important; }
      .custom-popup .mapboxgl-popup-tip { border-top-color: rgba(255,255,255,0.95) !important; }
    `;
    if (!document.head.querySelector("#map-animations")) {
      style.id = "map-animations";
      document.head.appendChild(style);
    }

    return () => {
      if (map.getLayer(clusterCountLayerId)) map.removeLayer(clusterCountLayerId);
      if (map.getLayer(clustersLayerId)) map.removeLayer(clustersLayerId);
      if (map.getLayer(unclusteredLayerId)) map.removeLayer(unclusteredLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [token, points, styleReadyTick]);

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
    <LocalErrorBoundary>
      <div className={className}>
        <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
      </div>
    </LocalErrorBoundary>
  );
};

export default InteractiveMap;
