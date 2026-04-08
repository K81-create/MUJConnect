import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TrackingMap from "../components/map/TrackingMap";
import { io } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, MapPin, Phone, Send } from "lucide-react";

const SOCKET_URL = "https://mujconnect-3lj9.onrender.com";

interface Location {
  lat: number;
  lng: number;
}

// ✅ Strong Validation Helper
const isValidLocation = (loc?: Location) => {
  return (
    loc &&
    typeof loc.lat === "number" &&
    typeof loc.lng === "number" &&
    !isNaN(loc.lat) &&
    !isNaN(loc.lng) &&
    Math.abs(loc.lat) <= 90 &&
    Math.abs(loc.lng) <= 180
  );
};

const UserTrackingPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();

  const [providerLocation, setProviderLocation] = useState<Location | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<Location | undefined>(undefined);

  const [status, setStatus] = useState<string>("connecting");
  const [eta, setEta] = useState<string>("-- mins");
  const [distance, setDistance] = useState<string>("-- km");
  const [currentLocationText, setCurrentLocationText] = useState<string>("Fetching location...");

  const [booking, setBooking] = useState<any>(null);

  // Chat State
  const [messages, setMessages] = useState<{ sender: string; text: string; timestamp: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketInstance, setSocketInstance] = useState<any>(null);

  // ✅ 1) Fetch Booking + Provider Location + Geocode User Address
  useEffect(() => {
    if (!bookingId) return;

    const fetchBookingData = async () => {
      try {
        const bookingRes = await fetch(`https://mujconnect-3lj9.onrender.com/api/bookings/${bookingId}`);
        if (!bookingRes.ok) return;

        const bookingData = await bookingRes.json();
        setBooking(bookingData);

        // ✅ Provider Location from DB (convert to number)
        const dbLoc = bookingData?.providerLocation;

        if (dbLoc && dbLoc.lat != null && dbLoc.lng != null) {
          const lat = Number(dbLoc.lat);
          const lng = Number(dbLoc.lng);

          if (!isNaN(lat) && !isNaN(lng)) {
            console.log("✅ Provider Location from DB:", { lat, lng });
            setProviderLocation({ lat, lng });
          }
        }

        // ✅ Messages History from DB
        if (bookingData?.messages) {
          setMessages(bookingData.messages);
        }

        // ✅ Geocode Address -> User Location
        if (bookingData?.address) {
          const token = import.meta.env.VITE_MAPBOX_TOKEN;
          if (!token) {
            console.error("❌ Mapbox token missing in VITE_MAPBOX_TOKEN");
            return;
          }

          // Better search address: Try removing descriptive prefixes like "Near" and extra punctuation
          let searchAddress = bookingData.address.replace(/Near /gi, '').trim();
          if (!searchAddress.toLowerCase().includes("india")) {
            searchAddress = `${searchAddress}, India`;
          }

          console.log("🔍 Geocoding address:", searchAddress);

          let geoRes = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              searchAddress
            )}.json?access_token=${token}&country=in&limit=1`
          );

          let geoData = await geoRes.json();

          // ✅ Fallback: Try just the city name/pincode if full address fails
          if (!geoData?.features || geoData.features.length === 0) {
            console.warn("⚠️ Full address failed, trying fallback search...");
            const fallbackSearch = "Jaipur, India"; // Fallback mapping based on typical MUJ area
            geoRes = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                fallbackSearch
              )}.json?access_token=${token}&country=in&limit=1`
            );
            geoData = await geoRes.json();
          }

          if (geoData?.features?.length > 0) {
            const [lng, lat] = geoData.features[0].center;

            console.log("✅ Geocoded User Location:", { lat, lng });

            setUserLocation({
              lat: Number(lat),
              lng: Number(lng),
            });
          } else {
            console.warn("❌ No geocoding results for:", searchAddress);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching booking data:", error);
      }
    };

    fetchBookingData();
  }, [bookingId]);

  // ✅ 2) Socket Live Provider Location Updates
  useEffect(() => {
    if (!bookingId) return;

    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("✅ Socket connected");
      socket.emit("join_tracking", bookingId);
      setStatus("Live Tracking Active");
    });

    socket.on("providerLocationUpdate", (data: any) => {
      console.log("📡 Socket providerLocationUpdate:", data);

      if (data?.bookingId !== bookingId) return;

      // ✅ Always use != null instead of if(data.lat && data.lng)
      if (data.lat != null && data.lng != null) {
        const lat = Number(data.lat);
        const lng = Number(data.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
          setProviderLocation({ lat, lng });
        }
      }

      // OPTIONAL: ETA if provider sends it
      if (data?.eta) {
        setEta(String(data.eta));
      }
    });

    socket.on("receive_message", (message: any) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
    });

    setSocketInstance(socket);

    return () => {
      socket.emit("leave_tracking", bookingId);
      socket.disconnect();
    };
  }, [bookingId]);

  // ✅ 3) Send Chat Message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !socketInstance) return;

    socketInstance.emit("send_message", {
      bookingId,
      sender: "user",
      text: newMessage.trim(),
    });

    setNewMessage("");
  };

  // ✅ 3) Debug logs (VERY IMPORTANT)
  useEffect(() => {
    console.log("USER LOCATION FINAL:", userLocation);
    console.log("PROVIDER LOCATION FINAL:", providerLocation);
  }, [userLocation, providerLocation]);

  // ✅ 4) Reverse Geocode Provider Location
  useEffect(() => {
    if (!providerLocation) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) return;

    const fetchAddress = async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${providerLocation.lng},${providerLocation.lat}.json?access_token=${token}`
        );
        const data = await res.json();
        if (data?.features?.length > 0) {
          setCurrentLocationText(data.features[0].place_name);
        } else {
          setCurrentLocationText("Location tracking active...");
        }
      } catch (err) {
        console.error("❌ Reverse geocode error:", err);
      }
    };

    fetchAddress();
  }, [providerLocation]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        Track Your Service Provider
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAP */}
        <div className="lg:col-span-2 h-[500px] bg-slate-50 rounded-lg flex items-center justify-center border shadow-inner relative overflow-hidden">
          {!isValidLocation(providerLocation) ? (
            <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p>Locating provider...</p>
              <p className="text-xs text-gray-400 mt-2">
                Provider Location: {isValidLocation(providerLocation) ? "✅ Found" : "❌ Waiting for Provider GPS"}
                <br />
                User Location: {isValidLocation(userLocation) ? "✅ Found" : "❌ Missing (Waiting for Address Geocode)"}
              </p>
            </div>
          ) : (
            <>
              {!isValidLocation(userLocation) && (
                <div className="absolute top-4 left-4 z-10 bg-white/90 p-3 rounded-lg shadow-md border-l-4 border-yellow-500 text-sm max-w-xs">
                  <p className="font-semibold text-yellow-700">Notice</p>
                  <p className="text-gray-600 text-xs">Couldn't find your exact destination address. Map shows provider's location.</p>
                </div>
              )}
              <TrackingMap
                userLocation={userLocation}
                providerLocation={providerLocation}
                onRouteUpdate={(dist, time) => {
                  setDistance(dist);
                  setEta(time);
                }}
              />
            </>
          )}
        </div>

        {/* INFO */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                Status
                <Badge
                  variant={status === "Live Tracking Active" ? "default" : "secondary"}
                  className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                >
                  {status === "Live Tracking Active" ? "Live" : status}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* CURRENT LOCATION */}
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">
                      Current Location
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2">
                      {currentLocationText}
                    </p>
                  </div>
                </div>
              </div>

              {/* ETA */}
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                      Estimated Arrival
                    </p>
                    <p className="text-xl font-bold text-gray-900 leading-none mt-1">{eta}</p>
                  </div>
                </div>
              </div>

              {/* DISTANCE */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                      Distance
                    </p>
                    <p className="text-xl font-bold text-gray-900 leading-none mt-1">
                      {distance}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-sm text-gray-500 text-center italic">
                {providerLocation ? "Your provider is on the way." : "Waiting for provider location update..."}
              </div>
            </CardContent>
          </Card>

          {/* PROVIDER INFO & CALL BUTTON */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold shadow-sm border border-indigo-200">
                    {booking?.assignedProvider?.charAt(0) || "P"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {booking?.assignedProvider || "Service Provider"}
                    </h3>
                    <p className="text-sm text-gray-500">Verified Partner</p>
                  </div>
                </div>

                {booking?.providerPhone && (
                  <a href={`tel:${booking.providerPhone}`}>
                    <Button variant="outline" size="icon" className="rounded-full shadow-sm text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700 h-10 w-10">
                      <Phone className="w-5 h-5" />
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CHAT BOX */}
          <Card className="flex flex-col h-72">
            <CardHeader className="py-3 px-4 bg-slate-50 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {messages.length === 0 ? (
                  <div className="text-center text-xs text-gray-400 mt-10">
                    No messages yet. Say hello!
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${msg.sender === "user"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                          }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t bg-white flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Message provider..."
                  className="text-sm h-9"
                />
                <Button size="icon" className="h-9 w-9 bg-blue-600 hover:bg-blue-700" onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserTrackingPage;
