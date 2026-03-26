import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: false },
    customerName: { type: String, required: false }, // Optional for guests
    customerEmail: { type: String, required: false },

    items: [{
      serviceId: { type: String, required: true },
      serviceName: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      selectedAddOns: [{
        id: String,
        name: String,
        price: Number
      }]
    }],

    date: { type: Date, required: true },
    time: { type: String, required: true },
    address: { type: String, required: true },
    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "assigned", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    assignedProvider: { type: String }, // Stores provider name
    providerPhone: { type: String, default: "1234567890" }, // Phone for Calling
    providerLocation: {
      lat: Number,
      lng: Number,
      eta: String, // e.g. "15 mins"
      address: String, // Manual location address
      lastUpdated: Date
    },
    messages: [{
      sender: { type: String, enum: ["user", "provider"], required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);