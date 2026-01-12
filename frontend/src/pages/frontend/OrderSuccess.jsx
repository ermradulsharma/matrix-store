import React from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { CheckCircle } from 'react-bootstrap-icons';
import { Link, useLocation } from 'react-router-dom';

const OrderSuccess = () => {
    const location = useLocation();
    const { orderId } = location.state || {};

    return (
        <Container className="my-5 text-center" style={{ maxWidth: '600px' }}>
            <Card>
                <Card.Body>
                    <CheckCircle size={80} className="text-success mb-3" />
                    <h2>Order Placed Successfully!</h2>
                    <p className="text-muted">Thank you for your purchase</p>
                    {orderId && (
                        <Alert variant="success" className="mt-3">
                            Order ID: #{orderId}
                        </Alert>
                    )}
                    <p className="mt-4">
                        Your order has been received and is being processed. You will receive a confirmation email shortly.
                    </p>
                    <div className="mt-4">
                        <Link to="/shop">
                            <Button variant="primary" className="me-2">
                                Continue Shopping
                            </Button>
                        </Link>
                        <Link to="/">
                            <Button variant="outline-secondary">
                                Go to Home
                            </Button>
                        </Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default OrderSuccess;
