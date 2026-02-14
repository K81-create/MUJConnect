import express from "express";
import ProviderApplication from "../models/ProviderApplication.js";

const router = express.Router();

// GET pending requests
router.get("/requests", async (req, res) => {
    try {
        console.log("Admin requesting pending applications...");
        const requests = await ProviderApplication.find({ status: "pending" }).sort({ createdAt: -1 });
        console.log(`Found ${requests.length} pending requests`);
        res.json(requests);
    } catch (err) {
        console.error("Admin requests error:", err);
        res.status(500).json({ message: err.message });
    }
});

// GET approved providers
router.get("/providers", async (req, res) => {
    try {
        const providers = await ProviderApplication.find({ status: "approved" }).sort({ createdAt: -1 });
        res.json(providers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT update request status (approve/reject)
router.put("/request/:id", async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const updated = await ProviderApplication.findByIdAndUpdate(
            req.params.id,
            { status, rejectionReason },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
