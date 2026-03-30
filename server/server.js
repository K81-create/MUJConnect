import express from "express";
import http from "http";
import dns from "dns";
import fetch from "node-fetch";

// Set DNS server to Google Public DNS to resolve SRV record issues
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Service from "./models/Service.js";
import Booking from "./models/Booking.js";
import ProviderApplication from "./models/ProviderApplication.js";
import cors from "cors";


dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ FIX CORS (frontend port)
app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

app.use(express.json());


// ✅ API route
app.get("/api/services", async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ API route for single service
app.get("/api/services/:id", async (req, res) => {
    try {
        const service = await Service.findOne({ id: req.params.id });
        if (!service) return res.status(404).json({ message: "Service not found" });
        res.json(service);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.post("/api/chat", async (req, res) => {
    console.log("✅ /api/chat HIT");
    const userMessage = req.body.message;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are an assistant for a service app. Suggest services like cleaning, plumbing, electrician, salon."
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ]
            })
        });

        const data = await response.json();

        // 🔥 ADD THIS (VERY IMPORTANT)
        console.log("OPENAI RESPONSE:", data);

        if (!response.ok) {
            console.error("❌ OpenAI Error:", data);
            return res.status(500).json({ error: "AI failed" });
        }

        const reply = data.choices[0].message.content;

        res.json({ reply });

    } catch (err) {
        console.error("❌ Server Error:", err);
        res.status(500).json({ error: "Chatbot error" });
    }
});



// ✅ POST create booking
import bookingRoutes from "./routes/bookingroutes.js";
app.use("/api/bookings", bookingRoutes);

// --- CHATBOT PROVIDER SEARCH ROUTE ---
app.post("/api/providers", async (req, res) => {
    console.log("API HIT ✅ /api/providers", req.body);
    const { service } = req.body;

    if (!service) {
        return res.status(400).json({ message: "Service is required" });
    }

    try {
        const keywords = service.toLowerCase().split(" ");

        const providers = await ProviderApplication.find({
            status: "approved",
            $or: [
                {
                    serviceCategory: { $regex: service, $options: "i" }
                },
                {
                    services: {
                        $elemMatch: {
                            name: { $regex: keywords.join(".*"), $options: "i" }
                        }
                    }
                }
            ]
        });

        const formatted = providers.map((p) => ({
            name: p.personalDetails?.name || "Unknown Provider",
            phone: p.personalDetails?.phone || "N/A",
            category: p.serviceCategory || "N/A",
            services: p.services || [],
            experience: p.experience || "N/A",
            area: p.serviceArea || "N/A",
        }));

        res.json({ providers: formatted });
    } catch (err) {
        console.error("Error in /api/providers:", err);
        res.status(500).json({ error: "Failed to fetch providers" });
    }
});

// Socket.IO
import providerRoutes from "./routes/providerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

app.use("/api/provider", providerRoutes);
app.use("/api/admin", adminRoutes);

export const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

export const providers = {};
io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    socket.on("register_provider", (providerName) => {
        providers[providerName] = socket.id;
        console.log("✅ Provider registered:", providerName, socket.id);
    });

    socket.on("join_admin", () => {
        socket.join("admin_room");
        console.log("Admin joined room");


    });

    // Admin assigning a job
    socket.on("assign_job", async ({ bookingId, providerName }) => {
        try {
            console.log(`Assigning job ${bookingId} to ${providerName}`);
            const updatedBooking = await Booking.findByIdAndUpdate(
                bookingId,
                { status: "assigned", assignedProvider: providerName },
                { new: true }
            );
            // Broadcast to everyone (admin + providers)
            io.emit("job_updated", updatedBooking);
        } catch (e) {
            console.error("Error assigning job:", e);
        }
    });

    // Provider/Admin updating status
    socket.on("update_status", async ({ bookingId, status }) => {
        try {
            console.log(`Updating job ${bookingId} to ${status}`);
            const updatedBooking = await Booking.findByIdAndUpdate(
                bookingId,
                { status },
                { new: true }
            );
            io.emit("job_updated", updatedBooking);
        } catch (e) {
            console.error("Error updating status:", e);
        }
    });

    // Chat Message System
    socket.on("join_tracking", (bookingId) => {
        socket.join(`tracking_${bookingId}`);
        console.log(`User joined tracking room: tracking_${bookingId}`);
    });

    socket.on("send_message", async ({ bookingId, sender, text }) => {
        try {
            const message = { sender, text, timestamp: new Date() };

            // Save to DB
            const updatedBooking = await Booking.findByIdAndUpdate(
                bookingId,
                { $push: { messages: message } },
                { new: true }
            );

            // Broadcast back to the room
            io.to(`tracking_${bookingId}`).emit("receive_message", message);
            console.log(`💬 Message sent in tracking_${bookingId}:`, message);
        } catch (e) {
            console.error("Error sending message:", e);
        }
    });

    // Relay job updates (for manual emits from frontend)
    socket.on("job_updated", (data) => {
        io.emit("job_updated", data);
    });

    socket.on("provider-location", async (data) => {
        try {
            console.log("📍 Provider Location:", data);
            if (data.bookingId && data.lat && data.lng) {
                await Booking.findByIdAndUpdate(data.bookingId, {
                    providerLocation: {
                        lat: data.lat,
                        lng: data.lng,
                        eta: data.eta,
                        address: data.address,
                        lastUpdated: new Date()
                    }
                });
                // Ensure provider broadcasts to their specific room too, so users on tracking screen don't listen to all providers
                io.to(`tracking_${data.bookingId}`).emit("providerLocationUpdate", data);
            }
            socket.broadcast.emit("providerLocationUpdate", data); // Keep broadcasting global
        } catch (e) {
            console.error("Error saving location:", e);
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;

console.log("MONGODB_URI =", process.env.MONGODB_URI);

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("✅ MongoDB Connected");

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("❌ MongoDB connection error:", err.message);
    });