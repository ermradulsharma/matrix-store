import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';

const UpdateProfile = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        mobile: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getUserProfile();
            const user = res.user;
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                mobile: user.mobile_no || ''
            });
        } catch (error) {
            setError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const res = await updateUserProfile(formData);
            if (res.success) {
                setSuccess("Profile updated successfully");
                // Optional: update context user if name changed
                setTimeout(() => navigate(-1), 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Update failed");
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <Container fluid>
            <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
                    <h4>Update Profile</h4>
                    <Button variant="danger" className="d-flex align-items-center gap-1" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> Back
                    </Button>
                </Card.Header>
                <Card.Body className="p-4">
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

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
                            <Col md={12} className="mb-4">
                                <Form.Group>
                                    <Form.Label>Mobile Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12} className="mb-4">
                                <Form.Group>
                                    <Form.Label>Profile Image</Form.Label>
                                    <Form.Control
                                        type="file"
                                        name="profile_image"
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" className="d-flex align-items-center gap-1" onClick={() => navigate(-1)}>
                                <FaTimes className="me-1" /> Cancel
                            </Button>
                            <Button variant="primary" type="submit" className="d-flex align-items-center gap-1">
                                <FaSave className="me-1" /> Save Changes
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default UpdateProfile;
