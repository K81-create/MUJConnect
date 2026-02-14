import mongoose from 'mongoose';

const ProviderProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Link to Auth ID or Email
    email: { type: String, required: true },
    personalDetails: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
    },
    serviceCategory: { type: String, required: true },
    services: [{
        name: { type: String },
        price: { type: Number }
    }], // List of specific services offered by provider
    description: { type: String },
    experience: { type: Number, required: true },
    serviceArea: { type: String, required: true },
    documents: [{
        type: { type: String, enum: ['id_proof', 'certificate'] },
        url: { type: String } // Mock URL or Base64 for now
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: { type: String },
    isAvailable: { type: Boolean, default: false }
}, { timestamps: true });

export const ProviderProfile = mongoose.model('ProviderProfile', ProviderProfileSchema);
