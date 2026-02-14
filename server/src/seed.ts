
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Service } from './models/Service.js';
import { Category } from './models/Category.js';
import { services, categories } from '../../src/data/services.js'; // Relative import to frontend data

dotenv.config();

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
