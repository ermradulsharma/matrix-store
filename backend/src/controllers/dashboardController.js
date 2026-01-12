const catchAsyncError = require("../middlewares/catchAsyncErrors");
const User = require("../models/User");
const Product = require("../models/Product"); // Assuming Product model exists
const Order = require("../models/Order"); // Assuming Order model exists

exports.getSuperAdminStats = catchAsyncError(async (req, res, next) => {
  const users = await User.find();
  const products = await Product.countDocuments();
  const orders = await Order.find();

  // 1. Calculate Monthly Revenue (Last 6 Months)
  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        total: { $sum: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Map month numbers to names
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const revenueData = monthlyRevenue.map((item) => ({
    name: monthNames[item._id - 1],
    total: item.total,
  }));

  // 2. Order Status Distribution
  const orderStatusCounts = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);
  const pieData = orderStatusCounts.map((item) => ({
    name: item._id,
    value: item.count,
  }));

  // 3. Recent Orders (Last 5)
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "name email");

  const stats = {
    users: {
      total: users.length,
      admin: users.filter((u) => u.role === "admin").length,
      manager: users.filter((u) => u.role === "manager").length,
      provider: users.filter((u) => u.role === "provider").length,
      customer: users.filter((u) => u.role === "customer").length,
    },
    products: products,
    orders: {
      total: orders.length,
      totalAmount: orders.reduce(
        (acc, order) => acc + (order.totalPrice || 0),
        0
      ),
    },
    revenueData,
    pieData,
    recentOrders,
  };

  res.status(200).json({
    success: true,
    stats,
  });
});

exports.getAdvancedStats = catchAsyncError(async (req, res, next) => {
  const { period } = req.query; // daily, weekly, monthly, yearly

  let dateFilter = {};
  let groupBy = {};
  let sortBy = { _id: 1 };

  const now = new Date();

  // Determine Time Filter & Grouping
  switch (period) {
    case "daily":
      dateFilter = {
        createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) },
      }; // Last 30 days
      groupBy = {
        day: { $dayOfMonth: "$createdAt" },
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
      };
      break;
    case "weekly":
      dateFilter = {
        createdAt: { $gte: new Date(now.setDate(now.getDate() - 90)) },
      }; // Last ~3 months
      groupBy = {
        week: { $week: "$createdAt" },
        year: { $year: "$createdAt" },
      };
      break;
    case "monthly":
      dateFilter = {
        createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 12)) },
      }; // Last 12 months
      groupBy = {
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
      };
      break;
    case "yearly":
      dateFilter = {}; // All time or last 5 years
      groupBy = { year: { $year: "$createdAt" } };
      break;
    default: // Default to monthly
      dateFilter = {
        createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 12)) },
      };
      groupBy = {
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
      };
  }

  // 1. Revenue Trend
  const revenueTrend = await Order.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: groupBy,
        total: { $sum: "$totalPrice" },
        count: { $sum: 1 },
      },
    },
    { $sort: sortBy }, // Sort by date components
  ]);

  // Format labels for frontend
  const formattedTrend = revenueTrend.map((item) => {
    let label = "";
    if (item._id.day) label = `${item._id.day}/${item._id.month}`;
    else if (item._id.week) label = `Week ${item._id.week}`;
    else if (item._id.month)
      label = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ][item._id.month - 1];
    else if (item._id.year) label = `${item._id.year}`;

    return { name: label, value: item.total, count: item.count };
  });

  // 2. Top Selling Products
  const topProducts = await Order.aggregate([
    { $match: dateFilter },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.product",
        totalQuantity: { $sum: "$orderItems.quantity" },
        totalRevenue: {
          $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
        },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $project: {
        name: "$productDetails.name",
        quantity: "$totalQuantity",
        revenue: "$totalRevenue",
        owner: "$productDetails.user_id", // Get owner ID
      },
    },
  ]);

  // Populate Owner details manually (since lookup is complex with double nesting)
  // or just assume we want Role based stats next.

  // 3. Sales By Product Owner Role (Who is selling?)
  // This requires: Order -> OrderItems -> Product -> User (Owner) -> Role
  const salesByRole = await Order.aggregate([
    { $match: dateFilter },
    { $unwind: "$orderItems" },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $lookup: {
        from: "users",
        localField: "product.user_id",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $group: {
        _id: "$owner.role",
        totalRevenue: {
          $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
        },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    trend: formattedTrend,
    topProducts,
    salesByRole: salesByRole.map((s) => ({
      name: s._id,
      value: s.totalRevenue,
    })),
  });
});
