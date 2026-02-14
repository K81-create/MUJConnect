export interface ServiceVariant {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    price: number;
    duration: number;
    description: string;
    image: string;
    unit?: string;
    pricePerUnit?: number;
    features: string[];
}

export interface ServiceCategory {
    id: string;
    name: string;
    variants: ServiceVariant[];
}

export const SERVICE_VARIANTS_DATA: Record<string, ServiceCategory[]> = {
    "deep-house-cleaning": [
        {
            id: "combos",
            name: "Combos",
            variants: [
                {
                    id: "classic-cleaning",
                    name: "Classic Cleaning",
                    rating: 4.8,
                    reviewCount: 1250,
                    price: 858,
                    duration: 90,
                    description: "Standard cleaning for bathrooms. Select quantity.",
                    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80",
                    unit: "bathroom",
                    pricePerUnit: 429,
                    features: ["Tile scrubbing", "Mirror cleaning", "Floor washing"]
                },
                {
                    id: "intense-cleaning",
                    name: "Intense Cleaning",
                    rating: 4.9,
                    reviewCount: 340,
                    price: 1500,
                    duration: 120,
                    description: "Deep scrubbing and stain removal.",
                    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80",
                    unit: "bathroom",
                    pricePerUnit: 500,
                    features: ["Hard stain removal", "Grout cleaning", "Disinfection"]
                }
            ]
        },
        {
            id: "bathroom",
            name: "Bathroom Cleaning",
            variants: [
                {
                    id: "move-in-bathroom",
                    name: "Move-in Bathroom Clean",
                    rating: 4.7,
                    reviewCount: 120,
                    price: 899,
                    duration: 60,
                    description: "Specialized cleaning for empty bathrooms before moving in.",
                    image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80",
                    features: ["Deep sanitization", "Cabinet cleaning"]
                }
            ]
        },
        {
            id: "kitchen",
            name: "Kitchen Cleaning",
            variants: [
                {
                    id: "kitchen-deep",
                    name: "Deep Kitchen Cleaning",
                    rating: 4.8,
                    reviewCount: 89,
                    price: 1299,
                    duration: 180,
                    description: "Oil and grease removal from all surfaces.",
                    image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=400&q=80",
                    features: ["Chimney cleaning", "Appliance wipe-down", "Floor scrub"]
                }
            ]
        },
        {
            id: "mini",
            name: "Mini Services",
            variants: []
        }
    ],
    "ac-service-repair": [
        {
            id: "service",
            name: "Service",
            variants: [
                {
                    id: "split-ac-service",
                    name: "Split AC Service",
                    rating: 4.8,
                    reviewCount: 2300,
                    price: 599,
                    duration: 60,
                    description: "Foam jet cleaning of indoor and outdoor units.",
                    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80",
                    features: ["Filter cleaning", "Cooling coil cleaning", "Gas check"]
                },
                {
                    id: "window-ac-service",
                    name: "Window AC Service",
                    rating: 4.7,
                    reviewCount: 1500,
                    price: 499,
                    duration: 45,
                    description: "Basic cleaning for window AC units.",
                    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=400&q=80",
                    features: ["Filter cleaning", "Drain pipe cleaning"]
                }
            ]
        },
        {
            id: "repair",
            name: "Repair & Gas",
            variants: [
                {
                    id: "ac-gas-refill",
                    name: "AC Gas Refill",
                    rating: 4.9,
                    reviewCount: 890,
                    price: 2500,
                    duration: 60,
                    description: "Complete gas top-up with leak detection.",
                    image: "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=400&q=80",
                    features: ["Leak check", "Gas refill", "Performance check"]
                },
                {
                    id: "ac-check-up",
                    name: "AC Check-up",
                    rating: 4.6,
                    reviewCount: 450,
                    price: 299,
                    duration: 30,
                    description: "Diagnostic visit to identify issues.",
                    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=400&q=80",
                    features: ["Problem diagnosis", "repair quote"]
                }
            ]
        },
        {
            id: "install",
            name: "Installation",
            variants: [
                {
                    id: "split-ac-install",
                    name: "Split AC Installation",
                    rating: 4.7,
                    reviewCount: 670,
                    price: 1500,
                    duration: 90,
                    description: "Professional installation with vacuumisation.",
                    image: "https://images.unsplash.com/photo-1635334237175-1a83626780c8?auto=format&fit=crop&w=400&q=80",
                    features: ["Core cutting", "Pipe fitting", "Outdoor unit setup"]
                }
            ]
        }
    ],
    "haircut-styling": [
        {
            id: "womens-haircut",
            name: "Haircut",
            variants: [
                {
                    id: "layer-cut",
                    name: "Layer Cut",
                    rating: 4.8,
                    reviewCount: 320,
                    price: 699,
                    duration: 45,
                    description: "Multi-layer cut for volume and style.",
                    image: "https://images.unsplash.com/photo-1595475884562-073c30d45670?auto=format&fit=crop&w=400&q=80",
                    features: ["Wash", "Cut", "Blow-dry"]
                },
                {
                    id: "bob-cut",
                    name: "Bob Cut",
                    rating: 4.7,
                    reviewCount: 150,
                    price: 599,
                    duration: 40,
                    description: "Classic bob cut.",
                    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=400&q=80",
                    features: ["Consultation", "Cut", "Styling"]
                }
            ]
        },
        {
            id: "hair-spa",
            name: "Hair Spa",
            variants: [
                {
                    id: "loreal-spa",
                    name: "L'Oreal Hair Spa",
                    rating: 4.9,
                    reviewCount: 450,
                    price: 1299,
                    duration: 60,
                    description: "Deep conditioning for dry hair.",
                    image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=400&q=80",
                    features: ["Massage", "Steam", "Mask"]
                }
            ]
        }
    ],
    "mens-haircut": [
        {
            id: "men-grooming",
            name: "Haircut & Beard",
            variants: [
                {
                    id: "mens-cut-classic",
                    name: "Classic Haircut",
                    rating: 4.6,
                    reviewCount: 890,
                    price: 299,
                    duration: 30,
                    description: "Standard scissor over comb cut.",
                    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&q=80",
                    features: ["Cut", "Wash", "Styling"]
                },
                {
                    id: "beard-shape",
                    name: "Beard Shaping",
                    rating: 4.7,
                    reviewCount: 560,
                    price: 199,
                    duration: 20,
                    description: "Professional beard trim and line-up.",
                    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&q=80",
                    features: ["Trimming", "Shaping", "Oil application"]
                }
            ]
        }
    ]
};
