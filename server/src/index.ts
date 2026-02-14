import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './db/connect';
import { Service } from './models/Service';
import { Category } from './models/Category';
import { Booking } from './models/Booking';
import { ProviderProfile } from './models/ProviderProfile';

// Load env vars
dotenv.config();

import locationRoutes from './routes/location';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io Setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all for now, in prod specify URL
        methods: ["GET", "POST"]
    }
});

// Attach io to app for routes to use
app.set('io', io);

// Socket Events
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join admin room
    socket.on('join_admin', () => {
        socket.join('admin_room');
        console.log(`Socket ${socket.id} joined admin_room`);
    });

    // Assign Job (Admin -> Server -> User)
    socket.on('assign_job', async (data) => {
        try {
            const { bookingId, providerName } = data;
            const booking = await Booking.findByIdAndUpdate(
                bookingId,
                {
                    status: 'assigned',
                    assignedProvider: providerName,
                    $push: {
                        statusHistory: {
                            status: 'assigned',
                            note: `Assigned to ${providerName}`
                        }
                    }
                },
                { new: true }
            );

            if (booking) {
                // Emit to everyone (or specific user room if we tracked it)
                io.emit('job_updated', booking);
                io.to('admin_room').emit('job_assigned_success', booking);
            }
        } catch (error) {
            console.error('Assignment error', error);
        }
    });

    // Update Status (Provider/Admin -> Server -> User)

    socket.on('update_status', async (data) => {
        try {
            const { bookingId, status, note } = data;
            const booking = await Booking.findByIdAndUpdate(
                bookingId,
                {
                    status: status,
                    $push: {
                        statusHistory: {
                            status: status,
                            note: note || `Status updated to ${status}`
                        }
                    }
                },
                { new: true }
            );

            if (booking) {
                io.emit('job_updated', booking);
            }
        } catch (error) {
            console.error('Status update error', error);
        }
    });

    // Admin Actions (Approve/Reject Provider)
    socket.on('admin_action', (data) => {
        // Notify specific user (using email room or general broadcast with filter)
        // For simplicity, broadcasting to all, client filters by email
        io.emit('provider_status_update', data);
    });

    // --- LIVE TRACKING EVENTS ---

    // User/Provider joins a tracking room for a specific booking
    socket.on('join_tracking', (bookingId) => {
        socket.join(`tracking_${bookingId}`);
        console.log(`Socket ${socket.id} joined tracking_${bookingId}`);
    });

    socket.on('leave_tracking', (bookingId) => {
        socket.leave(`tracking_${bookingId}`);
        console.log(`Socket ${socket.id} left tracking_${bookingId}`);
    });

    // Provider sends location update
    socket.on('provider_location_update', (data) => {
        const { bookingId, location } = data;
        // Relay to everyone in the tracking room (User dashboard)
        io.to(`tracking_${bookingId}`).emit('location_updated', location);
        console.log(`Location update for ${bookingId}:`, location);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Routes

// GET all services
app.get('/api/services', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET single service
app.get('/api/services/:id', async (req, res) => {
    try {
        const service = await Service.findOne({ id: req.params.id });
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET all bookings (for Admin)
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings' });
    }
});

// GET pending bookings (for Providers to pick up)
app.get('/api/bookings/pending', async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending bookings' });
    }
});

// GET single booking
app.get('/api/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking' });
    }
});

// CREATE a booking
app.post('/api/bookings', async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        // Notify EVERYONE of new booking (so providers see it immediately)
        io.emit('new_booking', booking);
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking' });
    }
});

// SEED Database (One-time use usually, or for dev)
app.post('/api/seed', async (req, res) => {
    try {
        const { services, categories } = req.body;

        await Service.deleteMany({});
        await Category.deleteMany({});

        await Service.insertMany(services);
        await Category.insertMany(categories);

        res.json({ message: 'Database seeded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error seeding database' });
    }
});


// --- PROVIDER / STAKEHOLDER ROUTES ---

// Register as Provider
app.post('/api/provider/register', async (req, res) => {
    try {
        const existing = await ProviderProfile.findOne({ email: req.body.email });
        if (existing) {
            const updated = await ProviderProfile.findOneAndUpdate(
                { email: req.body.email },
                req.body,
                { new: true }
            );
            io.to('admin_room').emit('new_provider_request', updated);
            return res.json(updated);
        }

        const profile = new ProviderProfile(req.body);
        await profile.save();
        io.to('admin_room').emit('new_provider_request', profile);
        res.status(201).json(profile);
    } catch (error: any) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Error registering provider', error: error.message || error });
    }
});

// Update Provider Services
app.put('/api/provider/:id/services', async (req, res) => {
    try {
        const { services } = req.body;
        const profile = await ProviderProfile.findByIdAndUpdate(
            req.params.id,
            { services },
            { new: true }
        );
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Error updating services' });
    }
});

// Get Provider Status
app.get('/api/provider/status/:email', async (req, res) => {
    try {
        const profile = await ProviderProfile.findOne({ email: req.params.email });
        if (!profile) return res.status(404).json({ message: 'Not found' });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Bookings for Provider
app.get('/api/bookings/provider/:name', async (req, res) => {
    try {
        // Fetch bookings assigned to this provider
        // Also include pending ones IF that's the logic (for now, let's just fetch assigned)
        const bookings = await Booking.find({
            assignedProvider: req.params.name
        }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching provider bookings' });
    }
});

// --- LOCATION ROUTES ---
app.use('/api/location', locationRoutes);

// --- ADMIN ROUTES ---

// Get Pending Requests
app.get('/api/admin/requests', async (req, res) => {
    try {
        const requests = await ProviderProfile.find({ status: 'pending' });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests' });
    }
});

// Get All Providers (for list)
app.get('/api/admin/providers', async (req, res) => {
    try {
        const providers = await ProviderProfile.find({ status: 'approved' });
        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching providers' });
    }
});

// Approve/Reject Provider
app.put('/api/admin/request/:id', async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const profile = await ProviderProfile.findByIdAndUpdate(
            req.params.id,
            {
                status,
                rejectionReason: status === 'rejected' ? rejectionReason : undefined,
                isAvailable: status === 'approved' // Default to available on approval
            },
            { new: true }
        );

        if (profile) {
            io.emit('provider_status_update', profile); // Notify client
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Error updating status' });
    }
});

// Toggle Availability
app.put('/api/provider/availability/:id', async (req, res) => {
    try {
        const { isAvailable } = req.body;
        const profile = await ProviderProfile.findByIdAndUpdate(
            req.params.id,
            { isAvailable },
            { new: true }
        );
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Error updating availability' });
    }
});

// Update Provider Details (Personal & Service Area)
app.put('/api/provider/:id/details', async (req, res) => {
    try {
        const { personalDetails, serviceArea, experience } = req.body;

        // Construct update object to avoid overwriting entire document
        // Using $set to update specific fields safely
        const updateData: any = {};
        if (personalDetails) updateData.personalDetails = personalDetails;
        if (serviceArea) updateData.serviceArea = serviceArea;
        if (experience) updateData.experience = experience;

        const profile = await ProviderProfile.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        if (profile) {
            // Notify admin or user if needed (optional)
            io.to('admin_room').emit('new_provider_request', profile); // Update admin view to reflect changes
        }
        res.json(profile);
    } catch (error) {
        console.error("Update details error:", error);
        res.status(500).json({ message: 'Error updating details' });
    }
});

// Start Server
const start = async () => {
    await connectDB();
    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

start();
