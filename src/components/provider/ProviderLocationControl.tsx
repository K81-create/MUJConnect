import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Compass, MapPin, Navigation } from 'lucide-react';
import { socket } from '@/lib/socket';

interface Props {
    bookingId: string;
}

const ProviderLocationControl: React.FC<Props> = ({ bookingId }) => {
    const [mode, setMode] = useState<'manual' | 'live'>('manual');
    const [isSharing, setIsSharing] = useState(false);
    const [watchId, setWatchId] = useState<number | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    // Manual Input State
    const [eta, setEta] = useState('');
    const [manualAddress, setManualAddress] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const startSharing = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsSharing(true);
        // toast({ title: "Started Sharing Location", description: "Your location is now being tracked." });

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                sendLocationUpdate(latitude, longitude, eta, "Live Location");
            },
            (error) => {
                console.error("Location error:", error);
                if (error.code === error.TIMEOUT) {
                    // limit alerts
                    console.warn("Location timeout");
                } else {
                    alert(`Location Error: ${error.message}`);
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
        setWatchId(id);
    };

    const stopSharing = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
        setIsSharing(false);
    };

    const sendLocationUpdate = async (lat: number, lng: number, currentEta: string, address: string) => {
        try {
            // 1. Send to Backend via API (Persistence)
            await fetch(`https://mujconnect-3lj9.onrender.com/api/bookings/${bookingId}/location`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lng, eta: currentEta, address })
            });

            // 2. Emit via Socket (Real-time)
            socket.emit("provider-location", { bookingId, lat, lng, eta: currentEta, address });

            console.log("Location sent:", lat, lng);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (error) {
            console.error("Failed to update location", error);
        }
    };

    const handleManualUpdate = async () => {
        if (!manualAddress || !eta) {
            alert("Please enter both location and ETA");
            return;
        }
        setIsUpdating(true);

        try {
            // Geocode the address to get coords (using Mapbox via client or just mock for now if no token available here, 
            // but ideally we use the token from env).
            // Since I need to be quick and likely have the token available:
            const token = import.meta.env.VITE_MAPBOX_TOKEN;
            if (!token) {
                alert("Mapbox token missing");
                return;
            }

            const searchAddress = manualAddress.toLowerCase().includes('india')
                ? manualAddress
                : `${manualAddress}, India`;

            const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchAddress)}.json?access_token=${token}&country=in`);
            const data = await res.json();

            if (data.features && data.features.length > 0) {
                const [lng, lat] = data.features[0].center;
                await sendLocationUpdate(lat, lng, eta, manualAddress);
                alert("Location & ETA Updated!");
            } else {
                alert("Address not found!");
            }

        } catch (error) {
            console.error("Geocoding error", error);
            alert("Failed to update location");
        } finally {
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [watchId]);

    return (
        <div className="p-6 border rounded-xl bg-white shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-blue-600" />
                    Trip Status Update
                </h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => { stopSharing(); setMode('manual'); }}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${mode === 'manual' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                    >
                        Manual
                    </button>
                    <button
                        onClick={() => { setMode('live'); }}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${mode === 'live' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
                    >
                        Live GPS
                    </button>
                </div>
            </div>

            {mode === 'manual' ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Current Location / Landmark</Label>
                            <Input
                                placeholder="e.g. Near City Mall"
                                value={manualAddress}
                                onChange={(e) => setManualAddress(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>ETA (Minutes)</Label>
                            <Input
                                placeholder="e.g. 15 mins"
                                value={eta}
                                onChange={(e) => setEta(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button onClick={handleManualUpdate} disabled={isUpdating} className="w-full bg-blue-600 hover:bg-blue-700">
                        {isUpdating ? 'Updating...' : 'Update Status'}
                    </Button>
                    {lastUpdated && (
                        <p className="text-xs text-center text-gray-500 mt-2">
                            Last manual update: {lastUpdated}
                        </p>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg flex items-start gap-3 border border-green-100">
                        <Compass className={`w-5 h-5 mt-0.5 ${isSharing ? 'text-green-600 animate-pulse' : 'text-gray-400'}`} />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Live GPS Tracking</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {isSharing ? 'Your location is being shared with the customer.' : 'Click start to share your live location.'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Estimated ETA</Label>
                        <Input
                            placeholder="Updated automatically or enter manually"
                            value={eta}
                            onChange={(e) => setEta(e.target.value)}
                        />
                    </div>

                    {isSharing ? (
                        <Button variant="destructive" onClick={stopSharing} className="w-full">
                            Stop Live Sharing
                        </Button>
                    ) : (
                        <Button onClick={startSharing} className="w-full bg-green-600 hover:bg-green-700">
                            Start Live Sharing
                        </Button>
                    )}
                    {isSharing && lastUpdated && (
                        <p className="text-xs text-center text-green-600 font-medium mt-2">
                            Live signal sent: {lastUpdated}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProviderLocationControl;
