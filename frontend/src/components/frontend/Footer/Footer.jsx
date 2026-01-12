import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BoxSeam, Envelope, Telephone, GeoAlt, Facebook, Twitter, Instagram, Linkedin, Github } from "react-bootstrap-icons";
import "../../../styles/components/Footer.css";

function Footer() {
  return (
    <footer className="modern-footer">
      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h3 className="newsletter-title">Subscribe to Our Newsletter</h3>
              <p className="newsletter-text">Get the latest updates on new products and upcoming sales</p>
            </Col>
            <Col lg={6}>
              <Form className="newsletter-form">
                <div className="newsletter-input-group">
                  <Envelope className="input-icon" size={20} />
                  <Form.Control
                    type="email"
                    placeholder="Enter your email address"
                    className="newsletter-input"
                  />
                  <Button variant="primary" className="subscribe-btn">
                    Subscribe
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        <Container>
          <Row className="g-4">
            {/* About Section */}
            <Col lg={4} md={6}>
              <div className="footer-section">
                <div className="footer-brand">
                  <BoxSeam size={32} className="brand-icon" />
                  <h3>Matrix Store</h3>
                </div>
                <p className="footer-description">
                  Your trusted online shopping destination. We offer a wide range of quality products
                  at competitive prices with excellent customer service.
                </p>
                <div className="social-links">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                    <Facebook size={20} />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                    <Twitter size={20} />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                    <Instagram size={20} />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                    <Linkedin size={20} />
                  </a>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                    <Github size={20} />
                  </a>
                </div>
              </div>
            </Col>

            {/* Quick Links */}
            <Col lg={2} md={6} sm={6}>
              <div className="footer-section">
                <h5 className="footer-heading">Quick Links</h5>
                <ul className="footer-links">
                  <li><Link to="/shop">Shop</Link></li>
                  <li><Link to="/about">About Us</Link></li>
                  <li><Link to="/services">Services</Link></li>
                  <li><Link to="/contact">Contact</Link></li>
                  <li><Link to="/faq">FAQ</Link></li>
                </ul>
              </div>
            </Col>

            {/* Customer Service */}
            <Col lg={2} md={6} sm={6}>
              <div className="footer-section">
                <h5 className="footer-heading">Customer Service</h5>
                <ul className="footer-links">
                  <li><Link to="/cart">My Cart</Link></li>
                  <li><Link to="/wishlist">Wishlist</Link></li>
                  <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                  <li><Link to="/terms-condition">Terms & Conditions</Link></li>
                  <li><Link to="/login">Login</Link></li>
                </ul>
              </div>
            </Col>

            {/* Contact Info */}
            <Col lg={4} md={6}>
              <div className="footer-section">
                <h5 className="footer-heading">Contact Us</h5>
                <ul className="contact-info">
                  <li>
                    <GeoAlt className="contact-icon" size={18} />
                    <span>123 E-commerce Street<br />New York, NY 10001</span>
                  </li>
                  <li>
                    <Telephone className="contact-icon" size={18} />
                    <a href="tel:+15551234567">+1 (555) 123-4567</a>
                  </li>
                  <li>
                    <Envelope className="contact-icon" size={18} />
                    <a href="mailto:info@matrixstore.com">info@matrixstore.com</a>
                  </li>
                </ul>
                <div className="business-hours">
                  <p className="mb-1"><strong>Business Hours:</strong></p>
                  <p className="mb-0">Mon - Fri: 9:00 AM - 6:00 PM</p>
                  <p className="mb-0">Sat - Sun: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
              <p className="mb-0">
                &copy; {new Date().getFullYear()} Matrix Store. All Rights Reserved.
              </p>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <div className="payment-methods">
                <span className="payment-text">We Accept:</span>
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="payment-icon" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="payment-icon" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="payment-icon" />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
}

export default Footer;
