import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, MapPin, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "../ui/sheet";
import { useBooking } from "../../context/booking-context";

export function Navbar() {
  const [location, setLocation] = useState("Manipal University Jaipur");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { cart, removeFromCart, getTotalPrice } = useBooking();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
              MC
            </div>
            <span className="hidden text-lg font-semibold text-slate-900 sm:block">
              MUJConnect
            </span>
          </Link>

          {/* Location Selector */}
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 sm:flex">
            <MapPin className="h-4 w-4" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent outline-none"
            >
              <option value="Manipal University Jaipur">Manipal University Jaipur</option>
              <option value="Dehmi Kalan">Dehmi Kalan</option>
              <option value="Amer">Amer</option>
              <option value="Vaishali Nagar">Vaishali Nagar</option>
              <option value="Ajmer Road">Ajmer Road</option>
              <option value="Jagatpura">Jagatpura</option>
              <option value="Jaipur City">Jaipur City</option>

            </select>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-md sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search for services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Mobile Search */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/services")}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                    {cart.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-sm text-slate-500">
                    Your cart is empty
                  </p>
                ) : (
                  <>
                    {cart.map((item) => {
                      const itemTotal = item.service.price * item.quantity +
                        item.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0) * item.quantity;
                      return (
                        <div
                          key={item.service.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900">
                                {item.service.name}
                              </h4>
                              <p className="mt-1 text-sm text-slate-500">
                                ₹{item.service.price} × {item.quantity}
                              </p>
                              {item.selectedAddOns.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {item.selectedAddOns.map((addOn) => (
                                    <div key={addOn.id} className="text-xs text-slate-600">
                                      + {addOn.name} (₹{addOn.price})
                                    </div>
                                  ))}
                                </div>
                              )}
                              <p className="mt-2 text-sm font-semibold text-slate-900">
                                ₹{itemTotal}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => removeFromCart(item.service.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    <div className="mt-6 border-t border-slate-200 pt-4">
                      <div className="flex items-center justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>₹{getTotalPrice()}</span>
                      </div>
                      <SheetClose asChild>
                        <Link to="/checkout">
                          <Button className="mt-4 w-full">Proceed to Checkout</Button>
                        </Link>
                      </SheetClose>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
