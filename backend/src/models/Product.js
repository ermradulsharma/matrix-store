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
        min: [0, "Price cannot be negative"],
        max: [99999999, "Price is too high"]
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
        required: false
    },
    model: {
        type: String,
        required: false
    },
    dimensions: {
        width: {
            type: Number,
            required: false
        },
        height: {
            type: Number,
            required: false
        },
        depth: {
            type: Number,
            required: false
        }
    },
    weight: {
        type: Number,
        required: false
    },

    // Stock Details
    stock: {
        type: Number,
        required: [true, "Please Enter Product Stock"],
        default: 1,
        min: [0, "Stock cannot be negative"],
        max: [9999, "Stock is too high"]
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

    // Supplier Details (Optional)
    supplier: {
        name: {
            type: String,
            required: false
        },
        contact: {
            type: String,
            required: false
        },
        email: {
            type: String,
            required: false
        },
        address: {
            type: String,
            required: false
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
    provider: {
        type: mongoose.Schema.ObjectId,
        ref: "Provider",
        required: false
    },
    postedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: false
    },
    approvalStatus: {
        type: String,
        enum: ['draft', 'pending_approval', 'approved', 'rejected'],
        default: 'approved'
    },
    approvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: false
    },
    approvedAt: Date,
    rejectedAt: Date,
    rejectionReason: String
}, {
    timestamps: true
});

module.exports = mongoose.model("Product", ProductSchema);
