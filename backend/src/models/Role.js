const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter role name"],
        unique: true,
        trim: true,
        lowercase: true,
        enum: ['super_admin', 'admin', 'manager', 'provider', 'user', 'customer'],
        index: true
    },
    // Broad categorization for high-level logic (e.g. dashboard access vs storefront)
    type: {
        type: String,
        required: true,
        enum: ['admin', 'user'],
        default: 'user',
        index: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    // Specific permissions for granular control
    permissions: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);
