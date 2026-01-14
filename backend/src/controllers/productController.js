const Product = require("../models/Product");
const StockManagement = require("../models/StockManagement");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncErrors");
const Features = require("../utils/features");
const User = require("../models/User");

// Create Product
exports.createProduct = catchAsyncError(async (req, res, next) => {
  req.body.user_id = req.user.id;

  // content-type: multipart/form-data leaves nested objects as strings if sent via JSON.stringify
  // or simple fields. We need to parse them if they are strings.
  ['dimensions', 'stockLimits', 'supplier'].forEach(field => {
    if (typeof req.body[field] === 'string') {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch (e) {
        // Ignore parse error, maybe it wasn't valid JSON or just a string
      }
    }
  });

  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map(file => ({
      public_id: file.filename,
      url: `/uploads/${file.filename}`
    }));
  }
  // If images are missing, maybe we should preserve empty or default?
  // But if it's create, we expect images or default logic.
  if (images.length > 0) {
    req.body.images = images;
  }

  // Create Product
  const product = await Product.create(req.body);

  // Log Initial Stock Movement
  if (product.stock > 0) {
    await StockManagement.create({
      product_id: product._id,
      user_id: req.user.id,
      type: 'initial',
      quantity: product.stock,
      previousStock: 0,
      currentStock: product.stock,
      note: 'Initial stock creation'
    });
  }

  res.status(201).json({
    success: true,
    product,
  });
});

// Update Product
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  // Parse nested objects if present
  ['dimensions', 'stockLimits', 'supplier'].forEach(field => {
    if (typeof req.body[field] === 'string') {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch (e) {
        // Ignore
      }
    }
  });

  // Handle Images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => ({
      public_id: file.filename,
      url: `/uploads/${file.filename}`
    }));

    // Append new images to existing ones
    const existingImages = product.images || [];
    req.body.images = [...existingImages, ...newImages];
  } else {
    // If no new files, respect client's wish? 
    // If client didn't send 'images' field (FormData without file/text), 
    // we shouldn't wipe images.
    if (!req.body.images) {
      delete req.body.images;
    }
  }

  // Check for stock change to log it
  if (req.body.stock !== undefined && req.body.stock != product.stock) {
    const oldStock = product.stock;
    const newStock = parseInt(req.body.stock);
    const diff = newStock - oldStock;

    await StockManagement.create({
      product_id: product._id,
      user_id: req.user.id,
      type: 'manual_adjustment',
      quantity: diff,
      previousStock: oldStock,
      currentStock: newStock,
      note: 'Updated via Edit Product form'
    });
  }

  // Update Fields
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
    message: "Product update successfully",
  });
});

// Adjust Stock (Dedicated API)
exports.adjustStock = catchAsyncError(async (req, res, next) => {
  const { quantity, type, note } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  const oldStock = product.stock;
  let newStock = oldStock;

  if (type === 'add') {
    newStock += parseInt(quantity);
  } else if (type === 'subtract') {
    newStock -= parseInt(quantity);
  } else {
    // Direct set? Only add/subtract supported for explicit adjustment usually
    return next(new ErrorHandler("Invalid adjustment type", 400));
  }

  if (newStock < 0) {
    return next(new ErrorHandler("Stock cannot be negative", 400));
  }

  product.stock = newStock;
  await product.save();

  // Log Movement
  await StockManagement.create({
    product_id: product._id,
    user_id: req.user.id,
    type: type === 'add' ? 'manual_adjustment' : 'manual_adjustment', // Or refine types
    quantity: type === 'add' ? quantity : -quantity,
    previousStock: oldStock,
    currentStock: newStock,
    note: note || 'Manual Stock Adjustment'
  });

  res.status(200).json({
    success: true,
    product,
    message: "Stock adjusted successfully"
  });
});

// Get Stock History
exports.stockHistory = catchAsyncError(async (req, res, next) => {
  const history = await StockManagement.find({ product_id: req.params.id })
    .populate('user_id', 'name email role')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    history
  });
});

exports.getAllProducts = catchAsyncError(async (req, res) => {
  const resultPerPage = 5;
  const apiFeatures = new Features(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const products = await apiFeatures.query.populate(
    "user_id",
    "name email role"
  );
  res.status(200).json({
    success: true,
    products,
    message: "Get all products",
  });
});

exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }
  res.status(200).json({
    success: true,
    product,
    message: "Product Details",
  });
});

exports.toggleProductStatus = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }
  product.status = product.status === "active" ? "inactive" : "active";
  await product.save();

  res.status(200).json({
    success: true,
    message: `Product ${product.status} successfully`,
    product
  });
});

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  // Use deleteOne method to remove the product by ID
  await Product.deleteOne({ _id: req.params.id });
  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

exports.productReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user_id: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  if (!product.reviews) {
    product.reviews = [];
  }

  const isReviewedIndex = product.reviews.findIndex(
    (rev) => rev.user_id.toString() === req.user._id.toString()
  );

  if (isReviewedIndex !== -1) {
    product.reviews[isReviewedIndex].rating = rating;
    product.reviews[isReviewedIndex].comment = comment;
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

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getProductReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found.", 404));
  }
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

exports.deleteProductReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  if (!product) {
    return next(new ErrorHandler("Product Not Found.", 404));
  }
  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );
  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });
  const ratings = reviews.length > 0 ? avg / reviews.length : 0;
  const numOfReviews = reviews.length;
  await Product.findByIdAndUpdate(
    req.query.productId,
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
  res.status(200).json({
    success: true,
    reviews: reviews,
  });
});
