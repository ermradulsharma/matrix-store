import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Spinner } from 'react-bootstrap';
import { fetchProviderDetails, updateProvider } from '../../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';

import { toast } from 'react-toastify';

const EditProvider = ({ redirectPath }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        businessRegistration: '',
        contactPerson: {
            name: '',
            email: '',
            phone: ''
        },
        bankDetails: {
            accountName: '',
            accountNumber: '',
            bankName: '',
            swiftCode: ''
        }
    });

    useEffect(() => {
        const loadProvider = async () => {
            try {
                const res = await fetchProviderDetails(id);
                if (res.data.success) {
                    const p = res.data.provider;
                    setFormData({
                        companyName: p.companyName,
                        businessRegistration: p.businessRegistration,
                        contactPerson: {
                            name: p.contactPerson.name,
                            email: p.contactPerson.email,
                            phone: p.contactPerson.phone
                        },
                        bankDetails: {
                            accountName: p.bankDetails.accountName,
                            accountNumber: p.bankDetails.accountNumber,
                            bankName: p.bankDetails.bankName,
                            swiftCode: p.bankDetails.swiftCode
                        }
                    });
                }
            } catch (err) {
                toast.error('Error loading provider details');
            } finally {
                setLoading(false);
            }
        };
        loadProvider();
    }, [id]);

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
        setUpdating(true);
        try {
            const res = await updateProvider(id, formData);
            if (res.data.success) {
                toast.success("Provider updated successfully");
                navigate(redirectPath || '..'); // Use redirectPath if provided
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating provider');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex align-items-center mb-4">
                <Button variant="link" className="text-decoration-none me-2 p-0" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </Button>
                <h2 className="mb-0">Edit Provider</h2>
            </div>



            <Card className="shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <h5 className="mb-3">Basic Information</h5>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Company Name</Form.Label>
                                    <Form.Control type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Business Registration Number</Form.Label>
                                    <Form.Control type="text" name="businessRegistration" value={formData.businessRegistration} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                        </div>

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
                            <Button variant="secondary" className="me-2" onClick={() => navigate(-1)}>Cancel</Button>
                            <Button variant="primary" type="submit" disabled={updating}>
                                {updating ? <Spinner as="span" animation="border" size="sm" /> : <><FaEdit className="me-2" /> Update Provider</>}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default EditProvider;
