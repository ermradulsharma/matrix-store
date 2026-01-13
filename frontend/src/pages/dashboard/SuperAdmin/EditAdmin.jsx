import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUserDetails, updateUserAdmin } from '../../../services/api';
import { FaUserEdit, FaArrowLeft } from 'react-icons/fa';

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
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadAdminDetails();
    }, [id]);

    const loadAdminDetails = async () => {
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
            setError("Failed to load admin details");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await updateUserAdmin(id, formData);
            if (res.data.success) {
                setSuccess("Admin details updated successfully!");
                setTimeout(() => navigate('/admins'), 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update admin");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex align-items-center mb-4">
                <Button variant="link" className="text-decoration-none me-2" onClick={() => navigate('/admins')}>
                    <FaArrowLeft /> Back
                </Button>
                <h2 className="mb-0">Edit Admin</h2>
            </div>

            <div className="row justify-content-center">
                <div className="col-md-8">
                    <Card className="shadow-sm">
                        <Card.Body className="p-4">
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
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
                                    </div>
                                    <div className="col-md-6 mb-3">
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
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
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
                                    </div>
                                    <div className="col-md-6 mb-3">
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
                                    </div>
                                </div>

                                <div className="mb-4">
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
                                </div>

                                <div className="d-flex justify-content-end gap-2">
                                    <Button variant="secondary" onClick={() => navigate('/admins')}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit" disabled={updating}>
                                        {updating ? <Spinner as="span" animation="border" size="sm" /> : <><FaUserEdit className="me-2" /> Update Admin</>}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EditAdmin;
