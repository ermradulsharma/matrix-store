const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Order must belong to a user"]
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
                required: true
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
                required: true
            }
        }
    ],
    shippingAddress: {
        address: {
            type: String,
            required: [true, "Please provide shipping address"]
        },
        city: {
            type: String,
            required: [true, "Please provide city"]
        },
        state: {
            type: String,
            required: [true, "Please provide state"]
        },
        country: {
            type: String,
            required: [true, "Please provide country"]
        },
        pincode: {
            type: String,
            required: [true, "Please provide pincode"]
        },
        phoneNo: {
            type: String,
            required: [true, "Please provide phone number"]
        }
    },
    paymentInfo: {
        id: {
            type: String,
            required: false
        },
        status: {
            type: String,
            required: false
        },
        method: {
            type: String,
            enum: ['card', 'upi', 'netbanking', 'cod', 'wallet'],
            default: 'cod'
        }
    },
    paidAt: {
        type: Date
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    deliveredAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    },
    cancellationReason: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);