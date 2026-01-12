import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../../../services/api';

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
    // const { setUser } = useAuth(); // Update context too if possible (Currently unused)

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
                setTimeout(() => navigate('/dashboard/profile'), 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Update failed");
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid p-4">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white">
                            <h4 className="mb-0">Update Profile</h4>
                        </Card.Header>
                        <Card.Body>
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

                                <Form.Group className="mb-4">
                                    <Form.Label>Mobile Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <div className="d-flex justify-content-between">
                                    <Button variant="secondary" onClick={() => navigate('/dashboard/profile')}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit">
                                        Save Changes
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

export default UpdateProfile;
