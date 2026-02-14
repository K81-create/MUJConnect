
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const AddOnSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
});

const ServiceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    rating: { type: Number, required: true },
    reviewCount: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    addOns: [AddOnSchema],
});

const CategorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    slug: { type: String, required: true, unique: true }
});

const Service = mongoose.model("Service", ServiceSchema);
const Category = mongoose.model("Category", CategorySchema);

const categories = [
    { id: "salon", name: "Salon", icon: "✂️", slug: "salon" },
    { id: "cleaning", name: "Cleaning", icon: "🧹", slug: "cleaning" },
    { id: "ac-repair", name: "AC Repair", icon: "❄️", slug: "ac-repair" },
    { id: "electrician", name: "Electrician", icon: "⚡", slug: "electrician" },
    { id: "plumber", name: "Plumber", icon: "🔧", slug: "plumber" },
    { id: "carpenter", name: "Carpenter", icon: "🪚", slug: "carpenter" }
];

const services = [
    // --- MEN'S SALON ---
    {
        id: "mens-haircut",
        name: "Haircut",
        description: "Professional haircut for men including styling.",
        price: 299,
        duration: 30,
        rating: 4.7,
        reviewCount: 892,
        category: "men",
        image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80",
        addOns: [{ id: "beard-trim", name: "Beard Trim", price: 199, duration: 15, description: "Quick beard trim" }]
    },
    {
        id: "mens-beard-trim",
        name: "Beard Trimming & Styling",
        description: "Expert beard grooming and shaping.",
        price: 199,
        duration: 20,
        rating: 4.8,
        reviewCount: 450,
        category: "men",
        image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "mens-hair-wash",
        name: "Hair Wash",
        description: "Refreshing hair wash with premium shampoo and conditioner.",
        price: 149,
        duration: 15,
        rating: 4.6,
        reviewCount: 200,
        category: "men",
        image: "https://images.unsplash.com/photo-1595475884562-073c30d45670?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "mens-head-massage",
        name: "Head Massage",
        description: "Relaxing 20-minute head massage.",
        price: 399,
        duration: 20,
        rating: 4.9,
        reviewCount: 600,
        category: "men",
        image: "https://images.unsplash.com/photo-1519823551278-64ac927ac4dd?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "mens-face-cleanup",
        name: "Face Clean-up",
        description: "Deep cleansing specifically for men's skin.",
        price: 599,
        duration: 30,
        rating: 4.7,
        reviewCount: 320,
        category: "men",
        image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "mens-facial-brightening",
        name: "Facial (Brightening / Anti-aging)",
        description: "Premium facial for glow and rejuvenation.",
        price: 1299,
        duration: 60,
        rating: 4.8,
        reviewCount: 150,
        category: "men",
        image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "mens-detan",
        name: "De-tan Treatment",
        description: "Effective de-tan pack for face and neck.",
        price: 499,
        duration: 25,
        rating: 4.6,
        reviewCount: 400,
        category: "men",
        image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "mens-hair-color",
        name: "Hair Coloring",
        description: "Ammonia-free hair coloring.",
        price: 999,
        duration: 45,
        rating: 4.7,
        reviewCount: 220,
        category: "men",
        image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80"
    },

    // --- WOMEN'S SALON ---
    {
        id: "women-haircut",
        name: "Haircut",
        description: "Professional haircut including wash and blow-dry.",
        price: 699,
        duration: 60,
        rating: 4.8,
        reviewCount: 1245,
        category: "women",
        image: "https://images.unsplash.com/photo-1595475884562-073c30d45670?auto=format&fit=crop&w=800&q=80",
        addOns: [
            { id: "split-ends-trim", name: "Split Ends Trim", price: 299, duration: 20, description: "Trim split ends" }
        ]
    },
    {
        id: "women-hair-spa",
        name: "Hair Spa",
        description: "Rejuvenating hair spa for dry and damaged hair.",
        price: 1199,
        duration: 45,
        rating: 4.7,
        reviewCount: 890,
        category: "women",
        image: "https://images.unsplash.com/photo-1595475884562-073c30d45670?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "women-root-touchup",
        name: "Root Touch-up",
        description: "Grey coverage for roots.",
        price: 899,
        duration: 40,
        rating: 4.8,
        reviewCount: 650,
        category: "women",
        image: "https://images.unsplash.com/photo-1595475884562-073c30d45670?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "women-global-color",
        name: "Global Hair Color",
        description: "Full length hair coloring with premium products.",
        price: 2999,
        duration: 120,
        rating: 4.9,
        reviewCount: 300,
        category: "women",
        image: "https://images.unsplash.com/photo-1595475884562-073c30d45670?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "women-smoothening",
        name: "Hair Smoothening / Straightening",
        description: "Professional hair straightening treatment.",
        price: 4999,
        duration: 180,
        rating: 4.8,
        reviewCount: 200,
        category: "women",
        image: "https://images.unsplash.com/photo-1595475884562-073c30d45670?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "women-waxing",
        name: "Waxing (Arms, Legs, Full Body)",
        description: "Honey or Rica waxing options available.",
        price: 799,
        duration: 60,
        rating: 4.7,
        reviewCount: 1500,
        category: "women",
        image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80"
    },

    {
        id: "women-threading",
        name: "Threading (Eyebrows, Upper Lip)",
        description: "Precise threading for face.",
        price: 99,
        duration: 15,
        rating: 4.8,
        reviewCount: 2000,
        category: "women",
        image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "women-facial-classic",
        name: "Facial (Classic, Gold, Diamond)",
        description: "Standard facial options for glowing skin.",
        price: 999,
        duration: 60,
        rating: 4.6,
        reviewCount: 880,
        category: "women",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "women-cleanup",
        name: "Cleanup",
        description: "Basic face cleanup.",
        price: 599,
        duration: 30,
        rating: 4.6,
        reviewCount: 600,
        category: "women",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "women-bleach",
        name: "Bleach",
        description: "Face and neck bleach.",
        price: 399,
        duration: 20,
        rating: 4.5,
        reviewCount: 450,
        category: "women",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "women-manicure",
        name: "Manicure",
        description: "Classic manicure service.",
        price: 499,
        duration: 30,
        rating: 4.7,
        reviewCount: 750,
        category: "women",
        image: "https://images.unsplash.com/photo-1610992015732-2449b0f4a7f9?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "women-pedicure",
        name: "Pedicure",
        description: "Classic pedicure service.",
        price: 599,
        duration: 40,
        rating: 4.7,
        reviewCount: 800,
        category: "women",
        image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80"
    },

    // --- SPA & MASSAGE (Categorizing under WOMEN for now, or mix) --
    // For simplicity, sticking the "SPA" items under Men or Women isn't perfect if they are unisex. 
    // But based on the file types, I can use "women" or "men". I'll default them to "women" for now or duplicate.
    // Actually, I'll add them to 'women' mostly or both if needed. Let's put them in 'women' for now as they are often primary.
    {
        id: "spa-body-massage",
        name: "Body Massage (Relaxation)",
        description: "Full body relaxation massage.",
        price: 1499,
        duration: 60,
        rating: 4.8,
        reviewCount: 300,
        category: "women",
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "spa-deep-tissue",
        name: "Deep Tissue Massage",
        description: "Therapeutic deep tissue massage.",
        price: 1699,
        duration: 60,
        rating: 4.9,
        reviewCount: 150,
        category: "women", // Also men, but single category limit
        image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "spa-swedish",
        name: "Swedish Massage",
        description: "Classic Swedish massage.",
        price: 1499,
        duration: 60,
        rating: 4.7,
        reviewCount: 200,
        category: "women",
        image: "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=800&q=80"
    },


    // --- REPAIR & MAINTENANCE ---
    {
        id: "electrical-switch",
        name: "Switch & Socket Repair",
        description: "Repair or replacement of switches and sockets.",
        price: 149,
        duration: 30,
        rating: 4.8,
        reviewCount: 1000,
        category: "repair",
        image: "https://images.unsplash.com/photo-1581091870627-3c8caa4a6b56?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "electrical-fan",
        name: "Fan Repair / Installation",
        description: "Ceiling or wall fan installation and repair.",
        price: 249,
        duration: 45,
        rating: 4.7,
        reviewCount: 850,
        category: "repair",
        image: "https://images.unsplash.com/photo-1581091870627-3c8caa4a6b56?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "electrical-light",
        name: "Light & Tube Installation",
        description: "Installation of tube lights and fancy lights.",
        price: 199,
        duration: 30,
        rating: 4.8,
        reviewCount: 600,
        category: "repair",
        image: "https://images.unsplash.com/photo-1581091870627-3c8caa4a6b56?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "electrical-wiring",
        name: "Wiring Repair",
        description: "Fixing internal wiring issues.",
        price: 399,
        duration: 60,
        rating: 4.6,
        reviewCount: 400,
        category: "repair",
        image: "https://images.unsplash.com/photo-1581091870627-3c8caa4a6b56?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "plumbing-tap",
        name: "Tap Repair",
        description: "Fixing leaking taps.",
        price: 149,
        duration: 30,
        rating: 4.7,
        reviewCount: 900,
        category: "repair",
        image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "plumbing-leakage",
        name: "Pipe Leakage Fix",
        description: "Repairing water pipe leakages.",
        price: 299,
        duration: 45,
        rating: 4.6,
        reviewCount: 550,
        category: "repair",
        image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "plumbing-toilet",
        name: "Toilet Repair",
        description: "Flush tank and seat repairs.",
        price: 399,
        duration: 60,
        rating: 4.5,
        reviewCount: 300,
        category: "repair",
        image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "appliance-ac-service",
        name: "AC Servicing & Repair",
        description: "Deep jet cleaning and gas refilling.",
        price: 699,
        duration: 60,
        rating: 4.8,
        reviewCount: 1200,
        category: "repair",
        image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "appliance-fridge",
        name: "Refrigerator Repair",
        description: "Repairing cooling issues and part replacement.",
        price: 499,
        duration: 60,
        rating: 4.7,
        reviewCount: 800,
        category: "repair",
        image: "https://images.unsplash.com/photo-1581092921461-eab62e97a783?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "appliance-washing-machine",
        name: "Washing Machine Repair",
        description: "Fixing drum, motor, and water issues.",
        price: 599,
        duration: 60,
        rating: 4.6,
        reviewCount: 700,
        category: "repair",
        image: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "appliance-microwave",
        name: "Microwave Repair",
        description: "Heating issue repair.",
        price: 399,
        duration: 45,
        rating: 4.5,
        reviewCount: 350,
        category: "repair",
        image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "appliance-geyser",
        name: "Geyser Repair",
        description: "Thermostat and coil replacement.",
        price: 449,
        duration: 60,
        rating: 4.8,
        reviewCount: 600,
        category: "repair",
        image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "appliance-ro",
        name: "RO Purifier Servicing",
        description: "Filter change and membrane cleaning.",
        price: 599,
        duration: 45,
        rating: 4.7,
        reviewCount: 950,
        category: "repair",
        image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=800&q=80"
    },

    // --- CLEANING ---
    {
        id: "clean-full-home",
        name: "Full Home Deep Cleaning",
        description: "Complete house cleaning including floor, windows, and washrooms.",
        price: 2499,
        duration: 300,
        rating: 4.9,
        reviewCount: 1500,
        category: "cleaning",
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "clean-bathroom",
        name: "Bathroom Deep Cleaning",
        description: "Stain removal and sanitization.",
        price: 499,
        duration: 60,
        rating: 4.8,
        reviewCount: 2000,
        category: "cleaning",
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "clean-kitchen",
        name: "Kitchen Deep Cleaning",
        description: "Oil and grease removal from kitchen surfaces.",
        price: 999,
        duration: 120,
        rating: 4.7,
        reviewCount: 1200,
        category: "cleaning",
        image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "clean-sofa",
        name: "Sofa Cleaning",
        description: "Dry and wet vacuuming for sofas.",
        price: 599,
        duration: 90,
        rating: 4.8,
        reviewCount: 1100,
        category: "cleaning",
        image: "https://images.unsplash.com/photo-1540573133985-00c69d8aa6dc?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "clean-carpet",
        name: "Carpet Cleaning",
        description: "Deep shampoo cleaning.",
        price: 799,
        duration: 90,
        rating: 4.7,
        reviewCount: 800,
        category: "cleaning",
        image: "https://images.unsplash.com/photo-1527515545081-5db0d5fc2f80?auto=format&fit=crop&w=800&q=80"
    },

    // --- PAINTING ---
    {
        id: "paint-interior",
        name: "Interior Wall Painting",
        description: "Professional wall painting with choice of colors.",
        price: 5999,
        duration: 720, // Multi-day usually, just mock 12h
        rating: 4.8,
        reviewCount: 300,
        category: "painting",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "paint-exterior",
        name: "Exterior Painting",
        description: "Weather-proof exterior painting.",
        price: 15000,
        duration: 1440,
        rating: 4.9,
        reviewCount: 150,
        category: "painting",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "paint-waterproofing",
        name: "Waterproofing",
        description: "Roof and wall waterproofing solutions.",
        price: 4999,
        duration: 360,
        rating: 4.7,
        reviewCount: 200,
        category: "painting",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80"
    },

    // --- PEST CONTROL ---
    {
        id: "pest-general",
        name: "General Pest Control",
        description: "Treatment for ants, flies, and common pests.",
        price: 899,
        duration: 60,
        rating: 4.7,
        reviewCount: 900,
        category: "pest-control",
        image: "https://images.unsplash.com/photo-1587373752528-77e8df6ff8f8?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "pest-cockroach",
        name: "Cockroach Control",
        description: "Gel based anti-cockroach treatment.",
        price: 999,
        duration: 45,
        rating: 4.8,
        reviewCount: 1200,
        category: "pest-control",
        image: "https://images.unsplash.com/photo-1587373752528-77e8df6ff8f8?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "pest-termite",
        name: "Termite Control",
        description: "Long lasting termite protection.",
        price: 2999,
        duration: 120,
        rating: 4.9,
        reviewCount: 400,
        category: "pest-control",
        image: "https://images.unsplash.com/photo-1587373752528-77e8df6ff8f8?auto=format&fit=crop&w=800&q=80"
    },

    // --- WATER TANK ---
    {
        id: "water-overhead",
        name: "Overhead Tank Cleaning",
        description: "Mechanalized deep cleaning of overhead tanks.",
        price: 999,
        duration: 60,
        rating: 4.8,
        reviewCount: 500,
        category: "water-tank",
        image: "https://images.unsplash.com/photo-1617182283995-236b3595563a?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "water-underground",
        name: "Underground Tank Cleaning",
        description: "Deep sludge removal and cleaning.",
        price: 1499,
        duration: 90,
        rating: 4.7,
        reviewCount: 300,
        category: "water-tank",
        image: "https://images.unsplash.com/photo-1617182283995-236b3595563a?auto=format&fit=crop&w=800&q=80"
    }
];

// Set DNS servers (reuse from server.js fix)
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('MongoDB Connected for Seeding');

        await Service.deleteMany({});
        await Category.deleteMany({});

        console.log(`Inserting ${services.length} services...`);
        await Service.insertMany(services);

        console.log(`Inserting ${categories.length} categories...`);
        await Category.insertMany(categories);

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
};

seed();
