// src/seeder/userSeeder.js
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const mongoURI = 'mongodb://localhost:27017/nodeEcommerce';
const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 30000,
        });
    } catch (err) {
        process.exit(1);
    }
};

const users = [
    {
        first_name: 'John',
        last_name: 'Doe',
        name: 'John Doe',
        username: 'johndoe',
        email: 'johndoe@example.com',
        password: 'P@$$w0rd!7252',
        mobile_no: '+1234567890',
        role: 'admin',
        image: {
            public_id: 'public_id_123',
            url: 'http://example.com/image.jpg'
        }
    },
    {
        first_name: 'Jane',
        last_name: 'Smith',
        name: 'Jane Smith',
        username: 'janesmith',
        email: 'janesmith@example.com',
        password: 'P@$$w0rd!7252',
        mobile_no: '+0987654321',
        role: 'user',
        image: {
            public_id: 'public_id_456',
            url: 'http://example.com/image2.jpg'
        }
    }
];

// Function to seed users
const userSeeder = async () => {
    await connectDB();
    for (const userData of users) {
        const existingUser = await User.findOne({ email: userData.email });
        if (!existingUser) {
            const user = new User(userData);
            await user.save();
            console.log(`User "${userData.name}" seeded successfully`);
        } else {
            console.log(`User with email "${userData.email}" already exists`);
        }
    }

    mongoose.disconnect(); // Disconnect after seeding is complete
};

// Run the seeder
userSeeder().catch((err) => console.error('Error seeding users:', err));
