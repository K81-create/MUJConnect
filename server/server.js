import express from "express";
import http from "http";
import dns from "dns";

// Set DNS server to Google Public DNS to resolve SRV record issues
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Service from "./models/Service.js";
import Booking from "./models/Booking.js";
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



// ✅ POST create booking
import bookingRoutes from "./routes/bookingroutes.js";
app.use("/api/bookings", bookingRoutes);

// Socket.IO
// Socket.IO
import providerRoutes from "./routes/providerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

app.use("/api/provider", providerRoutes);
app.use("/api/admin", adminRoutes);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

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
            }
            socket.broadcast.emit("providerLocationUpdate", data); // Keep broadcasting
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