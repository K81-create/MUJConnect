import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import io from "socket.io-client";

// 🔑 Mapbox API key is used here
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// 🔌 Connect to backend socket server
const socket = io("http://localhost:5000");

export default function LiveTrackingMap() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    // 🗺️ Create map
    mapRef.current = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [77.2167, 28.6448], // default location
      zoom: 13,
    });

    // 📍 Create provider marker
    markerRef.current = new mapboxgl.Marker({ color: "blue" })
      .setLngLat([77.2167, 28.6448])
      .addTo(mapRef.current);

    // 📡 Listen for provider live location
    socket.on("providerLocationUpdate", ({ lng, lat }) => {
      markerRef.current?.setLngLat([lng, lat]);
      mapRef.current?.flyTo({
        center: [lng, lat],
        speed: 0.5,
      });
    });

    // 🧹 Cleanup
    return () => {
      socket.off("providerLocationUpdate");
      mapRef.current?.remove();
    };
  }, []);

  return (
    <div
      id="map"
      className="h-[400px] w-full rounded-xl shadow"
    />
  );
}