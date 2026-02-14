import mongoose from "mongoose";

const providerApplicationSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        email: { type: String, required: true },
        personalDetails: {
            name: { type: String, required: true },
            phone: { type: String, required: true },
        },
        serviceCategory: { type: String, required: true },
        services: [{
            name: { type: String, required: true },
            price: { type: Number, default: 0 }
        }],
        description: { type: String },
        experience: { type: Number, required: true },
        serviceArea: { type: String, required: true },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("ProviderApplication", providerApplicationSchema);
