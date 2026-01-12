const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./src/models/User");
const bcrypt = require("bcryptjs");

dotenv.config({ path: "./.env" });

const checkUsers = async () => {
  try {
    console.log("DB_URI:", process.env.DB_URI);
    await mongoose.connect(process.env.DB_URI);
    console.log("Connected to MongoDB");

    const users = await User.find({});
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
      console.log(`- ${user.email} (${user.role})`);
    }

    const superAdmin = await User.findOne({
      email: "superadmin@example.com",
    }).select("+password");
    if (superAdmin) {
      console.log("Super Admin found.");
      const isMatch = await bcrypt.compare("password123", superAdmin.password);
      console.log('Password "password123" match:', isMatch);
    } else {
      console.log("Super Admin NOT found.");
    }

    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkUsers();
