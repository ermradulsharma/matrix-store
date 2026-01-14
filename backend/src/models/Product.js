const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    // Basic Product Details
    name: {
        type: String,
        required: [true, "Please Enter Product Name."],
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: [true, "Please Enter Product Description."],
        trim: true
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
                required: true,
                trim: true
            },
            url: {
                type: String,
                required: true,
                trim: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, "Please Enter Product Category."],
        trim: true,
        index: true
    },
    brand: {
        type: String,
        required: false,
        trim: true
    },
    model: {
        type: String,
        required: false,
        trim: true
    },
    dimensions: {
        width: {
            type: Number,
            required: false,
            min: 0
        },
        height: {
            type: Number,
            required: false,
            min: 0
        },
        depth: {
            type: Number,
            required: false,
            min: 0
        }
    },
    weight: {
        type: Number,
        required: false,
        min: 0
    },

    // Stock Details
    sku: {
        type: String,
        required: [true, "Please Enter Product SKU"],
        unique: true,
        trim: true,
        index: true
    },
    barcode: {
        type: String,
        trim: true,
        index: true
    },
    location: {
        type: String, // Warehouse location, e.g., "A1-B2"
        trim: true
    },
    stock: {
        type: Number,
        required: [true, "Please Enter Product Stock"],
        default: 0,
        min: [0, "Stock cannot be negative"],
        max: [99999, "Stock is too high"]
    },

    // Stock Limits
    stockLimits: {
        minStock: {
            type: Number,
            default: 10, // Default minimum stock threshold
            min: 0
        },
        maxStock: {
            type: Number,
            default: 500, // Default maximum stock threshold
            min: 0
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
                required: true,
                trim: true
            },
            rating: {
                type: Number,
                required: true,
                min: 0,
                max: 5
            },
            comment: {
                type: String,
                required: true,
                trim: true
            }
        }
    ],

    // Supplier Details (Optional)
    supplier: {
        name: {
            type: String,
            required: false,
            trim: true
        },
        contact: {
            type: String,
            required: false,
            trim: true
        },
        email: {
            type: String,
            required: false,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please add a valid email"
            ]
        },
        address: {
            type: String,
            required: false,
            trim: true
        }
    },

    // Product Status
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        index: true
    },

    // Ownership & Approvals
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    provider: {
        type: mongoose.Schema.ObjectId,
        ref: "Provider",
        required: false,
        index: true
    },
    postedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: false
    },
    approvalStatus: {
        type: String,
        enum: ['draft', 'pending_approval', 'approved', 'rejected'],
        default: 'approved',
        index: true
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

// Text index for search functionality
ProductSchema.index({
    name: 'text',
    description: 'text',
    brand: 'text',
    sku: 'text',
    category: 'text'
});

module.exports = mongoose.model("Product", ProductSchema);
