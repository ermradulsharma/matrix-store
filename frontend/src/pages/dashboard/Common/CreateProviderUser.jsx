import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Spinner } from 'react-bootstrap';
import { createUser, fetchUsers } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';

import { toast } from 'react-toastify';

const CreateProviderUser = () => {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const isAdmin = authUser?.role === 'admin' || authUser?.role === 'super_admin';

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        mobile_no: '',
        role: 'provider',
        managedBy: ''
    });

    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            loadManagers();
        }
    }, [isAdmin]);

    const loadManagers = async () => {
        try {
            const res = await fetchUsers(); // This fetches based on hierarchy, but Admin sees Managers
            if (res.data.success) {
                // Filter users to get only managers
                const mgrs = res.data.users.filter(u => u.role === 'manager');
                setManagers(mgrs);
            }
        } catch (err) {
            console.error("Failed to load managers", err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: file, imagePreview: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const myForm = new FormData();
        myForm.set("first_name", formData.first_name);
        myForm.set("last_name", formData.last_name);
        myForm.set("email", formData.email);
        myForm.set("password", formData.password);
        myForm.set("mobile_no", formData.mobile_no);
        myForm.set("role", formData.role);
        if (formData.managedBy) myForm.set("managedBy", formData.managedBy);
        if (formData.image) myForm.set("image", formData.image);

        try {
            const res = await createUser(myForm);
            if (res.data.success) {
                toast.success("Provider User created successfully!");
                // Redirect to provider list or provider profile creation?
                // The task says "Admin add manager and Provider... as well as Manager add providers"
                // Usually this means adding the USER account.
                // After this, they might need to complete the profile.
                setTimeout(() => navigate('..'), 1500);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create provider user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex align-items-center mb-4">
                <Button variant="link" className="text-decoration-none me-2 p-0" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </Button>
                <h2 className="mb-0">Create New Provider User</h2>
            </div>

            <div className="row justify-content-center">
                <div className="col-md-8">
                    <Card className="shadow-sm">
                        <Card.Body className="p-4">


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

                                <div className="mb-3">
                                    <Form.Label>Profile Image</Form.Label>
                                    <div className="d-flex align-items-center gap-3">
                                        {formData.imagePreview && (
                                            <img
                                                src={formData.imagePreview}
                                                alt="Preview"
                                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }}
                                            />
                                        )}
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Assign to Manager <small className="text-muted">(Optional, defaults to you)</small></Form.Label>
                                            <Form.Select name="managedBy" value={formData.managedBy} onChange={handleChange}>
                                                <option value="">-- Select Manager --</option>
                                                {managers.map(mgr => (
                                                    <option key={mgr._id} value={mgr._id}>
                                                        {mgr.first_name} {mgr.last_name} ({mgr.email})
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <Form.Group>
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength={6}
                                        />
                                    </Form.Group>
                                </div>

                                <div className="d-flex justify-content-end">
                                    <Button variant="secondary" className="me-2" onClick={() => navigate('..')}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit" disabled={loading}>
                                        {loading ? <Spinner as="span" animation="border" size="sm" /> : <><FaUserPlus className="me-2" /> Create User</>}
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

export default CreateProviderUser;
