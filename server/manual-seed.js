
const dns = require('dns');
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
        module: 'commonjs'
    }
});

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const { Service } = require('./src/models/Service');
const { Category } = require('./src/models/Category');

// Use current dir for data import
const { services, categories } = require('./src/data/services.cjs');

const seed = async () => {
    try {
        console.log('Connecting to MongoDB...');
        console.log('URI:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('MongoDB Connected for Seeding');

        await Service.deleteMany({});
        await Category.deleteMany({});

        console.log(`Inserting ${services.length} services...`);
        // console.log('Services sample:', services[0]);
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
