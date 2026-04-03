import { useState } from "react";
import { useAuth } from "../context/auth-context";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar } from "../components/ui/calendar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useBooking } from "../context/booking-context";
import { createBooking } from "../api/client";

const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM"
];

import { PaymentSelection } from "../components/dashboard/PaymentSelection";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, booking, updateBooking, clearCart, getTotalPrice, addConfirmedBooking } = useBooking();
  const { user } = useAuth();
  const [showPayment, setShowPayment] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-12 text-center">
        <p className="mb-4 text-slate-500">Your cart is empty</p>
        <Button onClick={() => navigate("/services")}>Browse Services</Button>
      </div>
    );
  }

  const handleBookClick = () => {
    setShowPayment(true);
  };

  const handlePaymentConfirm = async (method: 'cod' | 'qr') => {
    // 1. Submit to Backend
    const totalPrice = getTotalPrice();
    const bookingData = {
      address: booking.address,
      date: booking.date,
      time: booking.time,
      totalAmount: totalPrice,
      paymentMethod: method,
      items: cart.map(item => ({
        serviceId: item.service.id,
        serviceName: item.service.name,
        price: item.service.price,
        quantity: item.quantity,
        selectedAddOns: item.selectedAddOns.map(addon => ({
          id: addon.id,
          name: addon.name,
          price: addon.price
        }))
      })),
      // Optional: Add user info if auth is integrated
      userId: user?.id,
      customerName: user?.name || "Guest User",
      customerEmail: user?.email,
    };

    try {
      const createdBooking = await createBooking(bookingData);

      // 2. Update Local State (for Dashboard View)
      // Use the actual response from the server which contains the real _id
      addConfirmedBooking(createdBooking);
      clearCart();
      navigate("/booking-confirmed");
    } catch (error: any) {
      console.error("Booking failed", error);
      alert(error.message || "Failed to confirm booking. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Delivery Address
            </h2>
            <Input
              placeholder="Enter your address"
              value={booking.address}
              onChange={(e) => updateBooking({ address: e.target.value })}
              className="mb-3"
            />
            <Input
              placeholder="Apartment, suite, etc. (optional)"
              className="mb-3"
            />
            <Input placeholder="City" className="mb-3" />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="State" />
              <Input placeholder="PIN Code" />
            </div>
          </div>

          {/* Date Selection */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Select Date
            </h2>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={booking.date || undefined}
                onSelect={(date: Date | undefined) => updateBooking({ date: date || null })}
                disabled={(date: Date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
            </div>
          </div>

          {/* Time Selection */}
          {booking.date && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">
                Select Time
              </h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => updateBooking({ time })}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${booking.time === time
                      ? "border-primary bg-primary text-white"
                      : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                      }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-slate-900">
              Order Summary
            </h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.service.id} className="border-b border-slate-100 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      {item.service.image && (
                        <img src={item.service.image} alt={item.service.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 text-sm">
                        {item.service.name}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Qty: {item.quantity}
                      </p>
                      {item.selectedAddOns.length > 0 && (
                        <div className="mt-2 text-xs text-slate-600">
                          {item.selectedAddOns.map((addOn) => (
                            <div key={addOn.id}>+ {addOn.name}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-900">
                        ₹{item.service.price * item.quantity}
                      </div>
                      {item.selectedAddOns.length > 0 && (
                        <div className="text-xs text-slate-500">
                          +₹
                          {item.selectedAddOns.reduce(
                            (sum, addOn) => sum + addOn.price,
                            0
                          ) * item.quantity}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-slate-200 pt-4">
              <div className="mb-4 flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{getTotalPrice()}</span>
              </div>
              <Button
                onClick={handleBookClick}
                className="w-full"
                size="lg"
                disabled={!booking.address || !booking.date || !booking.time}
              >
                Proceed to Payment
              </Button>
            </div>
          </div>
        </div>
      </div>
      <PaymentSelection
        open={showPayment}
        onOpenChange={setShowPayment}
        onConfirm={handlePaymentConfirm}
        totalAmount={getTotalPrice()}
      />
    </div>
  );
}
