const Order = require("../models/Order");
const Product = require("../models/Product");
const ErrorHandler = require("../utils/errorHandler");

// Create new Order
exports.createOrder = async (data, user) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = data;

    // 1. Verify all products have sufficient stock
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) {
            throw new ErrorHandler(`Product not found with id: ${item.product}`, 404);
        }
        if (product.stock < item.quantity) {
            throw new ErrorHandler(`Insufficient stock for product: ${product.name}`, 400);
        }
    }

    // 2. Deduct stock atomically
    for (const item of orderItems) {
        const result = await Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { new: true }
        );

        if (!result) {
            throw new ErrorHandler(`Stock update failed for product ID: ${item.product}. Please try again.`, 400);
        }
    }

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: user._id,
    });

    return order;
};

// Get Single Order
exports.getSingleOrder = async (id) => {
    const order = await Order.findById(id).populate("user", "name email");

    if (!order) {
        throw new ErrorHandler("Order not found with this Id", 404);
    }

    return order;
};

// Get logged in user Orders
exports.getUserOrders = async (userId) => {
    return await Order.find({ user: userId });
};

// Get all Orders -- Admin
exports.getAllOrders = async () => {
    const orders = await Order.find();
    let totalAmount = 0;

    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    return { orders, totalAmount };
};

// Update Order Status -- Admin
exports.updateOrder = async (id, status) => {
    const order = await Order.findById(id);

    if (!order) {
        throw new ErrorHandler("Order not found with this Id", 404);
    }

    if (order.orderStatus === "Delivered") {
        throw new ErrorHandler("You have already delivered this order", 400);
    }

    order.orderStatus = status;

    if (status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });
    return order;
};

// Delete Order -- Admin
exports.deleteOrder = async (id) => {
    const order = await Order.findById(id);

    if (!order) {
        throw new ErrorHandler("Order not found with this Id", 404);
    }

    await order.deleteOne();
};
