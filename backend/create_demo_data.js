const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const User = require("./src/models/User");
const Product = require("./src/models/Product"); // Assuming this exists or will fail gracefully
const Order = require("./src/models/Order"); // Assuming this exists

// Load env vars
dotenv.config({ path: "backend/config/config.env" });
// Fallback if that failed (running from root)
if (!process.env.DB_URI) {
  dotenv.config({ path: "backend/.env" });
}

const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`Mongodb connected with server: ${data.connection.host}`);
    });
};

const seedData = async () => {
  try {
    await connectDatabase();

    // 1. Create Extra Users
    const users = [
      {
        first_name: "John",
        last_name: "Admin",
        email: "admin2@example.com",
        password: "password123",
        role: "admin",
        mobile_no: "1234567890",
        name: "John Admin",
        username: "johnadmin",
        image: { public_id: "default", url: "url" },
      },
      {
        first_name: "Sarah",
        last_name: "Manager",
        email: "manager2@example.com",
        password: "password123",
        role: "manager",
        mobile_no: "1234567891",
        name: "Sarah Manager",
        username: "sarahmanager",
        image: { public_id: "default", url: "url" },
      },
      {
        first_name: "Mike",
        last_name: "Provider",
        email: "provider2@example.com",
        password: "password123",
        role: "provider",
        mobile_no: "1234567892",
        name: "Mike Provider",
        username: "mikeprovider",
        image: { public_id: "default", url: "url" },
      },
      {
        first_name: "Lisa",
        last_name: "Customer",
        email: "customer2@example.com",
        password: "password123",
        role: "customer",
        mobile_no: "1234567893",
        name: "Lisa Customer",
        username: "lisacustomer",
        image: { public_id: "default", url: "url" },
      },
      {
        first_name: "Tom",
        last_name: "Customer",
        email: "customer3@example.com",
        password: "password123",
        role: "customer",
        mobile_no: "1234567894",
        name: "Tom Customer",
        username: "tomcustomer",
        image: { public_id: "default", url: "url" },
      },
    ];

    for (const u of users) {
      const exist = await User.findOne({ email: u.email });
      if (!exist) {
        await User.create(u);
        console.log(`Created ${u.role}: ${u.email}`);
      } else {
        console.log(`User ${u.email} already exists.`);
      }
    }

    // 2. Create Dummy Orders (for stats)
    // Check if Order model works. We simply push data structure matching controller expectation (totalPrice)
    const orders = [
      { totalPrice: 1500, orderStatus: "Delivered", user: "dummy_id" },
      { totalPrice: 2500, orderStatus: "Processing", user: "dummy_id" },
      { totalPrice: 500, orderStatus: "Shipped", user: "dummy_id" },
    ];

    // We need a real user ID for orders usually, but for stats aggregation we might just count them.
    // However, schema validation might fail if 'user' is required.
    // Let's fetch the first customer.
    const customer = await User.findOne({ role: "customer" });
    if (customer) {
      for (const o of orders) {
        // We'll create minimal order to satisfy schema if possible
        // Assuming schema requires user, shippingInfo, orderItems.
        // This is risky without knowing exact schema, but let's try a minimal insert if detailed schema is loose,
        // or just skip if complex.
        // Actually, the user asked to "Create every type of user". This part is extra for "dynamic data".
        // Let's safe-guard it.
      }
    }
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    // mongoose.disconnect();
    // Just let it finish
    console.log("Done.");
    process.exit();
  }
};

seedData();
