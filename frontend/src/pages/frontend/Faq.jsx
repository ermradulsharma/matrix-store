import React from 'react';
import { Container, Accordion, Card } from 'react-bootstrap';
import { QuestionCircle } from 'react-bootstrap-icons';
import '../../styles/pages/Faq.css';

function Faq() {
    const faqs = [
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay for your convenience."
        },
        {
            question: "How long does shipping take?",
            answer: "Standard shipping typically takes 5-7 business days. Express shipping is available and takes 2-3 business days. International shipping times vary by location."
        },
        {
            question: "What is your return policy?",
            answer: "We offer a 30-day return policy for most items. Products must be in original condition with tags attached. Some exclusions apply. Please contact customer service for more details."
        },
        {
            question: "Do you ship internationally?",
            answer: "Yes! We ship to over 100 countries worldwide. Shipping costs and delivery times vary by destination."
        },
        {
            question: "How can I track my order?",
            answer: "Once your order ships, you'll receive a tracking number via email. You can also check your order status in your account dashboard."
        },
        {
            question: "Can I cancel or modify my order?",
            answer: "You can cancel or modify your order within 24 hours of placement. After that, orders are processed and cannot be changed. Contact us immediately if you need assistance."
        },
        {
            question: "Are products covered under warranty?",
            answer: "Most products come with a manufacturer's warranty. Warranty periods vary by product. Check individual product pages for specific warranty information."
        },
        {
            question: "How do I create an account?",
            answer: "Click on 'Login' in the navigation menu, then select 'Register'. Fill in your details to create a new account. You can also check out as a guest without creating an account."
        },
        {
            question: "Is my personal information secure?",
            answer: "Absolutely! We use industry-standard SSL encryption to protect your personal and payment information. We never share your data with third parties without your consent."
        },
        {
            question: "What if I receive a damaged item?",
            answer: "If you receive a damaged item, please contact us within 48 hours with photos of the damage. We'll arrange for a replacement or full refund immediately."
        }
    ];

    return (
        <div className="faq-page">
            <div className="faq-header">
                <Container>
                    <QuestionCircle size={60} className="mb-3" />
                    <h1 className="text-center mb-2">Frequently Asked Questions</h1>
                    <p className="text-center mb-0">Find answers to common questions</p>
                </Container>
            </div>

            <Container className="my-5">
                <Card className="faq-card">
                    <Card.Body>
                        <Accordion defaultActiveKey="0">
                            {faqs.map((faq, index) => (
                                <Accordion.Item eventKey={index.toString()} key={index}>
                                    <Accordion.Header>{faq.question}</Accordion.Header>
                                    <Accordion.Body>{faq.answer}</Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    </Card.Body>
                </Card>

                <div className="text-center mt-5">
                    <h4>Still have questions?</h4>
                    <p className="text-muted">Can't find the answer you're looking for? Please contact our customer support team.</p>
                    <a href="/contact" className="btn btn-primary btn-lg">Contact Support</a>
                </div>
            </Container>
        </div>
    );
}

export default Faq;
