const Razorpay = require("razorpay");
const crypto = require("crypto");
const ErrorHandler = require("../utils/errorHandler");

// Initialize Razorpay Instance
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder",
});

/**
 * Create a new Razorpay Order
 * @param {number} amount - Amount in INR
 * @returns {Promise<Object>} - Razorpay Order Object
 */
exports.createOrder = async (amount) => {
    const options = {
        amount: Number(amount * 100), // Amount in smallest currency unit (paise)
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    };

    return await instance.orders.create(options);
};

/**
 * Verify Razorpay Payment Signature
 * @param {string} razorpay_order_id
 * @param {string} razorpay_payment_id
 * @param {string} razorpay_signature
 * @returns {boolean} - True if signature is valid
 */
exports.verifyPaymentSignature = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder")
        .update(body.toString())
        .digest("hex");

    return expectedSignature === razorpay_signature;
};

/**
 * Get Razorpay Public Key
 * @returns {string}
 */
exports.getPublicKey = () => {
    return process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
};
