import express from "express";
import Booking from "../models/Booking.js";

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

// ✅ PUT assign booking (Provider accepts job)
router.put("/:id/assign", async (req, res) => {
    try {
        const { providerName } = req.body;
        console.log(`[PUT] Assigning booking ${req.params.id} to ${providerName}`);
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
        const booking = await Booking.create(req.body);
        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;