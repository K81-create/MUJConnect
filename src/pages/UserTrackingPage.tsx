import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TrackingMap from '../components/map/TrackingMap';
import { io } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000'; // Adjust as needed

interface Location {
    lat: number;
    lng: number;
}

// Validation Helper
const isValidLocation = (loc?: Location) => {
    return loc &&
        typeof loc.lat === 'number' && typeof loc.lng === 'number' &&
        !isNaN(loc.lat) && !isNaN(loc.lng) &&
        loc.lat !== 0 && loc.lng !== 0 &&
        Math.abs(loc.lat) <= 90 && Math.abs(loc.lng) <= 180;
};

const UserTrackingPage: React.FC = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const [providerLocation, setProviderLocation] = useState<Location | undefined>(undefined);
    const [userLocation, setUserLocation] = useState<Location | undefined>(undefined);
    const [status, setStatus] = useState<string>('connecting');
    const [eta, setEta] = useState<string>('-- mins');
    const [distance, setDistance] = useState<string>('-- km');
    const [booking, setBooking] = useState<any>(null);

    useEffect(() => {
        if (!bookingId) return;

        const fetchBookingData = async () => {
            try {
                // Fetch full booking details
                const bookingRes = await fetch(`http://localhost:5000/api/bookings/${bookingId}`);

                if (bookingRes.ok) {
                    const bookingData = await bookingRes.json();
                    setBooking(bookingData);

                    // 1. Set Provider Location if exists in DB
                    if (bookingData.providerLocation && bookingData.providerLocation.lat) {
                        const lat = parseFloat(bookingData.providerLocation.lat);
                        const lng = parseFloat(bookingData.providerLocation.lng);
                        if (!isNaN(lat) && !isNaN(lng)) {
                            console.log("Initial Provider Location:", { lat, lng });
                            setProviderLocation({ lat, lng });
                            // Set ETA if available from provider
                            if (bookingData.providerLocation.eta) {
                                setEta(bookingData.providerLocation.eta);
                            }
                        }
                    }

                    // 2. Geocode Address -> User Location
                    if (bookingData.address) {
                        const token = import.meta.env.VITE_MAPBOX_TOKEN;
                        if (token) {
                            const geoRes = await fetch(
                                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(bookingData.address)}.json?access_token=${token}`
                            );
                            const geoData = await geoRes.json();
                            if (geoData.features && geoData.features.length > 0) {
                                const [lng, lat] = geoData.features[0].center;
                                console.log("Geocoded User Location:", { lat, lng });
                                setUserLocation({ lat, lng });
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchBookingData();

        // Socket Connection
        const socket = io(SOCKET_URL);
        socket.on('connect', () => {
            socket.emit('join_tracking', bookingId);
            setStatus('Live Tracking Active');
        });

        socket.on('providerLocationUpdate', (data: any) => {
            console.log("Live Socket Update:", data);

            // Validate incoming data
            if (data.bookingId === bookingId) {
                if (data.lat && data.lng) {
                    const lat = parseFloat(data.lat);
                    const lng = parseFloat(data.lng);

                    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                        setProviderLocation({ lat, lng });
                    }
                }

                // Update ETA if provided
                if (data.eta) {
                    setEta(data.eta);
                }
            }
        });

        return () => {
            socket.emit('leave_tracking', bookingId);
            socket.disconnect();
        };
    }, [bookingId]);

    // 3. Recalculate Distance (ETA is from Provider)
    useEffect(() => {
        if (userLocation && providerLocation) {
            calculateDistance(providerLocation, userLocation);
        }
    }, [userLocation, providerLocation]);

    const calculateDistance = (provider: Location, user: Location) => {
        if (!isValidLocation(provider) || !isValidLocation(user)) {
            setDistance('-- km');
            return;
        }

        const R = 6371; // km
        const dLat = ((user.lat - provider.lat) * Math.PI) / 180;
        const dLon = ((user.lng - provider.lng) * Math.PI) / 180;
        const lat1 = (provider.lat * Math.PI) / 180;
        const lat2 = (user.lat * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;

        setDistance(`${d.toFixed(1)} km`);
    };


    return (
        <div className="container mx-auto p-4 space-y-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Track Your Service Provider
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[500px] bg-slate-50 rounded-lg flex items-center justify-center border shadow-inner relative overflow-hidden">
                    {!userLocation || !providerLocation ? (
                        <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p>Locating provider...</p>
                        </div>
                    ) : (
                        <TrackingMap userLocation={userLocation} providerLocation={providerLocation} />
                    )}
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center text-lg">
                                Status
                                <Badge variant={status === 'Live Tracking Active' ? 'default' : 'secondary'} className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                                    {status === 'Live Tracking Active' ? 'Live' : status}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Estimated Arrival</p>
                                        <p className="text-xl font-bold text-gray-900 leading-none mt-1">{eta}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Distance</p>
                                        <p className="text-xl font-bold text-gray-900 leading-none mt-1">{distance}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 text-sm text-gray-500 text-center italic">
                                {providerLocation ? "Your provider is on the way." : "Waiting for provider location update..."}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold shadow-sm border border-indigo-200">
                                    {booking?.assignedProvider?.charAt(0) || "P"}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{booking?.assignedProvider || "Service Provider"}</h3>
                                    <p className="text-sm text-gray-500">Verified Partner</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserTrackingPage;
