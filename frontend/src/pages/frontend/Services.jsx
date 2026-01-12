import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Truck, Shield, Headset, CreditCard, Award, Clock } from 'react-bootstrap-icons';
import '../../styles/pages/Services.css';

function Services() {
    const services = [
        {
            icon: <Truck size={50} />,
            title: "Free Shipping",
            description: "Enjoy free shipping on all orders over $50. Fast and reliable delivery to your doorstep."
        },
        {
            icon: <Shield size={50} />,
            title: "Secure Payments",
            description: "Your payments are 100% secure with SSL encryption and trusted payment gateways."
        },
        {
            icon: <Headset size={50} />,
            title: "24/7 Support",
            description: "Our customer support team is available around the clock to assist you with any questions."
        },
        {
            icon: <CreditCard size={50} />,
            title: "Easy Returns",
            description: "30-day hassle-free returns on most items. Customer satisfaction is our priority."
        },
        {
            icon: <Award size={50} />,
            title: "Quality Guarantee",
            description: "All our products come with a quality guarantee and manufacturer warranty."
        },
        {
            icon: <Clock size={50} />,
            title: "Fast Processing",
            description: "Orders are processed within 24 hours for quick delivery to your location."
        }
    ];

    return (
        <div className="services-page">
            <div className="services-header">
                <Container>
                    <h1 className="text-center mb-2">Our Services</h1>
                    <p className="text-center mb-0">We're committed to providing the best shopping experience</p>
                </Container>
            </div>

            <Container className="my-5">
                <Row className="g-4">
                    {services.map((service, index) => (
                        <Col key={index} md={6} lg={4}>
                            <Card className="service-card h-100 text-center">
                                <Card.Body>
                                    <div className="service-icon text-primary mb-3">
                                        {service.icon}
                                    </div>
                                    <h4>{service.title}</h4>
                                    <p className="text-muted">{service.description}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <div className="services-extra mt-5">
                    <Card className="bg-gradient-primary text-white">
                        <Card.Body className="p-5 text-center">
                            <h2 className="mb-3">Why Choose Matrix Store?</h2>
                            <Row className="mt-4">
                                <Col md={4}>
                                    <h3>10K+</h3>
                                    <p>Happy Customers</p>
                                </Col>
                                <Col md={4}>
                                    <h3>5000+</h3>
                                    <p>Products Available</p>
                                </Col>
                                <Col md={4}>
                                    <h3>99%</h3>
                                    <p>Customer Satisfaction</p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        </div>
    );
}

export default Services;
