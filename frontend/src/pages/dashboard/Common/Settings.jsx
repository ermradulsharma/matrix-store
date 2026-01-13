import React from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';

const Settings = () => {
    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4">Settings</h2>
            <Row>
                <Col md={12}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white">
                            <h5 className="mb-0">General Settings</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3" controlId="notifications">
                                    <Form.Check
                                        type="switch"
                                        id="email-notifications"
                                        label="Email Notifications"
                                        defaultChecked
                                    />
                                    <Form.Text className="text-muted">
                                        Receive email updates about your account activity.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="sms-notifications">
                                    <Form.Check
                                        type="switch"
                                        id="sms-notifications"
                                        label="SMS Notifications"
                                    />
                                    <Form.Text className="text-muted">
                                        Receive SMS alerts for important events.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="darkMode">
                                    <Form.Check
                                        type="switch"
                                        id="dark-mode"
                                        label="Dark Mode"
                                    />
                                    <Form.Text className="text-muted">
                                        Toggle dark mode for the dashboard interface.
                                    </Form.Text>
                                </Form.Group>

                                <Button variant="primary" type="submit">
                                    Save Changes
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Settings;
