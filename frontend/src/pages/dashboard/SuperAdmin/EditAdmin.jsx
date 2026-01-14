import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUserDetails, updateUserAdmin } from '../../../services/api';
import { FaUserEdit, FaArrowLeft, FaTimes } from 'react-icons/fa';

import { toast } from 'react-toastify';

const EditAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        mobile_no: '',
        password: ''
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const loadAdminDetails = useCallback(async () => {
        try {
            const user = await fetchUserDetails(id);
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                mobile_no: user.mobile_no || '',
                password: '' // Don't pre-fill password
            });
        } catch (err) {
            toast.error("Failed to load admin details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadAdminDetails();
    }, [loadAdminDetails]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const res = await updateUserAdmin(id, formData);
            if (res.data.success) {
                toast.success("Admin details updated successfully!");
                setTimeout(() => navigate(-1), 1500);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update admin");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <Container fluid>
            <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h4 className="fw-bold text-dark mb-0">Edit Admin</h4>
                    <Button variant="danger" className="d-flex align-items-center gap-1" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> Back
                    </Button>
                </Card.Header>
                <Card.Body className="p-4">


                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Mobile Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="mobile_no"
                                        value={formData.mobile_no}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12} className="mb-3">
                                <Form.Group>
                                    <Form.Label>New Password <small className="text-muted">(Leave blank to keep unchanged)</small></Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        minLength={6}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2 mt-2">
                            <Button variant="secondary" className="d-flex align-items-center gap-1" onClick={() => navigate(-1)}>
                                <FaTimes className="me-1" /> Cancel
                            </Button>
                            <Button variant="primary" type="submit" className="d-flex align-items-center gap-1" disabled={updating}>
                                {updating ? <Spinner as="span" animation="border" size="sm" /> : <><FaUserEdit className="me-1" /> Update Admin</>}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EditAdmin;
