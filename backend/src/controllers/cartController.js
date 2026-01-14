const cartService = require("../services/cartService");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// Get User Cart
exports.getCart = catchAsyncErrors(async (req, res, next) => {
    const cartItems = await cartService.getCart(req.user._id);
    res.status(200).json({ success: true, cart: cartItems });
});

// Sync Cart
exports.syncCart = catchAsyncErrors(async (req, res, next) => {
    const cartItems = await cartService.syncCart(req.user._id, req.body.items);
    res.status(200).json({ success: true, cart: cartItems });
});

// Add to Cart
exports.addToCart = catchAsyncErrors(async (req, res, next) => {
    const { productId, quantity } = req.body;
    const cartItems = await cartService.addToCart(req.user._id, productId, quantity);
    res.status(200).json({ success: true, message: "Item added to cart", cart: cartItems });
});

// Remove from Cart
exports.removeFromCart = catchAsyncErrors(async (req, res, next) => {
    const { productId } = req.params;
    const cartItems = await cartService.removeFromCart(req.user._id, productId);
    res.status(200).json({ success: true, message: "Item removed from cart", cart: cartItems });
});

// Update Quantity
exports.updateCartItem = catchAsyncErrors(async (req, res, next) => {
    const { productId, quantity } = req.body;
    const cartItems = await cartService.updateCartItem(req.user._id, productId, quantity);
    res.status(200).json({ success: true, message: "Cart updated", cart: cartItems });
});

