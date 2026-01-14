const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter requirement title"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please enter requirement description"],
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    assignedTo: {
        type: mongoose.Schema.ObjectId,
        ref: "User", // Assuming Providers are Users with 'provider' role. Change to 'Provider' model if strictly separate.
        // Based on User model, Provider is a role. Or matches Provider model? 
        // Existing codebase used ref: "Provider". Let's check if Provider model exists or if it's User.
        // I recall Provider.js model exists.
        ref: "Provider",
        required: [true, "Please assign to a provider"],
        index: true
    },
    items: [
        {
            name: {
                type: String,
                required: true,
                trim: true
            },
            specifications: {
                type: String,
                trim: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, "Quantity must be at least 1"]
            },
            expectedPrice: {
                type: Number,
                min: 0
            },
            fulfilledQuantity: {
                type: Number,
                default: 0,
                min: 0
            }
        }
    ],
    deadline: {
        type: Date,
        required: [true, "Please set a deadline"]
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'fulfilled', 'closed'],
        default: 'pending',
        index: true,
        trim: true
    },
    // Approval Workflow Fields
    approvalStatus: {
        type: String,
        enum: ['pending_approval', 'approved', 'rejected'],
        default: 'pending_approval',
        index: true,
        trim: true
    },
    approvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    approvedAt: Date,
    adminNote: {
        type: String,
        trim: true
    },
    isSentToProvider: {
        type: Boolean,
        default: false,
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        index: true
    },
    notes: [{
        author: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        },
        message: {
            type: String,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    closedAt: Date
}, {
    timestamps: true
});

module.exports = mongoose.model("Requirement", requirementSchema);
