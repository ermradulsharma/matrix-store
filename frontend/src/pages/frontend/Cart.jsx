import React, { useContext } from 'react';
import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { Trash } from 'react-bootstrap-icons';
import '../../styles/pages/Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useContext(CartContext);
    const navigate = useNavigate();

    const handleQuantityChange = (id, newQty) => {
        if (newQty > 0) {
            updateQuantity(id, newQty);
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <Container className="my-5 text-center">
                <h2>Your cart is empty</h2>
                <p>Add some products to get started!</p>
                <Link to="/shop">
                    <Button variant="primary">Continue Shopping</Button>
                </Link>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <h1 className="mb-4">Shopping Cart</h1>
            <Row>
                <Col lg={8}>
                    {cartItems.map((item) => (
                        <Card key={item.id} className="mb-3">
                            <Card.Body>
                                <Row className="align-items-center">
                                    <Col xs={3} md={2}>
                                        <img
                                            src={item.thumbnail || item.image}
                                            alt={item.title}
                                            style={{ width: '100%', objectFit: 'contain' }}
                                        />
                                    </Col>
                                    <Col xs={5} md={4}>
                                        <h6>{item.title}</h6>
                                        <p className="text-muted mb-0">${item.price?.toFixed(2)}</p>
                                    </Col>
                                    <Col xs={4} md={3}>
                                        <Form.Group>
                                            <Form.Label>Qty:</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                                style={{ width: '80px' }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={6} md={2} className="text-end">
                                        <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                                    </Col>
                                    <Col xs={6} md={1} className="text-end">
                                        <Button variant="danger" size="sm" onClick={() => removeFromCart(item.id)}>
                                            <Trash />
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ))}
                    <Button variant="outline-danger" onClick={clearCart}>
                        Clear Cart
                    </Button>
                </Col>
                <Col lg={4}>
                    <Card>
                        <Card.Body>
                            <h4>Order Summary</h4>
                            <hr />
                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <strong>${cartTotal.toFixed(2)}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Shipping:</span>
                                <span>Free</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-3">
                                <strong>Total:</strong>
                                <strong>${cartTotal.toFixed(2)}</strong>
                            </div>
                            <Button variant="primary" className="w-100" onClick={handleCheckout}>
                                Proceed to Checkout
                            </Button>
                            <Link to="/shop">
                                <Button variant="outline-secondary" className="w-100 mt-2">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Cart;
