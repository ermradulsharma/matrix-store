import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { submitOrder, getRazorpayKey, createRazorpayOrder, verifyRazorpayPayment } from "../../services/api";
import Loader from "../../components/frontend/Loader/Loader";

const Payment = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // In a real app, we get cart/order info from state/context
    // For now, retrieving from sessionStorage (common pattern for checkout flow)
    const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo"));

    useEffect(() => {
        if (!orderInfo) {
            // access denied if no order info
            // navigate("/cart"); 
            // Commented out to prevent immediate redirect while testing without flow
        }
    }, [navigate, orderInfo]);

    const handlePayment = async () => {
        try {
            setLoading(true);

            // 1. Get Key
            const key = await getRazorpayKey();

            // 2. Create Order
            const order = await createRazorpayOrder(orderInfo.totalPrice);

            // 3. Open Razorpay Header
            const options = {
                key: key,
                amount: order.amount,
                currency: "INR",
                name: "Matrix Store",
                description: "Order Payment",
                image: "https://example.com/your_logo", // Add logo
                order_id: order.id,
                handler: async function (response) {

                    // 4. Verify Payment on Backend
                    try {
                        const data = await verifyRazorpayPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (data.success) {
                            // 5. Create Order in Database
                            const orderData = {
                                shippingInfo: orderInfo.shippingInfo,
                                orderItems: orderInfo.cartItems,
                                paymentInfo: {
                                    id: response.razorpay_payment_id,
                                    status: "succeeded",
                                },
                                itemsPrice: orderInfo.itemsPrice,
                                taxPrice: orderInfo.taxPrice,
                                shippingPrice: orderInfo.shippingPrice,
                                totalPrice: orderInfo.totalPrice,
                            };

                            // Call Submit Order API
                            await submitOrder(orderData);

                            // Clear Cart (if needed here or inside createOrder logic)

                            toast.success("Payment Successful!");
                            navigate("/order-success");
                        } else {
                            toast.error("Payment Verification Failed");
                        }

                    } catch (error) {
                        toast.error(error.response?.data?.message || "Payment Verification Failed");
                    }
                },
                prefill: {
                    name: "User Name", // Fetch from user
                    email: "user@example.com",
                    contact: "9999999999",
                },
                notes: {
                    address: "Razorpay Corporate Office",
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const razor = new window.Razorpay(options);
            razor.open();
            setLoading(false);

        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.message || "Payment processing failed");
        }
    };

    if (loading) return <Loader />;

    return (
        <Container className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: "60vh" }}>
            <Card className="p-4 shadow-lg text-center" style={{ width: "400px" }}>
                <h3>Payment</h3>
                <p className="mb-4">Complete your order by paying securely.</p>

                <div className="mb-3">
                    <h5>Total Amount: ₹{orderInfo?.totalPrice || 0}</h5>
                </div>

                <Button variant="primary" size="lg" onClick={handlePayment}>
                    Pay Now
                </Button>
            </Card>
        </Container>
    );
};

export default Payment;
