import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Star, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { useBooking } from "../context/booking-context";
import { services } from "../data/services";
import { AddOn } from "../types";
import { ServiceVariants } from "../components/service/ServiceVariants";

export function ServiceDetailsPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useBooking();
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);

  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-12 text-center">
        <p className="text-slate-500">Service not found</p>
      </div>
    );
  }

  if (service.id === 'deep-house-cleaning') {
  return (
    <div className="p-10 text-center">
      Deep House Cleaning variants page
    </div>
  );
}


  const toggleAddOn = (addOn: AddOn) => {
    setSelectedAddOns((prev) =>
      prev.some((a) => a.id === addOn.id)
        ? prev.filter((a) => a.id !== addOn.id)
        : [...prev, addOn]
    );
  };

  const handleAddToCart = () => {
    addToCart(service, selectedAddOns);
    navigate("/checkout");
  };

  const handleAddToCartOnly = () => {
    addToCart(service, selectedAddOns);
    // Optional: show toast
  };

  const totalPrice =
    service.price +
    selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-xl bg-slate-100 text-5xl">
              {service.image.startsWith("http") ? (
                <img src={service.image} alt={service.name} className="h-full w-full object-cover rounded-xl" />
              ) : (
                service.image
              )}
            </div>
            <h1 className="mb-4 text-3xl font-bold text-slate-900">
              {service.name}
            </h1>
            <div className="mb-6 flex items-center gap-6">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-slate-900">
                  {service.rating}
                </span>
                <span className="text-slate-500">
                  ({service.reviewCount} reviews)
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <Clock className="h-5 w-5" />
                <span>{service.duration} minutes</span>
              </div>
            </div>
            <p className="text-slate-700">{service.description}</p>
          </div>

          {/* Add-ons */}
          {service.addOns && service.addOns.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-slate-900">
                Add-ons
              </h2>
              <div className="space-y-3">
                {service.addOns.map((addOn) => {
                  const isSelected = selectedAddOns.some((a) => a.id === addOn.id);
                  return (
                    <button
                      key={addOn.id}
                      onClick={() => toggleAddOn(addOn)}
                      className={`w-full rounded-xl border p-4 text-left transition-all ${isSelected
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded border ${isSelected
                                  ? "border-primary bg-primary"
                                  : "border-slate-300"
                                }`}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <h3 className="font-medium text-slate-900">
                              {addOn.name}
                            </h3>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {addOn.description}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                            <span>+{addOn.duration} min</span>
                            <span className="font-semibold text-slate-900">
                              +₹{addOn.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="mb-2 text-sm text-slate-500">Starting from</div>
              <div className="text-3xl font-bold text-slate-900">
                ₹{service.price}
              </div>
              {selectedAddOns.length > 0 && (
                <div className="mt-2 text-sm text-slate-600">
                  Total: ₹{totalPrice}
                </div>
              )}
            </div>
            <Button onClick={handleAddToCart} className="w-full" size="lg">
              Book Now
            </Button>
            <Button
              onClick={handleAddToCartOnly}
              variant="outline"
              className="mt-3 w-full"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
