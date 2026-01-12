const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log(`Connected to Database: ${mongoose.connection.name}`);
        console.log(`Host: ${mongoose.connection.host}`);

        const users = await User.find({});
        console.log(`\nTotal Users Found: ${users.length}`);

        if (users.length > 0) {
            console.log('\nUser List:');
            users.forEach(u => {
                console.log(`- ${u.username} (${u.email}) [${u.role}]`);
            });
        } else {
            console.log('No users found.');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
