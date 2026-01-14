import React, { useState, useEffect } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { createProvider, fetchUsers } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';

const CreateProvider = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        userId: '',
        companyName: '',
        businessRegistration: '',
        contactPerson: {
            name: '',
            email: '',
            phone: ''
        },
        productCategories: [],
        bankDetails: {
            accountName: '',
            accountNumber: '',
            bankName: '',
            swiftCode: ''
        }
    });

    useEffect(() => {
        // Fetch potential users to link to provider
        // In a real app, you might want to filter for users with 'provider' role who don't have a profile yet
        const loadUsers = async () => {
            try {
                const res = await fetchUsers();
                if (res.data.success) {
                    setUsers(res.data.users.filter(u => u.role === 'provider'));
                }
            } catch (err) {
                console.error('Error loading users:', err);
            }
        };
        loadUsers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await createProvider(formData);
            if (res.data.success) {
                toast.success("Provider created successfully");
                navigate('..');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error creating provider');
        }
    };

    return (
        <div className="container-fluid">
            <h2 className="mb-4">Create New Provider</h2>


            <Card className="shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <h5 className="mb-3">Basic Information</h5>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Link User Account</Form.Label>
                                    <Form.Select name="userId" value={formData.userId} onChange={handleChange} required>
                                        <option value="">Select User</option>
                                        {users.map(user => (
                                            <option key={user._id} value={user._id}>
                                                {user.first_name} {user.last_name} ({user.email}) {user.managedBy ? `- Managed by ${user.managedBy.first_name}` : ''}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Company Name</Form.Label>
                                    <Form.Control type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Business Registration Number</Form.Label>
                            <Form.Control type="text" name="businessRegistration" value={formData.businessRegistration} onChange={handleChange} required />
                        </Form.Group>

                        <h5 className="mb-3 mt-4">Contact Person</h5>
                        <div className="row mb-3">
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control type="text" name="contactPerson.name" value={formData.contactPerson.name} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" name="contactPerson.email" value={formData.contactPerson.email} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control type="text" name="contactPerson.phone" value={formData.contactPerson.phone} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                        </div>

                        <h5 className="mb-3 mt-4">Bank Details</h5>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Bank Name</Form.Label>
                                    <Form.Control type="text" name="bankDetails.bankName" value={formData.bankDetails.bankName} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Account Name</Form.Label>
                                    <Form.Control type="text" name="bankDetails.accountName" value={formData.bankDetails.accountName} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Account Number</Form.Label>
                                    <Form.Control type="text" name="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>SWIFT Code</Form.Label>
                                    <Form.Control type="text" name="bankDetails.swiftCode" value={formData.bankDetails.swiftCode} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" className="me-2" onClick={() => navigate('..')}>Cancel</Button>
                            <Button variant="primary" type="submit">Create Provider</Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default CreateProvider;
