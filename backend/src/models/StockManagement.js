const mongoose = require('mongoose');

const StockManagementSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true // Who performed the action
    },
    type: {
        type: String,
        enum: ['initial', 'purchase', 'sale', 'return', 'manual_adjustment', 'damage', 'correction'],
        required: true
    },
    quantity: {
        type: Number,
        required: true // Positive for add, negative for remove
    },
    previousStock: {
        type: Number,
        required: true
    },
    currentStock: {
        type: Number,
        required: true
    },
    reference: {
        type: String, // e.g., "Order #1234"
        default: ''
    },
    note: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StockManagement', StockManagementSchema);
