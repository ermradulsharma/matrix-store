const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Provider = require('../models/Provider');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('Connected to MongoDB...');

        // Clear existing users and providers
        await User.deleteMany({});
        await Provider.deleteMany({});
        console.log('Cleared existing users and providers.');

        const password = 'password123';

        // 1. Super Admin
        const superAdmin = await User.create({
            first_name: 'Super',
            last_name: 'Admin',
            username: 'superadmin',
            email: 'superadmin@example.com',
            password: password,
            mobile_no: '1111111111',
            role: 'super_admin',
            isActive: true
        });
        console.log('Created Super Admin: superadmin@example.com');

        // 2. Admin
        const admin = await User.create({
            first_name: 'Admin',
            last_name: 'User',
            username: 'admin',
            email: 'admin@example.com',
            password: password,
            mobile_no: '2222222222',
            role: 'admin',
            isActive: true,
            managedBy: superAdmin._id
        });
        console.log('Created Admin: admin@example.com');

        // 3. Manager
        const manager = await User.create({
            first_name: 'Manager',
            last_name: 'User',
            username: 'manager',
            email: 'manager@example.com',
            password: password,
            mobile_no: '3333333333',
            role: 'manager',
            isActive: true,
            managedBy: admin._id
        });
        console.log('Created Manager: manager@example.com');

        // 4. Provider User
        const providerUser = await User.create({
            first_name: 'Provider',
            last_name: 'User',
            username: 'provider',
            email: 'provider@example.com',
            password: password,
            mobile_no: '4444444444',
            role: 'provider',
            isActive: true,
            managedBy: manager._id
        });

        // 5. Provider Details
        await Provider.create({
            user: providerUser._id,
            companyName: 'Tech Supplies Inc.',
            businessRegistration: 'REG123456',
            contactPerson: {
                name: 'John Doe',
                email: 'john@techsupplies.com',
                phone: '4444444444'
            },
            bankDetails: {
                accountName: 'Tech Supplies Inc.',
                accountNumber: '1234567890',
                bankName: 'Tech Bank',
                swiftCode: 'TECHUS33'
            },
            manager: manager._id,
            status: 'active'
        });
        console.log('Created Provider: provider@example.com');

        // 6. Customer
        await User.create({
            first_name: 'Customer',
            last_name: 'User',
            username: 'customer',
            email: 'customer@example.com',
            password: password,
            mobile_no: '5555555555',
            role: 'customer',
            isActive: true
        });
        console.log('Created Customer: customer@example.com');

        console.log('\n--- SEEDING COMPLETE ---');
        console.log('Password for all users:', password);
        process.exit();
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
