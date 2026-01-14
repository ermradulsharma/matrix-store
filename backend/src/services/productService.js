const Product = require("../models/Product");
const StockManagement = require("../models/StockManagement");
const Features = require("../utils/features");
const ErrorHandler = require("../utils/errorHandler");

// Helper to parse potential JSON strings
const parseJSONFields = (data, fields) => {
    fields.forEach(field => {
        if (typeof data[field] === 'string') {
            try {
                data[field] = JSON.parse(data[field]);
            } catch (e) {
                // Ignore
            }
        }
    });
    return data;
};

// Create Product
exports.createProduct = async (data, files, userId) => {
    data.user_id = userId;

    // Parse nested objects
    data = parseJSONFields(data, ['dimensions', 'stockLimits', 'supplier']);

    // Handle Images
    let images = [];
    if (files && files.length > 0) {
        images = files.map(file => ({
            public_id: file.filename,
            url: `/uploads/${file.filename}`
        }));
    }
    if (images.length > 0) {
        data.images = images;
    }

    const product = await Product.create(data);

    // Initial Stock Log
    if (product.stock > 0) {
        await StockManagement.create({
            product_id: product._id,
            user_id: userId,
            type: 'initial',
            quantity: product.stock,
            previousStock: 0,
            currentStock: product.stock,
            note: 'Initial stock creation'
        });
    }

    return product;
};

// Update Product
exports.updateProduct = async (id, data, files, userId) => {
    let product = await Product.findById(id);
    if (!product) {
        throw new ErrorHandler("Product Not Found", 404);
    }

    data = parseJSONFields(data, ['dimensions', 'stockLimits', 'supplier']);

    // Handle Images
    if (files && files.length > 0) {
        const newImages = files.map(file => ({
            public_id: file.filename,
            url: `/uploads/${file.filename}`
        }));
        const existingImages = product.images || [];
        data.images = [...existingImages, ...newImages];
    } else {
        if (!data.images) {
            delete data.images;
        }
    }

    // Stock Log
    if (data.stock !== undefined && data.stock != product.stock) {
        const oldStock = product.stock;
        const newStock = parseInt(data.stock);
        const diff = newStock - oldStock;

        await StockManagement.create({
            product_id: product._id,
            user_id: userId,
            type: 'manual_adjustment',
            quantity: diff,
            previousStock: oldStock,
            currentStock: newStock,
            note: 'Updated via Edit Product form'
        });
    }

    product = await Product.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    return product;
};

// Adjust Stock
exports.adjustStock = async (id, { quantity, type, note }, userId) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new ErrorHandler("Product Not Found", 404);
    }

    const oldStock = product.stock;
    let newStock = oldStock;

    if (type === 'add') {
        newStock += parseInt(quantity);
    } else if (type === 'subtract') {
        newStock -= parseInt(quantity);
    } else {
        throw new ErrorHandler("Invalid adjustment type", 400);
    }

    if (newStock < 0) {
        throw new ErrorHandler("Stock cannot be negative", 400);
    }

    product.stock = newStock;
    await product.save();

    await StockManagement.create({
        product_id: product._id,
        user_id: userId,
        type: type === 'add' ? 'manual_adjustment' : 'manual_adjustment',
        quantity: type === 'add' ? quantity : -quantity,
        previousStock: oldStock,
        currentStock: newStock,
        note: note || 'Manual Stock Adjustment'
    });

    return product;
};

// Get Stock History
exports.stockHistory = async (id) => {
    return await StockManagement.find({ product_id: id })
        .populate('user_id', 'name email role')
        .sort({ createdAt: -1 });
};

// Get All Products
exports.getAllProducts = async (query) => {
    const resultPerPage = 5;
    const apiFeatures = new Features(Product.find(), query)
        .search()
        .filter()
        .pagination(resultPerPage);

    return await apiFeatures.query.populate("user_id", "name email role");
};

// Get Product Details
exports.getProductDetails = async (id) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new ErrorHandler("Product Not Found", 404);
    }
    return product;
};

// Toggle Status
exports.toggleStatus = async (id) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new ErrorHandler("Product Not Found", 404);
    }
    product.status = product.status === "active" ? "inactive" : "active";
    await product.save();
    return product;
};

// Delete Product
exports.deleteProduct = async (id) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new ErrorHandler("Product Not Found", 404);
    }
    await Product.deleteOne({ _id: id });
};

// Create Review
exports.createReview = async (productId, reviewData, user) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ErrorHandler("Product Not Found", 404);
    }

    const review = {
        user_id: user._id,
        name: user.name,
        rating: Number(reviewData.rating),
        comment: reviewData.comment,
    };

    if (!product.reviews) {
        product.reviews = [];
    }

    const isReviewedIndex = product.reviews.findIndex(
        (rev) => rev.user_id.toString() === user._id.toString()
    );

    if (isReviewedIndex !== -1) {
        product.reviews[isReviewedIndex].rating = review.rating;
        product.reviews[isReviewedIndex].comment = review.comment;
    } else {
        product.reviews.push(review);
    }

    product.numOfReviews = product.reviews.length;

    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });
    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });
    return product;
};

// Get Reviews
exports.getReviews = async (id) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new ErrorHandler("Product Not Found.", 404);
    }
    return product.reviews;
};

// Delete Review
exports.deleteReview = async (productId, reviewId) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ErrorHandler("Product Not Found.", 404);
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== reviewId.toString()
    );

    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating;
    });
    const ratings = reviews.length > 0 ? avg / reviews.length : 0;
    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
        productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );
    return reviews;
};
