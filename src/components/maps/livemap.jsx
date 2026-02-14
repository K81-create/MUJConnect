// src/components/maps/LiveMap.jsx
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

export default function LiveMap({ providerLocation, userLocation }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={providerLocation || userLocation}
      zoom={14}
    >
      {providerLocation && (
        <Marker position={providerLocation} label="P" />
      )}

      {userLocation && (
        <Marker position={userLocation} label="U" />
      )}
    </GoogleMap>
  );
}