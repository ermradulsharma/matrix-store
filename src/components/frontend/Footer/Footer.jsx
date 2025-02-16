import React from "react";
import { Button, Col, Container, Form, Image, ListGroup, Row, Stack } from "react-bootstrap";
import logo from "../../../logo.svg";
import "../../../assets/css/style.css";

function Footer() {
  return (
    <>
    <footer className="bg-dark text-light p-lg-5 py-5">
      <Container>
        <Row className="mx-auto">
            <Col md={3}>
                <Image src={logo} alt="Logo" width={100} height={100} className="App-logo" />
                <h1>{"Matrix"}</h1>
                <p>{"We are committed to delivering the best products and services to our customers. Quality and satisfaction are our top priorities."}</p>
            </Col>
            <Col md={3}>
                <h1>{"Quick Links"}</h1>
                <ListGroup as="ul" variant="flush" className="mx-auto">
                    <ListGroup.Item as="li" action href="/about">{"About"}</ListGroup.Item>
                    <ListGroup.Item as="li" action href="/services">{"Services"}</ListGroup.Item>
                    <ListGroup.Item as="li" action href="/contact">{"Contact"}</ListGroup.Item>
                    <ListGroup.Item as="li" action href="/faq">{"FAQ"}</ListGroup.Item>
                    <ListGroup.Item as="li" action href="/terms-condition">{"Terms & Conditions"}</ListGroup.Item>
                    <ListGroup.Item as="li" action href="/privacy-policy">{"Privacy Policy"}</ListGroup.Item>
                </ListGroup>
            </Col>
            <Col md={3} className="contact-details">
                <h1>{"Contact Us"}</h1>
                <p>{"Email: "}<a href="mailto:info@matrix.com" className="text-light">info@matrix.com</a></p>
                <p>Phone: +1 234 567 890</p>
                <p>Address: 123 Main Street, City, Country</p>
            </Col>
            <Col md={3} className="contact-details">
                <h1>{"Newsletter"}</h1>
                <p>{ 'We denounce with righteous and in and dislike men who are so beguiled and demo realized.' }</p>
                <Stack direction="horizontal" gap={3} className="mt-5">
                    <Form.Control type="email" placeholder="name@example.com" />
                    <Button variant="primary">Submit</Button>
                </Stack>
            </Col>
        </Row>
      </Container>
    </footer>
      <div className="text-center p-2">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} { 'Matrix' }. All Rights Reserved.
          </p>
        </div>
    </>
  );
}

export default Footer;
