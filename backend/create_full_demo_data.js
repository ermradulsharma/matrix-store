const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./src/models/User");
const Product = require("./src/models/Product");
const Order = require("./src/models/Order");

dotenv.config({ path: "backend/config/config.env" });
if (!process.env.DB_URI) dotenv.config({ path: "backend/.env" });

const seed = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("Connected to DB");

    // --- 1. USERS ---
    const createUser = async (role, email, name) => {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          first_name: name.split(" ")[0],
          last_name: name.split(" ")[1],
          email,
          password: "password123",
          role,
          mobile_no: "9999999999",
          name,
          username: name.toLowerCase().replace(" ", ""),
          image: { public_id: "def", url: "url" },
        });
        console.log(`Created ${role}: ${name}`);
      }
      return user;
    };

    const admin = await createUser("admin", "admin@example.com", "John Admin");
    const manager = await createUser(
      "manager",
      "manager@example.com",
      "Sarah Manager"
    );
    const provider = await createUser(
      "provider",
      "provider@example.com",
      "Mike Provider"
    );
    const customer = await createUser(
      "customer",
      "customer@example.com",
      "Alice Customer"
    );

    // --- 2. PRODUCTS ---
    const createProduct = async (name, price, user) => {
      let product = await Product.findOne({ name });
      if (!product) {
        product = await Product.create({
          name,
          description: `Description for ${name}`,
          price,
          category: "Electronics",
          stock: 50,
          user_id: user._id,
          images: [
            { public_id: "test", url: "https://via.placeholder.com/150" },
          ],
          ratings: 4.5,
          numOfReviews: 0,
        });
        console.log(`Created Product: ${name} (Owner: ${user.role})`);
      }
      return product;
    };

    const prodAdmin = await createProduct("Admin's Laptop", 1200, admin);
    const prodManager = await createProduct("Manager's Tablet", 600, manager);
    const prodProvider = await createProduct(
      "Provider's Headset",
      150,
      provider
    );

    const products = [prodAdmin, prodManager, prodProvider];

    // --- 3. ORDERS ---
    // Create 8 random orders
    const statuses = ["processing", "shipped", "delivered"];

    console.log("Seeding 8 Orders...");
    for (let i = 0; i < 8; i++) {
      const randomProduct =
        products[Math.floor(Math.random() * products.length)];
      const randomQty = Math.floor(Math.random() * 3) + 1;
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];

      // Random Date (last 2 months)
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 60));

      const orderData = {
        user: customer._id,
        orderItems: [
          {
            product: randomProduct._id,
            name: randomProduct.name,
            quantity: randomQty,
            price: randomProduct.price,
            image: randomProduct.images[0].url,
          },
        ],
        shippingAddress: {
          address: "123 Seed St",
          city: "Seed City",
          state: "SC",
          country: "India",
          pincode: "111111",
          phoneNo: "9999999999",
        },
        itemsPrice: randomProduct.price * randomQty,
        taxPrice: 50,
        shippingPrice: 20,
        totalPrice: randomProduct.price * randomQty + 70,
        orderStatus: randomStatus,
        paymentInfo: { status: "succeeded", method: "card" },
        createdAt: date,
        paidAt: date,
        deliveredAt: randomStatus === "delivered" ? date : undefined,
      };

      await Order.create(orderData);
    }
    console.log("Orders Created successfully.");
  } catch (err) {
    console.error("Seeding Error:", err);
  } finally {
    process.exit();
  }
};

seed();
