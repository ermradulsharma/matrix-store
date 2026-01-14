const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const productService = require("../services/productService");

// Create Product
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await productService.createProduct(req.body, req.files, req.user.id);
  res.status(201).json({
    success: true,
    product,
  });
});

// Update Product
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.files, req.user.id);
  res.status(200).json({
    success: true,
    product,
    message: "Product update successfully",
  });
});

// Adjust Stock
exports.adjustStock = catchAsyncErrors(async (req, res, next) => {
  const product = await productService.adjustStock(req.params.id, req.body, req.user.id);
  res.status(200).json({
    success: true,
    product,
    message: "Stock adjusted successfully"
  });
});

// Get Stock History
exports.stockHistory = catchAsyncErrors(async (req, res, next) => {
  const history = await productService.stockHistory(req.params.id);
  res.status(200).json({
    success: true,
    history
  });
});

// Get All Products
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
  const products = await productService.getAllProducts(req.query);
  res.status(200).json({
    success: true,
    products,
    message: "Get all products",
  });
});

// Get Product Details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await productService.getProductDetails(req.params.id);
  res.status(200).json({
    success: true,
    product,
    message: "Product Details",
  });
});

// Toggle Product Status
exports.toggleProductStatus = catchAsyncErrors(async (req, res, next) => {
  const product = await productService.toggleStatus(req.params.id);
  res.status(200).json({
    success: true,
    message: `Product ${product.status} successfully`,
    product
  });
});

// Delete Product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  await productService.deleteProduct(req.params.id);
  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

// Create/Update Logic Review
exports.productReview = catchAsyncErrors(async (req, res, next) => {
  const product = await productService.createReview(req.body.productId, req.body, req.user);
  res.status(200).json({
    success: true,
    product,
  });
});

// Get Reviews
exports.getProductReview = catchAsyncErrors(async (req, res, next) => {
  const reviews = await productService.getReviews(req.params.id);
  res.status(200).json({
    success: true,
    reviews,
  });
});

// Delete Review
exports.deleteProductReviews = catchAsyncErrors(async (req, res, next) => {
  const reviews = await productService.deleteReview(req.query.productId, req.query.id);
  res.status(200).json({
    success: true,
    reviews: reviews,
  });
});

