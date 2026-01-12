import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, Headset, CreditCard } from "react-bootstrap-icons";
import ProductCard from "../../components/frontend/ProductCard/ProductCard";
import Loader from "../../components/frontend/Loader/Loader";
import "../../styles/pages/Home.css";

function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch featured products
                const productsResponse = await fetch('https://dummyjson.com/products?limit=8');
                const productsData = await productsResponse.json();
                setFeaturedProducts(productsData.products || []);

                // Fetch categories
                const categoriesResponse = await fetch('https://dummyjson.com/products/categories');
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData.slice(0, 6));
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="hero-content">
                            <div className="hero-badge">New Collection 2024</div>
                            <h1 className="hero-title">
                                Discover Amazing Products at Great Prices
                            </h1>
                            <p className="hero-description">
                                Shop from our curated collection of premium products. Quality guaranteed,
                                delivered to your doorstep with care.
                            </p>
                            <div className="hero-buttons">
                                <Button as={Link} to="/shop" variant="primary" size="lg" className="hero-btn-primary">
                                    Shop Now
                                    <ArrowRight className="ms-2" size={20} />
                                </Button>
                                <Button as={Link} to="/about" variant="outline-light" size="lg" className="hero-btn-secondary">
                                    Learn More
                                </Button>
                            </div>
                        </Col>
                        <Col lg={6} className="hero-image-col">
                            <div className="hero-image">
                                <img
                                    src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800"
                                    alt="Hero"
                                    className="img-fluid"
                                />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <Container>
                    <Row className="g-4">
                        <Col md={6} lg={3}>
                            <div className="feature-box">
                                <div className="feature-icon">
                                    <Truck size={32} />
                                </div>
                                <h5>Free Shipping</h5>
                                <p>On orders over $50</p>
                            </div>
                        </Col>
                        <Col md={6} lg={3}>
                            <div className="feature-box">
                                <div className="feature-icon">
                                    <ShieldCheck size={32} />
                                </div>
                                <h5>Secure Payment</h5>
                                <p>100% protected payment</p>
                            </div>
                        </Col>
                        <Col md={6} lg={3}>
                            <div className="feature-box">
                                <div className="feature-icon">
                                    <Headset size={32} />
                                </div>
                                <h5>24/7 Support</h5>
                                <p>Dedicated customer service</p>
                            </div>
                        </Col>
                        <Col md={6} lg={3}>
                            <div className="feature-box">
                                <div className="feature-icon">
                                    <CreditCard size={32} />
                                </div>
                                <h5>Easy Returns</h5>
                                <p>30-day return policy</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <Container>
                    <div className="section-header">
                        <h2>Shop by Category</h2>
                        <p>Explore our wide range of product categories</p>
                    </div>
                    <Row className="g-4">
                        {categories.map((category, idx) => (
                            <Col key={idx} xs={6} md={4} lg={2}>
                                <Link to={`/shop?category=${category.slug || category}`} className="category-card">
                                    <div className="category-icon">
                                        {(category.name || category).charAt(0).toUpperCase()}
                                    </div>
                                    <h6>{category.name || category}</h6>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Featured Products Section */}
            <section className="featured-products-section">
                <Container>
                    <div className="section-header">
                        <h2>Featured Products</h2>
                        <p>Check out our handpicked selection of amazing products</p>
                    </div>
                    {loading ? (
                        <Loader />
                    ) : (
                        <>
                            <Row className="g-4">
                                {featuredProducts.map((product) => (
                                    <Col key={product.id} xs={12} sm={6} md={4} lg={3}>
                                        <ProductCard product={product} />
                                    </Col>
                                ))}
                            </Row>
                            <div className="text-center mt-5">
                                <Button as={Link} to="/shop" variant="primary" size="lg" className="view-all-btn">
                                    View All Products
                                    <ArrowRight className="ms-2" />
                                </Button>
                            </div>
                        </>
                    )}
                </Container>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <Container>
                    <Row className="text-center">
                        <Col md={3} sm={6} className="mb-4 mb-md-0">
                            <div className="stat-item">
                                <h3>10K+</h3>
                                <p>Happy Customers</p>
                            </div>
                        </Col>
                        <Col md={3} sm={6} className="mb-4 mb-md-0">
                            <div className="stat-item">
                                <h3>5000+</h3>
                                <p>Products</p>
                            </div>
                        </Col>
                        <Col md={3} sm={6} className="mb-4 mb-md-0">
                            <div className="stat-item">
                                <h3>99%</h3>
                                <p>Satisfaction Rate</p>
                            </div>
                        </Col>
                        <Col md={3} sm={6}>
                            <div className="stat-item">
                                <h3>24/7</h3>
                                <p>Support Available</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={8}>
                            <h2>Ready to Start Shopping?</h2>
                            <p>Join thousands of satisfied customers and discover amazing deals today!</p>
                        </Col>
                        <Col lg={4} className="text-lg-end">
                            <Button as={Link} to="/shop" variant="light" size="lg" className="cta-btn">
                                Browse Products
                                <ArrowRight className="ms-2" />
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
}

export default Home;
