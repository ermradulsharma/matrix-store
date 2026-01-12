import React from 'react';
import { Container, Card } from 'react-bootstrap';
import '../../styles/pages/TermsCondition.css';

function TermsCondition() {
    return (
        <div className="terms-page">
            <div className="terms-header">
                <Container>
                    <h1 className="text-center mb-2">Terms & Conditions</h1>
                    <p className="text-center mb-0">Last updated: {new Date().toLocaleDateString()}</p>
                </Container>
            </div>

            <Container className="my-5">
                <Card className="terms-card">
                    <Card.Body>
                        <section className="mb-4">
                            <h3>1. Agreement to Terms</h3>
                            <p>
                                By accessing and using Matrix Store, you agree to be bound by these Terms and Conditions.
                                If you disagree with any part of these terms, you may not access our services.
                            </p>
                        </section>

                        <section className="mb-4">
                            <h3>2. User Accounts</h3>
                            <p>When you create an account with us, you must provide accurate and complete information. You are responsible for:</p>
                            <ul>
                                <li>Maintaining the confidentiality of your account and password</li>
                                <li>Restricting access to your computer and account</li>
                                <li>All activities that occur under your account</li>
                                <li>Notifying us immediately of any unauthorized access</li>
                            </ul>
                        </section>

                        <section className="mb-4">
                            <h3>3. Products and Services</h3>
                            <ul>
                                <li>All product descriptions, prices, and availability are subject to change without notice</li>
                                <li>We reserve the right to limit quantities purchased</li>
                                <li>Product images are for illustration purposes and may differ from actual products</li>
                                <li>We strive to display accurate colors, but cannot guarantee exact matches</li>
                            </ul>
                        </section>

                        <section className="mb-4">
                            <h3>4. Orders and Payment</h3>
                            <p>By placing an order, you agree that:</p>
                            <ul>
                                <li>All prices are in USD unless otherwise stated</li>
                                <li>Payment is due at the time of purchase</li>
                                <li>We reserve the right to refuse or cancel any order</li>
                                <li>You will receive an order confirmation email</li>
                                <li>Orders are subject to product availability</li>
                            </ul>
                        </section>

                        <section className="mb-4">
                            <h3>5. Shipping and Delivery</h3>
                            <ul>
                                <li>Shipping times are estimates and not guarantees</li>
                                <li>We are not responsible for delays caused by shipping carriers</li>
                                <li>Risk of loss passes to you upon delivery to the carrier</li>
                                <li>International orders may be subject to customs fees</li>
                            </ul>
                        </section>

                        <section className="mb-4">
                            <h3>6. Returns and Refunds</h3>
                            <p>Our return policy:</p>
                            <ul>
                                <li>Returns accepted within 30 days of delivery</li>
                                <li>Items must be unused and in original packaging</li>
                                <li>Refunds processed within 5-10 business days</li>
                                <li>Original shipping costs are non-refundable</li>
                                <li>Some items may not be eligible for return</li>
                            </ul>
                        </section>

                        <section className="mb-4">
                            <h3>7. Prohibited Uses</h3>
                            <p>You may not use our site:</p>
                            <ul>
                                <li>For any unlawful purpose</li>
                                <li>To harass, abuse, or harm others</li>
                                <li>To impersonate any person or entity</li>
                                <li>To interfere with or disrupt our services</li>
                                <li>To upload viruses or malicious code</li>
                            </ul>
                        </section>

                        <section className="mb-4">
                            <h3>8. Intellectual Property</h3>
                            <p>
                                All content on this site, including text, graphics, logos, and images, is the property of
                                Matrix Store and protected by copyright laws. You may not reproduce, distribute, or create
                                derivative works without our express written permission.
                            </p>
                        </section>

                        <section className="mb-4">
                            <h3>9. Limitation of Liability</h3>
                            <p>
                                Matrix Store shall not be liable for any indirect, incidental, special, or consequential damages
                                arising from your use of our services. Our total liability shall not exceed the amount paid by
                                you for the product or service.
                            </p>
                        </section>

                        <section className="mb-4">
                            <h3>10. Modifications</h3>
                            <p>
                                We reserve the right to modify these terms at any time. Changes will be effective immediately
                                upon posting. Your continued use of our services constitutes acceptance of the modified terms.
                            </p>
                        </section>

                        <section>
                            <h3>11. Contact Information</h3>
                            <p>For questions about these Terms and Conditions, contact us at:</p>
                            <ul className="list-unstyled">
                                <li><strong>Email:</strong> legal@matrixstore.com</li>
                                <li><strong>Phone:</strong> +1 (555) 123-4567</li>
                                <li><strong>Address:</strong> 123 E-commerce Street, New York, NY 10001</li>
                            </ul>
                        </section>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default TermsCondition;
