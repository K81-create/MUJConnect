import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Leaflet marker fix (important for Vite)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

type LatLng = { lat: number; lng: number };

export function OrderTrackingPage() {
    // 🔹 User fixed location (for now)
    // You can change it later to user's real location
    const userLocation: LatLng = useMemo(
        () => ({ lat: 28.6139, lng: 77.209 }), // Delhi
        []
    );

    const [providerLocation, setProviderLocation] = useState<LatLng | null>(null);
    const [socketStatus, setSocketStatus] = useState("Connecting...");

    useEffect(() => {
        const socket = io("http://localhost:5000", {
            transports: ["websocket"],
        });

        socket.on("connect", () => {
            setSocketStatus("Connected ✅");
            console.log("✅ Socket connected:", socket.id);
        });

        socket.on("disconnect", () => {
            setSocketStatus("Disconnected ❌");
        });

        // 👇 This receives provider updates from backend
        socket.on("providerLocationUpdate", (data: LatLng) => {
            console.log("📍 Provider location update:", data);
            setProviderLocation(data);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div style={{ padding: "16px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "8px" }}>
                Order Tracking Page
            </h1>

            <p style={{ marginBottom: "12px" }}>
                Socket Status: <b>{socketStatus}</b>
            </p>

            <div
                style={{
                    height: "500px",
                    width: "100%",
                    borderRadius: "12px",
                    overflow: "hidden",
                }}
            >
                <MapContainer
                    center={userLocation}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* User marker */}
                    <Marker position={userLocation}>
                        <Popup>Your Location</Popup>
                    </Marker>

                    {/* Provider marker */}
                    {providerLocation && (
                        <Marker position={providerLocation}>
                            <Popup>Service Provider Live Location</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            {!providerLocation && (
                <p style={{ marginTop: "12px", color: "gray" }}>
                    Waiting for provider live location...
                </p>
            )}
        </div>
    );
}
