import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../../../services/api';
import { FaUserPlus, FaArrowLeft, FaTimes } from 'react-icons/fa';

const CreateAdmin = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        mobile_no: '',
        role: 'admin'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await createUser(formData);
            if (res.data.success) {
                setSuccess("Admin created successfully!");
                setTimeout(() => navigate(-1), 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create admin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid>
            <Card className="border-0 rounded-3 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom">
                    <h4 className="fw-bold text-dark mb-0">Create New Admin</h4>
                    <Button variant="danger" className='d-flex align-items-center gap-1 justify-content-center' onClick={() => navigate(-1)}><FaArrowLeft /> Back </Button>
                </Card.Header>
                <Card.Body className="p-4">
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Mobile Number</Form.Label>
                                    <Form.Control type="text" name="mobile_no" value={formData.mobile_no} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={12} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} />
                                    <Form.Text className="text-muted"> Must be at least 6 characters long. </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" className='d-flex align-items-center gap-1 justify-content-center' onClick={() => navigate(-1)}><FaTimes /> Cancel </Button>
                            <Button variant="primary" type="submit" className='d-flex align-items-center gap-1 justify-content-center' disabled={loading}> {loading ? <Spinner as="span" animation="border" size="sm" /> : <><FaUserPlus /> Create Admin</>} </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CreateAdmin;
