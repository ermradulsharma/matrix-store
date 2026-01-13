const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

exports.globalSearch = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ success: false, message: "Query parameter is required" });
        }

        const queryRegex = new RegExp(q, "i"); // Case-insensitive regex

        // Parallel Search
        const [users, products, orders] = await Promise.all([
            // Search Users by name or email
            User.find({
                $or: [
                    { first_name: queryRegex },
                    { last_name: queryRegex },
                    { email: queryRegex }
                ]
            }).select("first_name last_name email role image _id").limit(5),

            // Search Products by name
            Product.find({
                name: queryRegex
            }).select("name price images category _id").limit(5),

            // Search Orders by ID (exact match usually preferred, but partial allowed for usability)
            Order.find({
                _id: mongoose.isValidObjectId(q) ? q : null
            }).select("_id totalPrice orderStatus createdAt user").populate("user", "first_name last_name").limit(5)
        ]);

        res.status(200).json({
            success: true,
            results: {
                users,
                products,
                orders
            }
        });

    } catch (error) {
        console.error("Global Search Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
