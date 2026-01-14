const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const paymentService = require("../services/paymentService");

// Process Payment (Create Order)
exports.processPayment = catchAsyncErrors(async (req, res, next) => {
  const order = await paymentService.createOrder(req.body.amount);

  res.status(200).json({
    success: true,
    order,
  });
});

// Verify Payment
exports.paymentVerification = catchAsyncErrors(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const isAuthentic = paymentService.verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (isAuthentic) {
    res.status(200).json({
      success: true,
      razorpay_payment_id,
      razorpay_order_id
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Payment verification failed",
    });
  }
});

exports.sendRazorpayKey = catchAsyncErrors(async (req, res, next) => {
  const key = paymentService.getPublicKey();
  res.status(200).json({ key });
});
