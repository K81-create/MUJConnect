import React, { createContext, useContext, useState, ReactNode } from "react";
import { CartItem, Booking, Service, AddOn } from "../types";

// Extended Booking type to include status and ID for confirmed bookings
export interface ConfirmedBooking extends Booking {
  id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "assigned" | "in-progress";
  totalAmount: number;
  userId?: string; // To link to specific user if needed
  customerName?: string; // For stakeholder view
  assignedProvider?: string;
  _id?: string; // MongoDB ID fallback
}

interface BookingContextType {
  cart: CartItem[];
  booking: Booking;
  confirmedBookings: ConfirmedBooking[];
  addToCart: (service: Service, addOns?: AddOn[]) => void;
  removeFromCart: (serviceId: string) => void;
  decreaseQuantity: (serviceId: string) => void;
  updateBooking: (updates: Partial<Booking>) => void;
  addConfirmedBooking: (booking: ConfirmedBooking) => void;
  updateBookingStatus: (id: string, status: ConfirmedBooking["status"]) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [booking, setBooking] = useState<Booking>({
    address: "",
    date: null,
    time: "",
    items: []
  });
  const [confirmedBookings, setConfirmedBookings] = useState<ConfirmedBooking[]>([]);

  const addToCart = (service: Service, addOns: AddOn[] = []) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.service.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { service, selectedAddOns: addOns, quantity: 1 }];
    });
  };

  const removeFromCart = (serviceId: string) => {
    setCart((prev) => prev.filter((item) => item.service.id !== serviceId));
  };

  const decreaseQuantity = (serviceId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.service.id === serviceId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.service.id === serviceId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter((item) => item.service.id !== serviceId);
    });
  };

  const updateBooking = (updates: Partial<Booking>) => {
    setBooking((prev) => ({ ...prev, ...updates }));
  };

  const addConfirmedBooking = (newBooking: ConfirmedBooking) => {
    setConfirmedBookings(prev => [newBooking, ...prev]);
  };

  const updateBookingStatus = (id: string, status: ConfirmedBooking["status"]) => {
    setConfirmedBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const clearCart = () => {
    setCart([]);
    setBooking({ address: "", date: null, time: "", items: [] });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const servicePrice = item.service.price * item.quantity;
      const addOnsPrice = item.selectedAddOns.reduce(
        (sum, addOn) => sum + addOn.price,
        0
      );
      return total + servicePrice + addOnsPrice * item.quantity;
    }, 0);
  };

  return (
    <BookingContext.Provider
      value={{
        cart,
        booking,
        confirmedBookings,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        updateBooking,
        addConfirmedBooking,
        updateBookingStatus,
        clearCart,
        getTotalPrice
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return context;
}
