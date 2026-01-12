const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    provider: {
        type: mongoose.Schema.ObjectId,
        ref: "Provider",
        required: [true, "Invoice must be linked to a provider"]
    },
    requirement: {
        type: mongoose.Schema.ObjectId,
        ref: "Requirement",
        required: false
    },
    items: [{
        description: {
            type: String,
            required: true
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
            required: true
        }
    }],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'paid', 'rejected'],
        default: 'draft'
    },
    submittedAt: Date,
    approvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    approvedAt: Date,
    rejectedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    rejectedAt: Date,
    rejectionReason: String,
    paidAt: Date,
    paymentMethod: {
        type: String,
        enum: ['bank_transfer', 'cheque', 'cash', 'online'],
        required: false
    },
    paymentReference: String,
    notes: String,
    attachments: [{
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

// Auto-generate invoice number
invoiceSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        const count = await mongoose.model('Invoice').countDocuments();
        this.invoiceNumber = `INV-${Date.now()}-${count + 1}`;
    }
    next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);
