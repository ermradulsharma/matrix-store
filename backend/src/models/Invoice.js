const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    provider: {
        type: mongoose.Schema.ObjectId,
        ref: "Provider",
        required: [true, "Invoice must be linked to a provider"],
        index: true
    },
    requirement: {
        type: mongoose.Schema.ObjectId,
        ref: "Requirement",
        required: false,
        index: true
    },
    items: [{
        description: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    subtotal: {
        type: Number, // Sum of items.totalPrice
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    // Adding discount field if needed in future, but keeping simple for now
    totalAmount: {
        type: Number, // subtotal + tax
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'paid', 'rejected'],
        default: 'draft',
        index: true
    },
    submittedAt: Date,
    approvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        index: true
    },
    approvedAt: Date,
    rejectedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    rejectedAt: Date,
    rejectionReason: {
        type: String,
        trim: true
    },
    paidAt: Date,
    paymentMethod: {
        type: String,
        enum: ['bank_transfer', 'cheque', 'cash', 'online'],
        required: false
    },
    paymentReference: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    attachments: [{
        name: {
            type: String,
            trim: true
        },
        url: {
            type: String,
            trim: true,
            required: true
        },
        public_id: {
            type: String,
            trim: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Auto-generate invoice number if not provided
invoiceSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        // Simple generation strategy: INV-{TIMESTAMP}-{RANDOM}
        // Using countDocuments is risky for race conditions, Timestamp + Random is safer for low volume
        const dateStr = Date.now().toString();
        const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.invoiceNumber = `INV-${dateStr}-${randomStr}`;
    }
    next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);
