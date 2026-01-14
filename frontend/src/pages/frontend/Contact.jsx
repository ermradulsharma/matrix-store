import React from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Envelope, Phone, GeoAlt, Clock } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import '../../styles/pages/Contact.css';

function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you for your message! We will get back to you soon.');
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <Container>
          <h1 className="text-center mb-2">Contact Us</h1>
          <p className="text-center mb-0">We'd love to hear from you</p>
        </Container>
      </div>

      <Container className="my-5">
        <Row className="g-4">
          <Col lg={4}>
            <Card className="contact-info-card h-100">
              <Card.Body>
                <div className="contact-info-item">
                  <GeoAlt size={30} className="text-primary mb-3" />
                  <h5>Address</h5>
                  <p className="text-muted">123 E-commerce Street<br />New York, NY 10001</p>
                </div>
                <hr />
                <div className="contact-info-item">
                  <Phone size={30} className="text-primary mb-3" />
                  <h5>Phone</h5>
                  <p className="text-muted">+1 (555) 123-4567</p>
                </div>
                <hr />
                <div className="contact-info-item">
                  <Envelope size={30} className="text-primary mb-3" />
                  <h5>Email</h5>
                  <p className="text-muted">support@matrixstore.com</p>
                </div>
                <hr />
                <div className="contact-info-item">
                  <Clock size={30} className="text-primary mb-3" />
                  <h5>Business Hours</h5>
                  <p className="text-muted">Mon - Fri: 9:00 AM - 6:00 PM<br />Sat - Sun: 10:00 AM - 4:00 PM</p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="contact-form-card">
              <Card.Body>
                <h3 className="mb-4">Send us a Message</h3>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>First Name *</Form.Label>
                        <Form.Control type="text" placeholder="Enter your first name" required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Last Name *</Form.Label>
                        <Form.Control type="text" placeholder="Enter your last name" required />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control type="email" placeholder="Enter your email" required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control type="tel" placeholder="Enter your phone number" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Subject *</Form.Label>
                    <Form.Control type="text" placeholder="Enter subject" required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Message *</Form.Label>
                    <Form.Control as="textarea" rows={5} placeholder="Enter your message" required />
                  </Form.Group>
                  <Button variant="primary" type="submit" size="lg" className="w-100">
                    Send Message
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Contact;
