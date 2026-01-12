const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Provider must be linked to a user"],
        unique: true
    },
    companyName: {
        type: String,
        required: [true, "Please enter company name"],
        trim: true
    },
    businessRegistration: {
        type: String,
        required: [true, "Please enter business registration number"],
        unique: true
    },
    contactPerson: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        ifscCode: String,
        branch: String
    },
    productCategories: [{
        type: String
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    completedOrders: {
        type: Number,
        default: 0
    },
    manager: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Provider must be assigned to a manager"]
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    documents: [{
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model("Provider", providerSchema);
