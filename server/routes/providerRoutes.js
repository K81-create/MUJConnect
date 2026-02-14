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
