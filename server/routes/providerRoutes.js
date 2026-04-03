import express from "express";
import ProviderApplication from "../models/ProviderApplication.js";

const router = express.Router();

// POST create application
router.post("/register", async (req, res) => {
    try {
        const application = await ProviderApplication.create(req.body);
        res.status(201).json(application);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET provider status by email
router.get("/status/:email", async (req, res) => {
    try {
        const provider = await ProviderApplication.findOne({ email: req.params.email });
        if (!provider) return res.status(404).json({ message: "Provider not found" });
        
        // Dynamic availability check based on pause dates
        const now = new Date();
        let updated = false;

        if (!provider.isAvailable && provider.pauseEndDate && now > provider.pauseEndDate) {
            // End date passed -> auto resume
            provider.isAvailable = true;
            provider.pauseStartDate = null;
            provider.pauseEndDate = null;
            updated = true;
        } else if (provider.isAvailable && provider.pauseStartDate && provider.pauseEndDate) {
             // Currently active, but maybe we entered the pause period
             if (now >= provider.pauseStartDate && now <= provider.pauseEndDate) {
                 provider.isAvailable = false;
                 updated = true;
             }
        }

        if (updated) {
            await provider.save();
        }

        res.json(provider);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT toggle immediate availability
router.put("/availability/:id", async (req, res) => {
    try {
        const { isAvailable } = req.body;
        const provider = await ProviderApplication.findById(req.params.id);
        if (!provider) return res.status(404).json({ message: "Provider not found" });

        provider.isAvailable = isAvailable;
        if (isAvailable) {
            // If immediately making available, clear any pause schedules
            provider.pauseStartDate = null;
            provider.pauseEndDate = null;
        } else {
            // Unassign all upcoming jobs since provider is indefinitely paused
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Include today's jobs
            const Booking = (await import('../models/Booking.js')).default;
            await Booking.updateMany(
                {
                    assignedProvider: provider.personalDetails.name,
                    status: "assigned",
                    date: { $gte: now }
                },
                {
                    $set: { status: "pending", assignedProvider: null }
                }
            );
        }
        await provider.save();
        res.json(provider);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST schedule a pause service
router.post("/pause-service", async (req, res) => {
    try {
        const { providerId, startDate, endDate } = req.body;
        const provider = await ProviderApplication.findById(providerId);
        if (!provider) return res.status(404).json({ message: "Provider not found" });
        
        if (!startDate || !endDate) {
            // Immediate pause indefinitely
            provider.isAvailable = false;
            provider.pauseStartDate = null;
            provider.pauseEndDate = null;
        } else {
            // Scheduled pause
            provider.pauseStartDate = new Date(startDate);
            provider.pauseEndDate = new Date(endDate);
            
            const now = new Date();
            if (now >= provider.pauseStartDate && now <= provider.pauseEndDate) {
               provider.isAvailable = false;
            } else if (now < provider.pauseStartDate) {
               provider.isAvailable = true; // Will pause when the date arrives
            }

            // Unassign jobs that fall within the pause period
            const Booking = (await import('../models/Booking.js')).default;
            await Booking.updateMany(
                {
                    assignedProvider: provider.personalDetails.name,
                    status: "assigned",
                    date: {
                        $gte: provider.pauseStartDate,
                        $lte: provider.pauseEndDate
                    }
                },
                {
                    $set: { status: "pending", assignedProvider: null }
                }
            );
        }
        
        await provider.save();
        res.json(provider);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST resume service immediately
router.post("/resume-service", async (req, res) => {
     try {
        const { providerId } = req.body;
        const provider = await ProviderApplication.findById(providerId);
        if (!provider) return res.status(404).json({ message: "Provider not found" });
        
        provider.isAvailable = true;
        provider.pauseStartDate = null;
        provider.pauseEndDate = null;
        
        await provider.save();
        res.json(provider);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// GET all applications (for admin)
router.get("/applications", async (req, res) => {
    try {
        const applications = await ProviderApplication.find().sort({ createdAt: -1 });
        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
