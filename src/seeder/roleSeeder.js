const mongoose = require('mongoose');
const Role = require('../models/Role');

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

const roleSeeder = async () => {
    await connectDB();
    const roles = [
        { name: 'admin', type: 'admin', description: 'Administrator with full access' },
        { name: 'manager', type: 'user', description: 'Manager with elevated privileges' },
        { name: 'provider', type: 'user', description: 'Provider with limited access' },
        { name: 'user', type: 'user', description: 'Regular user with basic access' },
    ];

    try {
        for (const role of roles) {
            const existingRole = await Role.findOne({ name: role.name });
            if (!existingRole) {
                const newRole = new Role(role);
                await newRole.save();
            }
        }
    } catch (err) {
        console.error('Error seeding roles:', err);
    }
};
roleSeeder();
