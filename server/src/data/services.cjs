
const categories = [
    { id: "1", name: "Salon", icon: "✂️", slug: "salon" },
    { id: "2", name: "Cleaning", icon: "🧹", slug: "cleaning" },
    { id: "3", name: "AC Repair", icon: "❄️", slug: "ac-repair" },
    { id: "4", name: "Electrician", icon: "⚡", slug: "electrician" },
    { id: "5", name: "Plumber", icon: "🔧", slug: "plumber" },
    { id: "6", name: "Carpenter", icon: "🪚", slug: "carpenter" }
];

const services = [
    {
        id: "1",
        name: "Haircut & Styling",
        description:
            "Professional haircut with styling. Includes consultation, wash, cut, and style.",
        price: 599,
        duration: 60,
        rating: 4.8,
        reviewCount: 1245,
        category: "women",
        image: "https://images.unsplash.com/photo-1595475884562-073c30d45670?auto=format&fit=crop&w=800&q=80",

        addOns: [
            {
                id: "a1",
                name: "Hair Spa",
                description: "Deep conditioning treatment",
                price: 799,
                duration: 30
            },
            {
                id: "a2",
                name: "Hair Color",
                description: "Full hair coloring service",
                price: 2499,
                duration: 120
            }
        ]
    },
    {
        id: "2",
        name: "Men's Haircut",
        description: "Classic men's haircut with styling. Quick and professional.",
        price: 299,
        duration: 30,
        rating: 4.7,
        reviewCount: 892,
        category: "men",
        image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80",
        addOns: [
            {
                id: "a3",
                name: "Beard Trim",
                description: "Professional beard grooming",
                price: 199,
                duration: 15
            }
        ]
    },
    {
        id: "3",
        name: "Deep House Cleaning",
        description:
            "Complete deep cleaning of your home. Includes all rooms, bathrooms, kitchen, and common areas.",
        price: 1999,
        duration: 240,
        rating: 4.9,
        reviewCount: 2156,
        category: "cleaning",
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"
        ,
        addOns: [
            {
                id: "a4",
                name: "Window Cleaning",
                description: "Interior and exterior window cleaning",
                price: 499,
                duration: 60
            },
            {
                id: "a5",
                name: "Carpet Cleaning",
                description: "Deep carpet and rug cleaning",
                price: 799,
                duration: 90
            }
        ]
    },
    {
        id: "4",
        name: "AC Service & Repair",
        description:
            "Complete AC servicing including gas refill, cleaning, and repair. Covers all major brands.",
        price: 899,
        duration: 90,
        rating: 4.6,
        reviewCount: 678,
        category: "repair",
        image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80",
        addOns: [
            {
                id: "a6",
                name: "AC Installation",
                description: "New AC unit installation",
                price: 2999,
                duration: 180
            }
        ]
    },
    {
        id: "5",
        name: "Electrical Repair",
        description:
            "Expert electrical services including wiring, switch repair, and fixture installation.",
        price: 499,
        duration: 60,
        rating: 4.8,
        reviewCount: 1023,
        category: "repair",
        image: "https://images.unsplash.com/photo-1581091870627-3c8caa4a6b56?auto=format&fit=crop&w=800&q=80",
        addOns: [
            {
                id: "a7",
                name: "Full Home Wiring",
                description: "Complete home rewiring service",
                price: 4999,
                duration: 300
            }
        ]
    },
    {
        id: "6",
        name: "Facial & Skincare",
        description:
            "Hydrating facial treatment with cleansing, exfoliation, and mask application.",
        price: 1299,
        duration: 90,
        rating: 4.9,
        reviewCount: 1456,
        category: "women",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
        addOns: [
            {
                id: "a8",
                name: "Threading",
                description: "Eyebrow and upper lip threading",
                price: 199,
                duration: 20
            }
        ]
    },
    {
        id: "7",
        name: "Bathroom Deep Clean",
        description:
            "Thorough bathroom cleaning including tiles, fixtures, and sanitization.",
        price: 699,
        duration: 90,
        rating: 4.7,
        reviewCount: 987,
        category: "cleaning",
        image: "🚿"
    },
    {
        id: "8",
        name: "Plumbing Repair",
        description:
            "Fix leaks, clogs, and plumbing issues. Includes pipe repair and fixture installation.",
        price: 599,
        duration: 60,
        rating: 4.6,
        reviewCount: 756,
        category: "repair",
        image: "🔧"
    }
    ,
    {
        id: "9",
        name: "Home Painting",
        description: "Professional home painting service. Interior and exterior.",
        price: 4999,
        duration: 480,
        rating: 4.7,
        reviewCount: 342,
        category: "painting",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "10",
        name: "Pest Control",
        description: "Complete pest control solution for your home.",
        price: 999,
        duration: 60,
        rating: 4.8,
        reviewCount: 567,
        category: "pest-control",
        image: "https://images.unsplash.com/photo-1585664811087-47f651336423?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "11",
        name: "Water Tank Cleaning",
        description: "Mechanized water tank cleaning and disinfection.",
        price: 799,
        duration: 90,
        rating: 4.9,
        reviewCount: 231,
        category: "water-tank",
        image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80"
    }
];

module.exports = { services, categories };
