const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter requirement title"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please enter requirement description"]
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.ObjectId,
        ref: "Provider",
        required: [true, "Please assign to a provider"]
    },
    productDetails: {
        category: String,
        specifications: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        estimatedPrice: Number
    },
    deadline: {
        type: Date,
        required: [true, "Please set a deadline"]
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_progress', 'fulfilled', 'rejected'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    notes: [{
        author: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        },
        message: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    acceptedAt: Date,
    fulfilledAt: Date,
    rejectedAt: Date,
    rejectionReason: String
}, {
    timestamps: true
});

module.exports = mongoose.model("Requirement", requirementSchema);
