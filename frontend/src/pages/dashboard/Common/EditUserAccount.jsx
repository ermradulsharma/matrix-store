import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUserDetails, updateUserAdmin } from '../../../services/api';
import { FaUserEdit, FaArrowLeft } from 'react-icons/fa';

import { toast } from 'react-toastify';

const EditUserAccount = ({ redirectPath, title }) => {
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

    useEffect(() => {
        loadUserDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadUserDetails = async () => {
        try {
            const user = await fetchUserDetails(id);
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                mobile_no: user.mobile_no || '',
                password: '', // Don't pre-fill password
                imagePreview: user.image?.url || ''
            });
        } catch (err) {
            toast.error("Failed to load user details");
        } finally {
            setLoading(false);
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
        setUpdating(true);

        const myForm = new FormData();
        myForm.set("first_name", formData.first_name);
        myForm.set("last_name", formData.last_name);
        myForm.set("email", formData.email);
        myForm.set("mobile_no", formData.mobile_no);
        if (formData.password) myForm.set("password", formData.password);
        if (formData.image) myForm.set("image", formData.image);


        try {
            const res = await updateUserAdmin(id, myForm);
            if (res.data.success) {
                toast.success(`${title} details updated successfully!`);
                setTimeout(() => navigate(redirectPath), 1500);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update user");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex align-items-center">
                <Button variant="link" className="text-decoration-none me-2 p-0" onClick={() => navigate(redirectPath)}>
                    <FaArrowLeft /> Back
                </Button>
                <h2>{title}</h2>
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
                                    <Form.Text className="text-muted">Leave empty to keep existing image</Form.Text>
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
                                    <Button variant="secondary" onClick={() => navigate(redirectPath)}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit" disabled={updating}>
                                        {updating ? <Spinner as="span" animation="border" size="sm" /> : <><FaUserEdit className="me-2" /> Update User</>}
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

export default EditUserAccount;
