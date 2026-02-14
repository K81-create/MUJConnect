import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set public token here or from env
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface Location {
    lat: number;
    lng: number;
}

interface TrackingMapProps {
    userLocation?: Location;
    providerLocation?: Location;
}

const TrackingMap: React.FC<TrackingMapProps> = ({ userLocation, providerLocation }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const userMarker = useRef<mapboxgl.Marker | null>(null);
    const providerMarker = useRef<mapboxgl.Marker | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        if (!map.current) {
            if (!mapboxgl.accessToken) {
                console.error("Mapbox Token missing");
                return;
            }

            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: userLocation ? [userLocation.lng, userLocation.lat] : [77.5946, 12.9716], // Default Bangalore
                zoom: 12,
            });

            map.current.on('load', () => {
                if (map.current) {
                    map.current.addSource('route', {
                        'type': 'geojson',
                        'data': {
                            'type': 'Feature',
                            'properties': {},
                            'geometry': {
                                'type': 'LineString',
                                'coordinates': []
                            }
                        }
                    });

                    map.current.addLayer({
                        'id': 'route',
                        'type': 'line',
                        'source': 'route',
                        'layout': {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        'paint': {
                            'line-color': '#3b82f6',
                            'line-width': 5,
                            'line-opacity': 0.75
                        }
                    });
                }
            });
        }

        return () => {
            map.current?.remove();
            map.current = null;
        }
    }, []);

    // Fetch and Draw Route
    useEffect(() => {
        const getRoute = async (start: Location, end: Location) => {
            if (!map.current) return;
            try {
                const query = await fetch(
                    `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
                    { method: 'GET' }
                );
                const json = await query.json();
                const data = json.routes[0];
                const route = data.geometry.coordinates;

                const geojson: any = {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: route
                    }
                };

                const source: any = map.current.getSource('route');
                if (source) {
                    source.setData(geojson);
                }
            } catch (error) {
                console.error("Error fetching route:", error);
            }
        };

        if (userLocation && providerLocation && !isNaN(userLocation.lat) && !isNaN(providerLocation.lat)) {
            getRoute(providerLocation, userLocation);
        }
    }, [userLocation, providerLocation]);

    // Update Markers & Bounds
    useEffect(() => {
        if (!map.current) return;

        const createMarkerEl = (type: 'user' | 'provider') => {
            const el = document.createElement('div');
            el.className = `marker ${type}-marker`;
            el.style.width = '30px';
            el.style.height = '30px';
            el.style.backgroundSize = '100%';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            el.style.display = 'flex';
            el.style.justifyContent = 'center';
            el.style.alignItems = 'center';
            el.style.fontSize = '16px';
            el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            el.style.cursor = 'pointer';

            if (type === 'user') {
                el.style.backgroundColor = '#3b82f6';
                el.innerHTML = '🏠';
            } else {
                el.style.backgroundColor = '#ef4444';
                el.innerHTML = '🚚';
            }
            return el;
        };

        // User Marker
        if (userLocation && !isNaN(userLocation.lat) && !isNaN(userLocation.lng)) {
            if (!userMarker.current) {
                userMarker.current = new mapboxgl.Marker(createMarkerEl('user'))
                    .setLngLat([userLocation.lng, userLocation.lat])
                    .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Detailed Location'))
                    .addTo(map.current);
            } else {
                userMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
            }
        }

        // Provider Marker
        if (providerLocation && !isNaN(providerLocation.lat) && !isNaN(providerLocation.lng)) {
            if (!providerMarker.current) {
                providerMarker.current = new mapboxgl.Marker(createMarkerEl('provider'))
                    .setLngLat([providerLocation.lng, providerLocation.lat])
                    .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Service Provider'))
                    .addTo(map.current);
            } else {
                providerMarker.current.setLngLat([providerLocation.lng, providerLocation.lat]);
            }
        }

        // Fit Bounds
        if (userLocation && providerLocation && map.current) {
            const isValid = (loc: Location) => !isNaN(loc.lat) && !isNaN(loc.lng) && loc.lat !== 0 && loc.lng !== 0;

            if (isValid(userLocation) && isValid(providerLocation)) {
                const bounds = new mapboxgl.LngLatBounds();
                bounds.extend([userLocation.lng, userLocation.lat]);
                bounds.extend([providerLocation.lng, providerLocation.lat]);
                map.current.fitBounds(bounds, { padding: 100, maxZoom: 15 });
            }
        }

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
