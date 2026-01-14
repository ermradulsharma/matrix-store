import React, { useContext, useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
// submitOrder removed
import { toast } from 'react-toastify';
import '../../styles/pages/Checkout.css';

const Checkout = () => {
    const { cartItems, cartTotal } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        email: user?.email || '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        phoneNo: '', // Added new fields to match handleSubmit usage
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Basic validation
        if (!formData.fullName || !formData.email || !formData.address || !formData.city) {
            toast.error('Please fill in all required fields');
            setLoading(false);
            return;
        }

        // Calculate totals
        const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const shippingPrice = itemsPrice > 100 ? 0 : 10; // Simple logic
        const taxPrice = itemsPrice * 0.05; // 5% tax
        const totalPrice = itemsPrice + shippingPrice + taxPrice;

        const orderInfo = {
            shippingInfo: {
                address: formData.address,
                city: formData.city,
                state: formData.state || 'State', // Add state if missing
                country: formData.country || 'India',
                pinCode: formData.zipCode,
                phoneNo: formData.phoneNo || '9999999999',
            },
            cartItems: cartItems.map(item => ({
                product: item.product._id, // Ensure product ID is preserved
                name: item.title,
                price: item.price,
                image: item.image,
                quantity: item.quantity,
            })),
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        };

        sessionStorage.setItem("orderInfo", JSON.stringify(orderInfo));
        navigate("/payment");
    };

    if (cartItems.length === 0) {
        return (
            <Container className="my-5 text-center">
                <h2>Your cart is empty</h2>
                <Button variant="primary" onClick={() => navigate('/shop')}>
                    Go to Shop
                </Button>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <h1 className="mb-4">Checkout</h1>
            <Row>
                <Col lg={8}>
                    <Card className="mb-3">
                        <Card.Body>
                            <h4>Shipping Information</h4>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Full Name *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email *</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Address *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>City *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>ZIP Code</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="zipCode"
                                                value={formData.zipCode}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Payment Information Removed - Handled in Payment Page */}
                                <Button variant="primary" type="submit" className="w-100 mt-3" disabled={loading}>
                                    Proceed to Payment
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card>
                        <Card.Body>
                            <h4>Order Summary</h4>
                            <hr />
                            {cartItems.map((item) => (
                                <div key={item.id} className="d-flex justify-content-between mb-2">
                                    <span>{item.title.substring(0, 20)}... x{item.quantity}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <hr />
                            <div className="d-flex justify-content-between mb-2">
                                <strong>Total:</strong>
                                <strong>${cartTotal.toFixed(2)}</strong>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Checkout;
