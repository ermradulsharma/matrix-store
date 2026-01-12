const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');

dotenv.config({ path: './.env' });

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

const categories = [
    {
        title: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        image: {
            public_id: 'category_electronics',
            url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'
        }
    },
    {
        title: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
        image: {
            public_id: 'category_clothing',
            url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400'
        }
    },
    {
        title: 'Home & Kitchen',
        slug: 'home-kitchen',
        description: 'Home appliances and kitchen essentials',
        image: {
            public_id: 'category_home',
            url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400'
        }
    },
    {
        title: 'Books',
        slug: 'books',
        description: 'Books and literature',
        image: {
            public_id: 'category_books',
            url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400'
        }
    },
    {
        title: 'Sports',
        slug: 'sports',
        description: 'Sports equipment and accessories',
        image: {
            public_id: 'category_sports',
            url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400'
        }
    }
];

const products = [
    // Electronics
    {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
        price: 89.99,
        ratings: 4.5,
        category: 'Electronics',
        brand: 'AudioTech',
        model: 'AT-WH1000',
        stock: 50,
        images: [{
            public_id: 'product_headphones',
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
        }],
        status: 'active'
    },
    {
        name: 'Smart Watch Pro',
        description: 'Advanced fitness tracking smartwatch with heart rate monitor and GPS',
        price: 199.99,
        ratings: 4.7,
        category: 'Electronics',
        brand: 'FitTech',
        model: 'FT-SW500',
        stock: 75,
        images: [{
            public_id: 'product_smartwatch',
            url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
        }],
        status: 'active'
    },
    {
        name: 'Laptop Stand Aluminum',
        description: 'Ergonomic laptop stand with adjustable height and cooling design',
        price: 39.99,
        ratings: 4.3,
        category: 'Electronics',
        brand: 'DeskPro',
        stock: 100,
        images: [{
            public_id: 'product_laptop_stand',
            url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'
        }],
        status: 'active'
    },
    // Clothing
    {
        name: 'Classic Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt available in multiple colors',
        price: 19.99,
        ratings: 4.2,
        category: 'Clothing',
        brand: 'ComfortWear',
        stock: 200,
        images: [{
            public_id: 'product_tshirt',
            url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'
        }],
        status: 'active'
    },
    {
        name: 'Denim Jeans',
        description: 'Classic fit denim jeans with premium quality fabric',
        price: 49.99,
        ratings: 4.6,
        category: 'Clothing',
        brand: 'DenimCo',
        stock: 150,
        images: [{
            public_id: 'product_jeans',
            url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'
        }],
        status: 'active'
    },
    // Home & Kitchen
    {
        name: 'Stainless Steel Coffee Maker',
        description: '12-cup programmable coffee maker with auto-shutoff',
        price: 79.99,
        ratings: 4.4,
        category: 'Home & Kitchen',
        brand: 'BrewMaster',
        stock: 60,
        images: [{
            public_id: 'product_coffee_maker',
            url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500'
        }],
        status: 'active'
    },
    {
        name: 'Non-Stick Cookware Set',
        description: '10-piece non-stick cookware set with glass lids',
        price: 129.99,
        ratings: 4.8,
        category: 'Home & Kitchen',
        brand: 'ChefPro',
        stock: 40,
        images: [{
            public_id: 'product_cookware',
            url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500'
        }],
        status: 'active'
    },
    // Books
    {
        name: 'The Art of Programming',
        description: 'Comprehensive guide to modern programming practices',
        price: 34.99,
        ratings: 4.9,
        category: 'Books',
        brand: 'TechBooks',
        stock: 120,
        images: [{
            public_id: 'product_programming_book',
            url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500'
        }],
        status: 'active'
    },
    {
        name: 'Mystery Novel Collection',
        description: 'Bestselling mystery novel series - 3 book set',
        price: 29.99,
        ratings: 4.5,
        category: 'Books',
        brand: 'NovelPress',
        stock: 80,
        images: [{
            public_id: 'product_mystery_books',
            url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'
        }],
        status: 'active'
    },
    // Sports
    {
        name: 'Yoga Mat Premium',
        description: 'Extra thick non-slip yoga mat with carrying strap',
        price: 24.99,
        ratings: 4.6,
        category: 'Sports',
        brand: 'FitLife',
        stock: 90,
        images: [{
            public_id: 'product_yoga_mat',
            url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'
        }],
        status: 'active'
    },
    {
        name: 'Adjustable Dumbbells Set',
        description: 'Space-saving adjustable dumbbells 5-25 lbs per hand',
        price: 149.99,
        ratings: 4.7,
        category: 'Sports',
        brand: 'PowerFit',
        stock: 35,
        images: [{
            public_id: 'product_dumbbells',
            url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'
        }],
        status: 'active'
    },
    {
        name: 'Running Shoes Pro',
        description: 'Lightweight running shoes with advanced cushioning technology',
        price: 89.99,
        ratings: 4.8,
        category: 'Sports',
        brand: 'RunFast',
        stock: 65,
        images: [{
            public_id: 'product_running_shoes',
            url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'
        }],
        status: 'active'
    }
];

const seedDatabase = async () => {
    try {
        await connectDatabase();

        // Get admin user (or create one if doesn't exist)
        let adminUser = await User.findOne({ role: 'admin' });

        if (!adminUser) {
            console.log('No admin user found. Creating default admin...');
            adminUser = await User.create({
                first_name: 'Admin',
                last_name: 'User',
                name: 'Admin User',
                username: 'admin',
                email: 'admin@matrixstore.com',
                password: 'admin123456',
                mobile_no: '9999999999',
                role: 'admin'
            });
            console.log('Admin user created successfully');
        }

        // Clear existing data
        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log('Cleared existing categories and products');

        // Insert categories
        const insertedCategories = await Category.insertMany(categories);
        console.log(`${insertedCategories.length} categories inserted`);

        // Add user_id to all products
        const productsWithUser = products.map(product => ({
            ...product,
            user_id: adminUser._id
        }));

        // Insert products
        const insertedProducts = await Product.insertMany(productsWithUser);
        console.log(`${insertedProducts.length} products inserted`);

        console.log('\n✅ Database seeded successfully!');
        console.log(`\nAdmin credentials:\nEmail: admin@matrixstore.com\nPassword: admin123456\n`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
