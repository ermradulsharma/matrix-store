const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter Category."]
    },
    slug: {
        type: String,
        unique: true,
        required: [true, "Please enter Slug."]
    },
    description: {
        type: String,
        required: false
    },
    image: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }

},
    { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;