import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare } from "lucide-react";
import { socket } from "@/lib/socket";

interface Props {
    bookingId: string;
}

const ProviderChat: React.FC<Props> = ({ bookingId }) => {
    const [messages, setMessages] = useState<{ sender: string; text: string; timestamp: string }[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingHistory, setLoadingHistory] = useState(true);

    // 1) Fetch history on mount
    useEffect(() => {
        if (!bookingId) return;

        const fetchHistory = async () => {
            try {
                const res = await fetch(`https://mujconnect-3lj9.onrender.com/api/bookings/${bookingId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data?.messages) {
                        setMessages(data.messages);
                    }
                }
            } catch (err) {
                console.error("Failed to load chat history:", err);
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, [bookingId]);

    // 2) Listen to Socket
    useEffect(() => {
        if (!bookingId) return;

        // Join room specifically for this booking
        socket.emit("join_tracking", bookingId);

        const handleReceiveMessage = (message: any) => {
            // Prevent duplicates by checking if we just sent it or it's new
            setMessages((prev) => [...prev, message]);
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.emit("leave_tracking", bookingId);
        };
    }, [bookingId]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !bookingId) return;

        // Send to server
        socket.emit("send_message", {
            bookingId,
            sender: "provider",
            text: newMessage.trim(),
        });

        setNewMessage("");
    };

    return (
        <Card className="flex flex-col h-[350px] border shadow-sm">
            <CardHeader className="py-3 px-4 bg-indigo-50 border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-800">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    Chat with Customer
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-white">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loadingHistory ? (
                        <div className="text-center text-xs text-gray-400 mt-10">Loading chat...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-xs text-gray-400 mt-10">
                            No messages yet. Greet the customer!
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.sender === "provider" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.sender === "provider"
                                        ? "bg-indigo-600 text-white rounded-br-none"
                                        : "bg-gray-100 text-gray-800 rounded-bl-none border"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-3 border-t bg-gray-50 flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Type your message..."
                        className="text-sm h-9 bg-white"
                    />
                    <Button
                        size="icon"
                        className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 shrink-0"
                        onClick={handleSendMessage}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProviderChat;
