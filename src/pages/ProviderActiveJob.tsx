import { useEffect } from "react";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = io("http://localhost:5000");

export default function ProviderActiveJob() {
  const { bookingId } = useParams<{ bookingId: string }>();

  useEffect(() => {
    if (!bookingId) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit("provider-location", {
          bookingId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return <h1>📡 Sharing live location...</h1>;
}