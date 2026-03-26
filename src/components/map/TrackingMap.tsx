import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

interface Location {
  lat: number;
  lng: number;
}

interface TrackingMapProps {
  userLocation?: Location;
  providerLocation?: Location;
  onRouteUpdate?: (distance: string, eta: string) => void;
}

const TrackingMap: React.FC<TrackingMapProps> = ({ userLocation, providerLocation, onRouteUpdate }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const providerMarker = useRef<mapboxgl.Marker | null>(null);

  // ✅ Jaipur Default Center
  const JAIPUR_CENTER: [number, number] = [75.7873, 26.9124];

  // ✅ 1) Create Map ONCE
  useEffect(() => {
    if (!mapContainer.current) return;
    if (!mapboxgl.accessToken) {
      console.error("❌ Mapbox Token missing");
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: JAIPUR_CENTER,
      zoom: 12,
    });

    // ✅ Add route layer after map load
    map.current.on("load", () => {
      if (!map.current) return;

      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      });

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#2563eb",
          "line-width": 5,
          "line-opacity": 0.8,
        },
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // ✅ Helper: create marker element
  const createMarkerEl = (type: "user" | "provider") => {
    const el = document.createElement("div");

    el.style.width = "40px";
    el.style.height = "40px";
    el.style.borderRadius = "50%";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.fontSize = "20px";
    el.style.border = "3px solid white";
    el.style.boxShadow = "0 4px 10px rgba(0,0,0,0.35)";
    el.style.cursor = "pointer";

    if (type === "user") {
      el.style.backgroundColor = "#3b82f6";
      el.innerHTML = "🏠";
    } else {
      el.style.backgroundColor = "#ef4444";
      el.innerHTML = "🚚";
    }

    return el;
  };

  // ✅ 2) Update markers + fit bounds
  useEffect(() => {
    if (!map.current) return;

    console.log("USER:", userLocation);
    console.log("PROVIDER:", providerLocation);

    // USER MARKER
    if (userLocation?.lat && userLocation?.lng) {
      if (!userMarker.current) {
        userMarker.current = new mapboxgl.Marker(createMarkerEl("user"))
          .setLngLat([userLocation.lng, userLocation.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText("User Destination"))
          .addTo(map.current);

        // ✅ make sure marker always visible above route
        userMarker.current.getElement().style.zIndex = "999";
      } else {
        userMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
      }
    }

    // PROVIDER MARKER
    if (providerLocation?.lat && providerLocation?.lng) {
      if (!providerMarker.current) {
        providerMarker.current = new mapboxgl.Marker(createMarkerEl("provider"))
          .setLngLat([providerLocation.lng, providerLocation.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText("Service Provider"))
          .addTo(map.current);

        providerMarker.current.getElement().style.zIndex = "999";
      } else {
        providerMarker.current.setLngLat([providerLocation.lng, providerLocation.lat]);
      }
    }

    // FIT BOUNDS when both exist, otherwise center on provider
    if (userLocation && providerLocation) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([userLocation.lng, userLocation.lat]);
      bounds.extend([providerLocation.lng, providerLocation.lat]);

      map.current.fitBounds(bounds, { padding: 120, maxZoom: 15 });
    } else if (providerLocation) {
      map.current.flyTo({
        center: [providerLocation.lng, providerLocation.lat],
        zoom: 14,
      });
    }
  }, [userLocation, providerLocation]);

  // ✅ 3) Always draw route after map is loaded + both locations exist
  useEffect(() => {
    if (!map.current) return;
    if (!userLocation || !providerLocation) return;

    const drawRoute = async () => {
      try {
        // IMPORTANT: Wait until style is loaded
        if (!map.current?.isStyleLoaded()) {
          map.current?.once("idle", drawRoute);
          return;
        }

        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${providerLocation.lng},${providerLocation.lat};${userLocation.lng},${userLocation.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        );

        const json = await res.json();

        if (!json.routes || json.routes.length === 0) {
          console.warn("❌ No routes found from Directions API");
          return;
        }

        const route = json.routes[0];
        const routeCoords = route.geometry.coordinates;

        if (onRouteUpdate) {
          const distKm = (route.distance / 1000).toFixed(1);
          const timeMins = Math.ceil(route.duration / 60);
          onRouteUpdate(`${distKm} km`, `${timeMins} mins`);
        }

        const geojson = {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "LineString" as const,
            coordinates: routeCoords,
          },
        };

        const source = map.current.getSource("route") as mapboxgl.GeoJSONSource;

        if (source) {
          source.setData(geojson);
        }
      } catch (err) {
        console.error("❌ Route error:", err);
      }
    };

    drawRoute();
  }, [userLocation, providerLocation]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapContainer} className="w-full h-full" />

      {!mapboxgl.accessToken && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500">
          Mapbox Token Missing
        </div>
      )}
    </div>
  );
};

export default TrackingMap;
