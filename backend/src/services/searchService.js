const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

exports.globalSearch = async (q) => {
    const queryRegex = new RegExp(q, "i");

    const [users, products, orders] = await Promise.all([
        // Search Users
        User.find({
            $or: [
                { first_name: queryRegex },
                { last_name: queryRegex },
                { email: queryRegex }
            ]
        }).select("first_name last_name email role image _id").limit(5),

        // Search Products
        Product.find({
            name: queryRegex
        }).select("name price images category _id").limit(5),

        // Search Orders
        Order.find({
            _id: mongoose.isValidObjectId(q) ? q : null
        }).select("_id totalPrice orderStatus createdAt user").populate("user", "first_name last_name").limit(5)
    ]);

    return { users, products, orders };
};
