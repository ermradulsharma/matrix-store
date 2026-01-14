const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const orderService = require("../services/orderService");

// Create new Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await orderService.createOrder(req.body, req.user);
  res.status(201).json({
    success: true,
    order,
  });
});

// Get Single Order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await orderService.getSingleOrder(req.params.id);
  res.status(200).json({
    success: true,
    order,
  });
});

// Get logged in user Orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await orderService.getUserOrders(req.user._id);
  res.status(200).json({
    success: true,
    orders,
  });
});

// Get all Orders -- Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const { orders, totalAmount } = await orderService.getAllOrders();
  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// Update Order Status -- Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  await orderService.updateOrder(req.params.id, req.body.status);
  res.status(200).json({
    success: true,
  });
});

// Delete Order -- Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  await orderService.deleteOrder(req.params.id);
  res.status(200).json({
    success: true,
  });
});

