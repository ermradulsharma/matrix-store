// models/Role.js
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['admin', 'user'],
        default: 'user'
    },
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['admin', 'manager', 'provider', 'user'],
    },
    description: {
        type: String,
        default: '',
    },
});

module.exports = mongoose.model('Role', roleSchema);
