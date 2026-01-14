const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Order must belong to a user"],
        index: true
    },
    orderItems: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
                required: true
            },
            name: {
                type: String,
                required: true,
                trim: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, "Quantity must be at least 1"]
            },
            price: {
                type: Number,
                required: true,
                min: [0, "Price cannot be negative"]
            },
            image: {
                type: String,
                required: true,
                trim: true
            }
        }
    ],
    // Renamed from shippingAddress to shippingInfo to match controller/dashboard usage
    shippingInfo: {
        address: {
            type: String,
            required: [true, "Please provide shipping address"],
            trim: true
        },
        city: {
            type: String,
            required: [true, "Please provide city"],
            trim: true
        },
        state: {
            type: String,
            required: [true, "Please provide state"],
            trim: true
        },
        country: {
            type: String,
            required: [true, "Please provide country"],
            trim: true
        },
        pincode: {
            type: String,
            required: [true, "Please provide pincode"],
            trim: true
        },
        phoneNo: {
            type: String,
            required: [true, "Please provide phone number"],
            trim: true
        }
    },
    paymentInfo: {
        id: {
            type: String,
            required: false,
            trim: true
        },
        status: {
            type: String,
            required: false,
            trim: true
        },
        method: {
            type: String,
            enum: ['card', 'upi', 'netbanking', 'cod', 'wallet'],
            default: 'cod',
            trim: true
        }
    },
    paidAt: {
        type: Date
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: 0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: 0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: 0
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
        required: true,
        index: true,
        trim: true
    },
    deliveredAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    },
    cancellationReason: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);