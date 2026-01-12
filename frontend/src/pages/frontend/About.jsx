import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Award, Bullseye, Eye, Heart } from 'react-bootstrap-icons';
import '../../styles/pages/About.css';

function About() {
    return (
        <div className="about-page">
            <div className="about-header">
                <Container>
                    <h1 className="text-center mb-2">About Matrix Store</h1>
                    <p className="text-center mb-0">Your trusted online shopping destination</p>
                </Container>
            </div>

            <Container className="my-5">
                <Row className="mb-5">
                    <Col lg={6} className="mb-4">
                        <h2>Our Story</h2>
                        <p className="text-muted">
                            Founded in 2020, Matrix Store has grown to become one of the leading e-commerce platforms,
                            offering a wide range of quality products at competitive prices. We believe in making online
                            shopping easy, secure, and enjoyable for everyone.
                        </p>
                        <p className="text-muted">
                            With over 5000+ products and 10,000+ satisfied customers, we continue to expand our catalog
                            and improve our services to meet your needs.
                        </p>
                    </Col>
                    <Col lg={6} className="mb-4">
                        <Card className="about-stats-card">
                            <Card.Body>
                                <Row className="text-center">
                                    <Col xs={6} className="mb-3">
                                        <h3 className="text-primary">10K+</h3>
                                        <p className="text-muted">Happy Customers</p>
                                    </Col>
                                    <Col xs={6} className="mb-3">
                                        <h3 className="text-primary">5000+</h3>
                                        <p className="text-muted">Products</p>
                                    </Col>
                                    <Col xs={6}>
                                        <h3 className="text-primary">99%</h3>
                                        <p className="text-muted">Satisfaction Rate</p>
                                    </Col>
                                    <Col xs={6}>
                                        <h3 className="text-primary">24/7</h3>
                                        <p className="text-muted">Customer Support</p>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <h2 className="text-center mb-5">Our Values</h2>
                <Row className="g-4 mb-5">
                    <Col md={6} lg={3}>
                        <Card className="value-card text-center h-100">
                            <Card.Body>
                                <Award size={50} className="text-primary mb-3" />
                                <h5>Quality First</h5>
                                <p className="text-muted">We ensure every product meets our high quality standards</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className="value-card text-center h-100">
                            <Card.Body>
                                <Heart size={50} className="text-danger mb-3" />
                                <h5>Customer Focus</h5>
                                <p className="text-muted">Your satisfaction is our top priority</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className="value-card text-center h-100">
                            <Card.Body>
                                <Bullseye size={50} className="text-success mb-3" />
                                <h5>Innovation</h5>
                                <p className="text-muted">Constantly improving our platform and services</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className="value-card text-center h-100">
                            <Card.Body>
                                <Eye size={50} className="text-info mb-3" />
                                <h5>Transparency</h5>
                                <p className="text-muted">Honest pricing and clear communication</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default About;
