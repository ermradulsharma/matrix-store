const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    // Basic Product Details
    name: {
        type: String,
        required: [true, "Please Enter Product Name."]
    },
    description: {
        type: String,
        required: [true, "Please Enter Product Description."]
    },
    price: {
        type: Number,
        required: [true, "Please Enter Product Price."],
        maxLength: [8, "Price Can't exceed 8 characters"]
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, "Please Enter Product Category."]
    },
    brand: {
        type: String,
        required: [true, "Please Enter Product Brand."]
    },
    model: {
        type: String,
        required: [true, "Please Enter Product Model."]
    },
    dimensions: {
        width: {
            type: Number,
            required: [true, "Please Enter Product Width."]
        },
        height: {
            type: Number,
            required: [true, "Please Enter Product Height."]
        },
        depth: {
            type: Number,
            required: [true, "Please Enter Product Depth."]
        }
    },
    weight: {
        type: Number,
        required: [true, "Please Enter Product Weight."]
    },

    // Stock Details
    stock: {
        type: Number,
        required: [true, "Please Enter Product Stock"],
        default: 1,
        maxLength: [4, "Stock Can't exceed 4 characters"]
    },

    stockHistory: [
        {
            type: {
                type: String, // "restock" or "sale"
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            },
            description: {
                type: String, // Optional field for comments
                default: ""
            }
        }
    ],

    // Stock Limits
    stockLimits: {
        minStock: {
            type: Number,
            default: 10 // Default minimum stock threshold
        },
        maxStock: {
            type: Number,
            default: 500 // Default maximum stock threshold
        }
    },

    numOfReviews: {
        type: Number,
        default: 0
    },

    reviews: [
        {
            user_id: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],

    // Supplier Details (Optional but can be added for more information)
    supplier: {
        name: {
            type: String,
            required: [true, "Please Enter Supplier Name."]
        },
        contact: {
            type: String,
            required: [true, "Please Enter Supplier Contact."]
        },
        email: {
            type: String,
            required: [true, "Please Enter Supplier Email."]
        },
        address: {
            type: String,
            required: [true, "Please Enter Supplier Address."]
        }
    },

    // Product Status (Active or Inactive)
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },

    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Product", ProductSchema);
