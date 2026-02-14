import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' }, // Store reference or full object depending on need. Storing full snapshot is safer for history.
    // Actually, let's store a snapshot of the service details to preserve history
    serviceId: { type: String, required: true },
    serviceName: { type: String, required: true },
    price: { type: Number, required: true },
    selectedAddOns: [{
        id: { type: String },
        name: { type: String },
        price: { type: Number }
    }],
    quantity: { type: Number, required: true },
}, { _id: false });

const BookingSchema = new mongoose.Schema({
    address: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    items: [CartItemSchema],
    totalAmount: { type: Number, required: true },
    paymentMethod: {
        type: String,
        enum: ['cod', 'qr'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    assignedProvider: { type: String, default: null }, // Could be ObjectId ref to a Provider model
    statusHistory: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String
    }],
    createdAt: { type: Date, default: Date.now },
    providerLocation: {
        lat: { type: Number },
        lng: { type: Number },
        lastUpdated: { type: Date }
    }
});

export const Booking = mongoose.model('Booking', BookingSchema);
