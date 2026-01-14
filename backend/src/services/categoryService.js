const Category = require("../models/Category");
const ErrorHandler = require("../utils/errorHandler");
const { default: slugify } = require("slugify");

// Create Category
exports.createCategory = async (data, file) => {
    const { title, description } = data;

    // Logic from controller: "image" string logic vs file. 
    // In controller: let image = "https://example.com/default-category.png"; if (req.file) image = ...
    // Note: Model expects image object { public_id, url } or string?
    // Checking model: image: { public_id: String, url: String }
    // BUT controller code: image = "https..." or "/uploads/..." string.
    // AND create({ title, description, slug, image })
    // Use model schema logic? 
    // Re-checking model file...
    // Model has: image: { public_id: { type: String, required: true }, url: { type: String, required: true } }
    // Controller "image" is just a string? This would FAIL mongoose validation if validation runs.
    // Wait, let's re-read controller.
    // Controller: const category = await Category.create({ title, description, slug, image });
    // If Model requires object, this fails.
    // Maybe Model was updated recently? Or Controller is broken?
    // Let's assume we need to fix this or follow the pattern.
    // If we assume controller WAS working, then Model might accept string or allow casting?
    // No, Mongoose doesn't auto-cast string to { public_id, url } unless strict: false or something.
    // Actually, looking at previous steps, I might have updated Model but not Controller fully?
    // Let's implement the Service to match the Model structure for robustness.

    let image = {
        public_id: "default_id",
        url: "https://example.com/default-category.png"
    };

    if (file) {
        image = {
            public_id: file.filename,
            url: `/uploads/${file.filename}`
        };
    }

    const slug = slugify(title, { lower: true, strict: true });

    // We should allow slug update if title changes or enforce uniqueness handling.
    // Mongoose will throw error if duplicates.

    return await Category.create({ title, description, slug, image });
};

// Get All Categories
exports.getAllCategories = async () => {
    return await Category.find();
};

// Get Category Details
exports.getCategoryById = async (id) => {
    const category = await Category.findById(id);
    if (!category) {
        throw new ErrorHandler("Category Not Found", 404);
    }
    return category;
};

// Update Category
exports.updateCategory = async (id, data, file) => {
    let category = await Category.findById(id);
    if (!category) {
        throw new ErrorHandler("Category Not Found", 404);
    }

    // Update image if provided
    if (file) {
        data.image = {
            public_id: file.filename,
            url: `/uploads/${file.filename}`
        };
    }

    // Update Slug if title changes? Usually kept static or updated explicitly.
    if (data.title) {
        data.slug = slugify(data.title, { lower: true, strict: true });
    }

    category = await Category.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    return category;
};

// Delete Category
exports.deleteCategory = async (id) => {
    const category = await Category.findById(id);
    if (!category) {
        throw new ErrorHandler("Category Not Found", 404);
    }
    await Category.deleteOne({ _id: id });
};

// Toggle Status
exports.toggleStatus = async (id) => {
    const category = await Category.findById(id);
    if (!category) {
        throw new ErrorHandler("Category Not Found", 404);
    }

    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    category.status = newStatus;
    await category.save();
    return category;
};
