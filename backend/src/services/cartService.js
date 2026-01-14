const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Helper to get or create cart
const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
};

// Get User Cart
exports.getCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }
    return cart.items;
};

// Sync Cart
exports.syncCart = async (userId, localItems) => {
    const cart = await getOrCreateCart(userId);
    const items = localItems || [];

    for (const localItem of items) {
        const product = await Product.findById(localItem.id || localItem.product);
        if (!product) continue;

        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === product._id.toString());

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += localItem.quantity || 1;
        } else {
            cart.items.push({
                product: product._id,
                quantity: localItem.quantity || 1
            });
        }
    }

    await cart.save();
    const fullCart = await Cart.findById(cart._id).populate('items.product');
    return fullCart.items;
};

// Add to Cart
exports.addToCart = async (userId, productId, quantity) => {
    const cart = await getOrCreateCart(userId);
    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += (quantity || 1);
    } else {
        cart.items.push({ product: productId, quantity: quantity || 1 });
    }

    await cart.save();
    return cart.items;
};

// Remove from Cart
exports.removeFromCart = async (userId, productId) => {
    const cart = await getOrCreateCart(userId);
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    return cart.items;
};

// Update Cart Item
exports.updateCartItem = async (userId, productId, quantity) => {
    const cart = await getOrCreateCart(userId);
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
        if (quantity > 0) {
            cart.items[itemIndex].quantity = quantity;
        } else {
            cart.items.splice(itemIndex, 1);
        }
        await cart.save();
        return cart.items;
    } else {
        throw new Error("Item not found in cart");
    }
};
