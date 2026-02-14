import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons missing in webpack/vite builds
// Using string paths or require if necessary, but trying standard import first
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    center: [number, number];
    zoom?: number;
    markers?: { position: [number, number]; popupText?: string }[];
    route?: [number, number][]; // Array of lat,lng for the path
    onMapReady?: (map: L.Map) => void;
    className?: string;
}

// Component to handle map view updates
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

export function Map({ center, zoom = 13, markers = [], route = [], className = "h-[300px] w-full rounded-md" }: MapProps) {
    // Safety check for window/document presence (though usually fine in SPA)
    if (typeof window === 'undefined') return null;

    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className={className} style={{ zIndex: 0 }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={center} />
            {markers.map((marker, idx) => (
                <Marker key={idx} position={marker.position}>
                    {marker.popupText && <Popup>{marker.popupText}</Popup>}
                </Marker>
            ))}
            {route.length > 1 && (
                <Polyline positions={route} color="blue" />
            )}
        </MapContainer>
    );
}
