import { useState, useMemo } from "react";
import { Star, Check, Plus, Minus, Info, ShieldCheck, Sparkles, Beaker } from "lucide-react";
import { useBooking } from "../../context/booking-context";
import { Service } from "../../types";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { useNavigate } from "react-router-dom";

import { SERVICE_VARIANTS_DATA, ServiceVariant } from "../../data/service-variants";

interface ServiceVariantsProps {
    parentService: Service;
}

export function ServiceVariants({ parentService }: ServiceVariantsProps) {
    const categories = SERVICE_VARIANTS_DATA[parentService.id] || [];
    const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
    const [detailsVariant, setDetailsVariant] = useState<ServiceVariant | null>(null);
    const { cart, addToCart, decreaseQuantity, removeFromCart } = useBooking();
    const navigate = useNavigate();

    // Helper to maintain local quantities for "unit" based services in the UI
    // In a real app, this might sync directly with cart, but here we can modify quantities before adding?
    // Actually, for Urban Company style, you often add directly to cart with a counter.
    // So let's just read from existing cart to show current quantity.

    const getCartQuantity = (variantId: string) => {
        // We construct a unique ID for the cart item from the variant ID
        const cartItem = cart.find(item => item.service.id === variantId);
        return cartItem ? cartItem.quantity : 0;
    };

    const handleUpdateQuantity = (variant: ServiceVariant, delta: number) => {
        const currentQty = getCartQuantity(variant.id);
        const newQty = currentQty + delta;

        if (newQty < 0) return;

        if (newQty === 0) {
            removeFromCart(variant.id);
        } else {
            // We need to shape this variant as a "Service" compatible object
            // This is a bit of a hack to reuse the global types without refactoring everything
            const serviceObject: Service = {
                ...parentService,
                id: variant.id,
                name: variant.name,
                price: variant.unit ? (variant.pricePerUnit || variant.price) : variant.price,
                description: variant.description,
                duration: variant.duration,
                image: variant.image,
                rating: variant.rating,
                reviewCount: variant.reviewCount,
                // We handle logic: if it's unit based, price in cart item is unit price.
                // The context handles quantity multiplication.
            };

            // If we are adding (delta > 0)
            if (delta > 0) {
                // Add 1
                addToCart(serviceObject);
            } else {
                decreaseQuantity(variant.id);
            }
        }
    };

    // Actually, let's just write this component assuming I WILL update the context to support decrement
    // or I can manually reconstruct the cart.
    // I will update the context in the next step to add `decreaseQuantity` or `updateQuantity`.

    const totalPrice = useMemo(() => {
        return cart.reduce((total, item) => {
            return total + (item.service.price * item.quantity) + item.selectedAddOns.reduce((s, a) => s + a.price, 0);
        }, 0);
    }, [cart]);

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-8">
            <div className="grid gap-8 lg:grid-cols-12">
                {/* Left Sidebar - Categories */}
                <div className="lg:col-span-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm sticky top-24">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${activeCategory === cat.id
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                {cat.name}
                                {activeCategory === cat.id && <div className="h-2 w-2 rounded-full bg-slate-900" />}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-green-600" />
                            UC Promise
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3 text-sm text-slate-600">
                                <Check className="h-5 w-5 text-slate-400 shrink-0" />
                                <span>Verified Professionals</span>
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600">
                                <Beaker className="h-5 w-5 text-slate-400 shrink-0" />
                                <span>Safe Chemicals</span>
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600">
                                <Sparkles className="h-5 w-5 text-slate-400 shrink-0" />
                                <span>Superior Stain Removal</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Main Content - Variants */}
                <div className="lg:col-span-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">{parentService.name}</h1>
                        <div className="flex items-center gap-2 mt-2 text-slate-600">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-slate-900">{parentService.rating}</span>
                            <span>({parentService.reviewCount} reviews)</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {categories.find(c => c.id === activeCategory)?.variants.map((variant) => {
                            const qty = getCartQuantity(variant.id);

                            return (
                                <div key={variant.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-slate-900">{variant.name}</h3>
                                            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                                <Star className="h-4 w-4 fill-slate-300 text-slate-300" />
                                                <span className="text-slate-700 font-medium">{variant.rating} ({variant.reviewCount})</span>
                                                <span>•</span>
                                                <span>{variant.duration} mins</span>
                                            </div>
                                            <div className="mt-2 text-xl font-bold text-slate-900">
                                                ₹{variant.price}
                                                {variant.unit && <span className="text-sm font-normal text-slate-500"> for {variant.unit === 'bathroom' ? '2 bathrooms' : variant.unit}</span>}
                                            </div>
                                            <div className="mt-3 border-t border-dashed border-slate-200 pt-3">
                                                <ul className="text-sm text-slate-600 space-y-1">
                                                    {variant.features.map((feature, i) => (
                                                        <li key={i} className="flex items-center gap-2">
                                                            <span className="h-1 w-1 rounded-full bg-slate-400" />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="mt-4 flex items-center gap-4">
                                                <button onClick={() => setDetailsVariant(variant)} className="text-sm font-medium text-violet-600 hover:underline">View details</button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center justify-between gap-4">
                                            <div className="h-24 w-24 overflow-hidden rounded-lg bg-slate-100">
                                                <img src={variant.image} alt={variant.name} className="h-full w-full object-cover" />
                                            </div>

                                            {qty === 0 ? (
                                                <Button
                                                    variant="outline"
                                                    className="w-24 border-slate-300 text-violet-600 hover:border-violet-600 hover:bg-violet-50"
                                                    onClick={() => handleUpdateQuantity(variant, 1)}
                                                >
                                                    Add
                                                </Button>
                                            ) : (
                                                <div className="flex w-24 items-center justify-between rounded-lg border border-violet-100 bg-violet-50 px-2 py-1.5">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(variant, -1)}
                                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-violet-600 shadow-sm hover:bg-slate-50"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="font-semibold text-violet-700">{qty}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(variant, 1)}
                                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-violet-600 shadow-sm hover:bg-slate-50"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {categories.find(c => c.id === activeCategory)?.variants.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                No services available in this category yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Cart Summary */}
                <div className="hidden lg:col-span-3 lg:block">
                    <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-slate-900">Cart</h2>
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="mb-3 rounded-full bg-slate-100 p-3">
                                    <Check className="h-6 w-6 text-slate-400" />
                                </div>
                                <p className="text-sm text-slate-500">Your cart is empty</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item.service.id} className="flex justify-between text-sm">
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900">{item.service.name}</div>
                                            <div className="text-slate-500">x{item.quantity}</div>
                                        </div>
                                        <div className="font-medium text-slate-900">₹{item.service.price * item.quantity}</div>
                                    </div>
                                ))}
                                <div className="border-t border-slate-100 pt-4">
                                    <div className="flex justify-between font-bold text-slate-900">
                                        <span>Total</span>
                                        <span>₹{totalPrice}</span>
                                    </div>
                                </div>
                                <Button className="w-full mt-4" onClick={() => navigate('/checkout')}>
                                    Proceed
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Cart Float */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white p-4 shadow-lg lg:hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-slate-500">Total</div>
                            <div className="text-lg font-bold text-slate-900">₹{totalPrice}</div>
                        </div>
                        <Button onClick={() => navigate('/checkout')}>View Cart</Button>
                    </div>
                </div>
            )}

            {/* Details Sheet */}
            <Sheet open={!!detailsVariant} onOpenChange={(open) => !open && setDetailsVariant(null)}>
                <SheetContent className="overflow-y-auto w-full sm:max-w-md">
                    {detailsVariant && (
                        <>
                            <SheetHeader>
                                <SheetTitle>{detailsVariant.name}</SheetTitle>
                                <SheetDescription>
                                    {detailsVariant.description}
                                </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6">
                                <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-100 mb-6">
                                    <img src={detailsVariant.image} alt={detailsVariant.name} className="h-full w-full object-cover" />
                                </div>

                                <div className="space-y-6 text-sm">
                                    <div className="flex items-center justify-between border-b pb-4">
                                        <span className="text-slate-500">Price</span>
                                        <span className="font-bold text-lg text-slate-900">₹{detailsVariant.price}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b pb-4">
                                        <span className="text-slate-500">Duration</span>
                                        <span className="font-medium text-slate-900">{detailsVariant.duration} mins</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b pb-4">
                                        <span className="text-slate-500">Rating</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium text-slate-900">{detailsVariant.rating}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-3">What's included?</h4>
                                        <ul className="space-y-2">
                                            {detailsVariant.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                                                    <span className="text-slate-600">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <Button className="w-full" onClick={() => setDetailsVariant(null)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div >
    );
}
