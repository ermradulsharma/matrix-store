const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get User Cart
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        res.status(200).json({ success: true, cart: cart.items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Sync Cart (Merge Local Storage Cart with Database Cart)
exports.syncCart = async (req, res) => {
    try {
        const localItems = req.body.items || [];

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        // Merge logic:
        // 1. If item exists in DB, update quantity (optional: take max or sum? Let's take local if strictly newer, or just keep DB? 
        //    Actually, usually "sync" on login means "add local items to user's existing cart".
        //    So if user has Product A (qty 2) in DB, and Product A (qty 1) in local, result should be Product A (qty 3) or just ensure it's there.
        //    Let's go with "Add local quantity to DB quantity" for now, or just overwrite if that's simpler. 
        //    Better UX: "Merge".

        for (const localItem of localItems) {
            const product = await Product.findById(localItem.id || localItem.product); // Handle if frontend sends 'id' or 'product'
            if (!product) continue;

            const existingItemIndex = cart.items.findIndex(item => item.product.toString() === product._id.toString());

            if (existingItemIndex > -1) {
                // Product exists in DB cart, logic can be:
                // Option A: Sum quantities (risk of inflating if re-syncing)
                // Option B: Take max
                // Option C: Local overrides DB (persistence risk)
                // Let's go with: Local replaces DB if different? No, that wipes cross-device progress.
                // Let's go with: If local cart has items, we assume they are "new" additions from a guest session.
                // We shouldn't blindly sum if it might be the SAME session re-syncing.
                // However, without a session ID for the cart, we can't distinguish.
                // Strategy: We will just ensure the item is in the cart. 
                // We'll update payload to be atomic ideally, but for now let's just use the quantity from local if it's higher?
                // Let's implement: Max(dbQty, localQty) for safety, or just localQty if user intended that.
                // User Request: "if customer/user add product into the cart after the signup/login they did not remove before customer/user does not remove that product from the cart"
                // Implication: Don't lose DB items. Don't lose Local items.
                // Let's SUM them, assuming the local cart was built 'since' the last login or independent of it.
                // BUT, if I refreshed the page, I don't want to double my cart.
                // Since this is called on login, it only happens once.

                // Actually, common pattern: DB cart takes precedence, receiving NEW items from local.
                // If item exists in both, we can keep DB version or sum. Let's sum for now but cap at appropriate limits if needed.

                // Simpler Logic for MVP:
                // On login, we just want to save the local cart to DB if DB is empty. 
                // If DB has items, we add local items to it.
                cart.items[existingItemIndex].quantity += localItem.quantity || 1;
            } else {
                cart.items.push({
                    product: product._id,
                    quantity: localItem.quantity || 1
                });
            }
        }

        await cart.save();

        // Return full cart with details
        const fullCart = await Cart.findById(cart._id).populate('items.product');
        res.status(200).json({ success: true, cart: fullCart.items });

    } catch (error) {
        console.error("Sync Cart Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add to Cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += (quantity || 1);
        } else {
            cart.items.push({ product: productId, quantity: quantity || 1 });
        }

        await cart.save();
        res.status(200).json({ success: true, message: "Item added to cart", cart: cart.items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        cart.items = cart.items.filter(item => item.product.toString() !== productId);

        await cart.save();
        res.status(200).json({ success: true, message: "Item removed from cart", cart: cart.items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Quantity
exports.updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            if (quantity > 0) {
                cart.items[itemIndex].quantity = quantity;
            } else {
                cart.items.splice(itemIndex, 1);
            }
            await cart.save();
            res.status(200).json({ success: true, message: "Cart updated", cart: cart.items });
        } else {
            res.status(404).json({ success: false, message: "Item not found in cart" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
