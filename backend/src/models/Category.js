const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter Category title."],
        trim: true,
        unique: true,
        index: true
    },
    slug: {
        type: String,
        required: [true, "Please enter Category slug."],
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    image: {
        public_id: {
            type: String,
            required: true,
            trim: true
        },
        url: {
            type: String,
            required: true,
            trim: true
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        index: true
    }
}, {
    timestamps: true
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;