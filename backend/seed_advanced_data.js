const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./src/models/User");
const Product = require("./src/models/Product");
const Order = require("./src/models/Order");

// Load Config
dotenv.config({ path: "backend/config/config.env" });
if (!process.env.DB_URI) dotenv.config({ path: "backend/.env" });

const seedAdvanced = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log("Connected to DB for Advanced Seeding...");

        // --- 1. CLEAR EXISTING DATA (Optional - uncomment to wipe) ---
        // await Order.deleteMany({});
        // await Product.deleteMany({});
        // await User.deleteMany({});
        // console.log("Cleared existing data.");

        // --- 2. CREATE HIERARCHY USERS ---
        const createUser = async (role, email, name, managedBy = null, password = "password123") => {
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    first_name: name.split(" ")[0],
                    last_name: name.split(" ")[1] || "",
                    email,
                    password,
                    role,
                    managedBy, // Link to manager
                    mobile_no: "9" + Math.floor(100000000 + Math.random() * 900000000), // Random mobile
                    username: name.toLowerCase().replace(/\s/g, ""),
                    image: { public_id: "seed", url: "https://cdn-icons-png.flaticon.com/512/149/149071.png" },
                });
                console.log(`[Users] Created ${role}: ${email} (Managed By: ${managedBy ? managedBy.role : 'None'})`);
            } else {
                console.log(`[Users] Exists: ${email}`);
                // Update managedBy if missing?
                if (managedBy && !user.managedBy) {
                    user.managedBy = managedBy;
                    await user.save();
                    console.log(`[Users] Updated ${role} with manager.`);
                }
            }
            return user;
        };

        // 1. Super Admin (Top Level)
        const superAdmin = await createUser("super_admin", "super@matrix.com", "Super Admin", null); // Note: Role enum is 'super_admin' in schema? Schema says 'super_admin'.

        // 2. Admin (Managed by Super Admin)
        const admin = await createUser("admin", "admin@matrix.com", "Alice Admin", superAdmin);

        // 3. Manager (Managed by Admin)
        const manager = await createUser("manager", "manager@matrix.com", "Bob Manager", admin);

        // 4. Provider (Managed by Manager)
        const provider = await createUser("provider", "provider@matrix.com", "Charlie Provider", manager);

        // 5. Customer (Self/Generic)
        const customer = await createUser("customer", "customer@matrix.com", "Dave Customer", null);

        // --- 3. CREATE PRODUCTS ---
        const createProduct = async (name, price, category, stock, user) => {
            // Only Providers/Admins/Managers usually own products
            const product = await Product.create({
                name: `${name} (${Math.floor(Math.random() * 1000)})`, // Unique-ish name
                description: `High quality ${name} for testing.`,
                price,
                category,
                stock,
                user_id: user._id,
                images: [{ public_id: "seed_img", url: "https://placehold.co/600x400?text=Product" }],
                ratings: 4.5,
                numOfReviews: 12
            });
            return product;
        };

        const products = [];
        console.log("[Products] Seeding Products...");
        products.push(await createProduct("Gaming Laptop", 1500, "Electronics", 50, admin));
        products.push(await createProduct("Wireless Mouse", 50, "Electronics", 200, manager));
        products.push(await createProduct("Ergo Chair", 300, "Furniture", 15, provider));
        products.push(await createProduct("4K Monitor", 400, "Electronics", 30, admin));
        products.push(await createProduct("Mechanical Keyboard", 120, "Electronics", 100, provider));

        // --- 4. GENERATE ORDERS (HISTORICAL & CURRENT) ---
        const generateOrdersForYear = async (year, count, isCurrentYear = false) => {
            console.log(`[Orders] Generating ${count} orders for ${year}...`);
            const createdOrders = [];

            for (let i = 0; i < count; i++) {
                const randomProduct = products[Math.floor(Math.random() * products.length)];
                const qty = Math.floor(Math.random() * 2) + 1;
                const totalPrice = (randomProduct.price * qty) + 20; // +shipping

                // Date Logic
                let date;
                if (isCurrentYear) {
                    // From Jan 1 to Today
                    const start = new Date(year, 0, 1).getTime();
                    const end = new Date().getTime(); // Now
                    date = new Date(start + Math.random() * (end - start));
                } else {
                    // Full Year
                    const start = new Date(year, 0, 1).getTime();
                    const end = new Date(year, 11, 31).getTime();
                    date = new Date(start + Math.random() * (end - start));
                }

                const order = {
                    user: customer._id,
                    orderItems: [{
                        product: randomProduct._id,
                        name: randomProduct.name,
                        quantity: qty,
                        price: randomProduct.price,
                        image: randomProduct.images[0].url
                    }],
                    shippingAddress: {
                        address: "123 Test Lane",
                        city: "Demo City",
                        state: "NY",
                        country: "USA",
                        pincode: "10001",
                        phoneNo: "9876543210"
                    },
                    paymentInfo: {
                        id: "sample_pay_id_" + Math.random(),
                        status: "succeeded"
                    },
                    paidAt: date,
                    itemsPrice: randomProduct.price * qty,
                    taxPrice: 0,
                    shippingPrice: 20,
                    totalPrice: totalPrice,
                    orderStatus: "delivered",
                    deliveredAt: date,
                    createdAt: date
                };

                createdOrders.push(order);
            }

            await Order.insertMany(createdOrders);
            console.log(`[Orders] Saved ${count} orders for ${year}.`);
        };

        // Calculate distributions
        await generateOrdersForYear(2024, 30); // Sparse past data
        await generateOrdersForYear(2025, 80); // Dense past data

        const currentYear = new Date().getFullYear();
        if (currentYear >= 2026) {
            await generateOrdersForYear(currentYear, 20, true);
        } else {
            await generateOrdersForYear(2026, 25, true);
        }

        console.log("--- SEEDING COMPLETE ---");
        console.log("Super Admin (super@matrix.com) -> Manages Admin (admin@matrix.com)");
        console.log("Admin (admin@matrix.com) -> Manages Manager (manager@matrix.com)");
        console.log("Manager (manager@matrix.com) -> Manages Provider (provider@matrix.com)");

    } catch (error) {
        console.error("Seeding Failed:", error);
    } finally {
        mongoose.disconnect();
        process.exit();
    }
};

seedAdvanced();
