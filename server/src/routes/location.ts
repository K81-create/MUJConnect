import express from 'express';
import { Booking } from '../models/Booking';

const router = express.Router();

// Initialize io via a middleware or setter if possible, or we will just use it if attached to req
// For now, let's assume we can emit from here if we can access io.
// An easier way in this structure is to pass io instance to the route or export it from index.
// Given strict TS and circular deps, let's keep it simple: API updates DB, client also emits socket.
// OR: the better way: API updates DB -> Server Emits Socket.

// Let's rely on the plan: POST /api/location/update -> provider sends location (lat, lng)
router.post('/update', async (req, res) => {
    try {
        const { bookingId, lat, lng } = req.body;

        if (!bookingId || lat === undefined || lng === undefined) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                providerLocation: {
                    lat,
                    lng,
                    lastUpdated: new Date()
                }
            },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // We can emit socket event here if we have reference to `io`. 
        // For now, we will assume strict separation or pass it in. 
        // Actually, in index.ts we can attach io to req.
        const io = (req as any).app.get('io');
        if (io) {
            io.to(`tracking_${bookingId}`).emit('location_updated', { lat, lng });
        }

        res.json({ message: 'Location updated', location: booking.providerLocation });
    } catch (error) {
        console.error('Location update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:bookingId', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        res.json(booking.providerLocation || { message: 'No location data yet' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
