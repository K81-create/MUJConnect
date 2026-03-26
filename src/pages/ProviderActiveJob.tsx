import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MapPin, CheckCircle2 } from "lucide-react";

const SOCKET_URL = "http://localhost:5000";

export default function ProviderActiveJob() {
  const { bookingId } = useParams<{ bookingId: string }>();

  const [booking, setBooking] = useState<any>(null);
  const [messages, setMessages] = useState<{ sender: string; text: string; timestamp: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketInstance, setSocketInstance] = useState<any>(null);
  const [isLocationActive, setIsLocationActive] = useState(false);

  // 1) Fetch initial booking + chat data
  useEffect(() => {
    if (!bookingId) return;

    const fetchBookingData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`);
        if (!res.ok) return;

        const data = await res.json();
        setBooking(data);

        if (data?.messages) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
      }
    };

    fetchBookingData();
  }, [bookingId]);

  // 2) Establish Socket Connection for Live Tracking Hub & Chat
  useEffect(() => {
    if (!bookingId) return;

    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("✅ Provider connected to socket");
      // Join the chat room
      socket.emit("join_tracking", bookingId);
    });

    socket.on("receive_message", (message: any) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocketInstance(socket);

    // Watch Geolocation
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setIsLocationActive(true);
        socket.emit("provider-location", {
          bookingId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          eta: "10 mins" // Mock ETA for now
        });
      },
      (err) => {
        console.error("Location Error:", err);
        setIsLocationActive(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.disconnect();
    };
  }, [bookingId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socketInstance || !bookingId) return;

    socketInstance.emit("send_message", {
      bookingId,
      sender: "provider",
      text: newMessage.trim(),
    });

    setNewMessage("");
  };

  return (
    <div className="container mx-auto p-4 max-w-lg min-h-screen flex flex-col space-y-4">
      <h1 className="text-2xl font-bold text-center">Active Job Dashboard</h1>

      {/* STATUS CARD */}
      <Card>
        <CardContent className="p-4 flex flex-col items-center space-y-2">
          {isLocationActive ? (
            <MapPin className="w-12 h-12 text-blue-500 animate-bounce" />
          ) : (
            <MapPin className="w-12 h-12 text-gray-400" />
          )}
          <h2 className="text-lg font-semibold">
            {isLocationActive ? "Broadcasting Location..." : "Getting GPS Signal..."}
          </h2>
          <p className="text-sm text-gray-500 text-center">
            The customer is tracking your location on their app. Please proceed to the destination.
          </p>
          <Button variant="default" className="w-full mt-2 bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark Job Completed
          </Button>
        </CardContent>
      </Card>

      {/* CUSTOMER DETAILS */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Customer Info</h3>
          <p className="font-medium text-lg">{booking?.customerName || "Customer"}</p>
          <p className="text-sm text-gray-600">{booking?.address || "Address loading..."}</p>
        </CardContent>
      </Card>

      {/* CHAT BOX */}
      <Card className="flex flex-col flex-1 h-[400px]">
        <CardHeader className="py-3 px-4 bg-slate-50 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Chat with Customer
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="text-center text-xs text-gray-400 mt-10">
                No messages yet. Contact the customer if needed!
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === "provider" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${msg.sender === "provider"
                      ? "bg-indigo-600 text-white rounded-br-none"
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
              placeholder="Message customer..."
              className="text-sm h-9"
            />
            <Button
              size="icon"
              className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700"
              onClick={handleSendMessage}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}