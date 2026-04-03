import express from "express";
import Booking from "../models/Booking.js";
import { io, providers } from "../server.js";

const router = express.Router();


// ✅ GET all bookings (Admin)
router.get("/", async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ GET pending bookings (Provider Marketplace)
router.get("/pending", async (req, res) => {
    try {
        const bookings = await Booking.find({ status: "pending" }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ GET specific booking by ID
router.get("/:id", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ GET bookings by user ID
router.get("/user/:userId", async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ PUT update provider location
// ✅ PUT update provider location (FIXED + VALIDATION)
router.put("/:id/location", async (req, res) => {
    try {
        const { lat, lng } = req.body;

        const latitude = Number(lat);
        const longitude = Number(lng);

        // Validate coordinates
        if (
            isNaN(latitude) ||
            isNaN(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({ message: "Invalid coordinates" });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            {
                providerLocation: {
                    lat: latitude,
                    lng: longitude,
                    eta: req.body.eta,
                    address: req.body.address,
                    lastUpdated: new Date()
                },
            },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json({
            message: "Provider location updated",
            providerLocation: booking.providerLocation,
            booking,
        });
    } catch (err) {
        console.error("Location update error:", err);
        res.status(500).json({ message: "Server error" });
    }
});


// ✅ GET bookings by provider name
router.get("/provider/:name", async (req, res) => {
    try {
        const name = decodeURIComponent(req.params.name);
        const bookings = await Booking.find({ assignedProvider: name }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

import ProviderApplication from "../models/ProviderApplication.js";

// ✅ PUT assign booking (Provider accepts job)
router.put("/:id/assign", async (req, res) => {
    try {
        const { providerName } = req.body;
        console.log(`[PUT] Assigning booking ${req.params.id} to ${providerName}`);

        // --- NEW VALIDATION: Prevent assigning to a paused provider ---
        const bookingToAssign = await Booking.findById(req.params.id);
        if (!bookingToAssign) return res.status(404).json({ message: "Booking not found" });

        const provider = await ProviderApplication.findOne({ 'personalDetails.name': providerName });
        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }

        let active = provider.isAvailable;
        const bookingDate = new Date(bookingToAssign.date);

        // evaluate schedule override specifically for the booking date
        if (provider.isAvailable && provider.pauseStartDate && provider.pauseEndDate) {
            if (bookingDate >= provider.pauseStartDate && bookingDate <= provider.pauseEndDate) {
                active = false;
            }
        } else if (!provider.isAvailable && provider.pauseEndDate && bookingDate > provider.pauseEndDate) {
            active = true;
        }

        if (!active) {
             return res.status(400).json({ message: `Cannot assign: Provider '${providerName}' is currently paused and unavailable on this date.` });
        }
        // -------------------------------------------------------------

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: "assigned", assignedProvider: providerName },
            { new: true }
        );
        console.log("Updated booking:", booking);
        res.json(booking);
    } catch (err) {
        console.error("Assign error:", err);
        res.status(400).json({ message: err.message });
    }
});



// ✅ POST create booking
router.post("/", async (req, res) => {
    try {
        const { userId, providerName, service } = req.body;

        // Check if there are ANY available and approved providers in the platform
        // If the user tried to select a specific one, check that one, otherwise check globally
        let providerQuery = { status: "approved" };
        if (providerName) {
            providerQuery['personalDetails.name'] = providerName;
        }

        const availableProviders = await ProviderApplication.find(providerQuery);
        
        let hasActive = false;
        const now = new Date();
        for (const p of availableProviders) {
            let active = p.isAvailable;
            // evaluate schedule override
            if (p.isAvailable && p.pauseStartDate && p.pauseEndDate) {
                if (now >= p.pauseStartDate && now <= p.pauseEndDate) {
                    active = false;
                }
            } else if (!p.isAvailable && p.pauseEndDate && now > p.pauseEndDate) {
                active = true;
            }
            if (active) {
                hasActive = true;
                break;
            }
        }

        if (!hasActive && availableProviders.length > 0) {
            return res.status(400).json({ message: "Currently Unavailable: No active providers at the moment." });
        } else if (availableProviders.length === 0) {
            return res.status(400).json({ message: "No approved providers found." });
        }

        // ✅ Create booking (ONLY ONCE)
        const booking = await Booking.create({
            userId,
            providerName,
            service,
            ...req.body
        });

        // 🔔 SEND REAL-TIME NOTIFICATION
        if (providerName && providers[providerName]) {
            const providerSocket = providers[providerName];
            io.to(providerSocket).emit("new_booking", booking);
            console.log("✅ Notification sent to:", providerName);
        } else if (providerName) {
            console.log("⚠️ Provider not online:", providerName);
            // Still broadcast it so others might pick it up, or maybe handle explicitly?
            io.emit("new_booking", booking);
        } else {
            console.log("📢 Broadcasted unassigned booking to marketplace");
            io.emit("new_booking", booking);
        }

        res.status(201).json(booking);

    } catch (err) {
        console.error("Booking error:", err);
        res.status(400).json({ message: err.message });
    }
});

export default router;