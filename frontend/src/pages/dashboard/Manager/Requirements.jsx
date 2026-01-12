import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { fetchRequirements, createRequirement, fetchProviders } from '../../../services/api';
import { FaPlus } from 'react-icons/fa';

const Requirements = () => {
    const [requirements, setRequirements] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedTo: '',
        productDetails: {
            category: '',
            specifications: '',
            quantity: 0,
            estimatedPrice: 0
        },
        deadline: '',
        priority: 'medium'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [reqRes, provRes] = await Promise.all([fetchRequirements(), fetchProviders()]);
            if (reqRes.data.success) setRequirements(reqRes.data.requirements);
            if (provRes.data.success) setProviders(provRes.data.providers);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

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
            await createRequirement(formData);
            setShowModal(false);
            loadData();
            setFormData({
                title: '',
                description: '',
                assignedTo: '',
                productDetails: { category: '', specifications: '', quantity: 0, estimatedPrice: 0 },
                deadline: '',
                priority: 'medium'
            });
        } catch (error) {
            console.error('Error creating requirement:', error);
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Product Requirements</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    <FaPlus className="me-2" /> New Requirement
                </Button>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Title</th>
                                <th>Assigned To</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Deadline</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requirements.length > 0 ? (
                                requirements.map(req => (
                                    <tr key={req._id}>
                                        <td>{req.title}</td>
                                        <td>{req.assignedTo?.companyName || 'Unassigned'}</td>
                                        <td>{req.productDetails.category}</td>
                                        <td>{req.productDetails.quantity}</td>
                                        <td>
                                            <Badge bg={
                                                req.status === 'fulfilled' ? 'success' :
                                                    req.status === 'in_progress' ? 'primary' :
                                                        req.status === 'rejected' ? 'danger' : 'warning'
                                            }>
                                                {req.status.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg={
                                                req.priority === 'high' ? 'danger' :
                                                    req.priority === 'medium' ? 'info' : 'secondary'
                                            }>
                                                {req.priority}
                                            </Badge>
                                        </td>
                                        <td>{new Date(req.deadline).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">No requirements found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Create New Requirement</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Assign To Provider</Form.Label>
                                    <Form.Select name="assignedTo" value={formData.assignedTo} onChange={handleChange} required>
                                        <option value="">Select Provider</option>
                                        {providers.map(p => (
                                            <option key={p._id} value={p._id}>{p.companyName}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} required />
                        </Form.Group>

                        <h6 className="mt-4">Product Details</h6>
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Control type="text" name="productDetails.category" value={formData.productDetails.category} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Specifications</Form.Label>
                                    <Form.Control type="text" name="productDetails.specifications" value={formData.productDetails.specifications} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Quantity</Form.Label>
                                    <Form.Control type="number" name="productDetails.quantity" value={formData.productDetails.quantity} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Estimated Price</Form.Label>
                                    <Form.Control type="number" name="productDetails.estimatedPrice" value={formData.productDetails.estimatedPrice} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Deadline</Form.Label>
                                    <Form.Control type="date" name="deadline" value={formData.deadline} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Priority</Form.Label>
                                    <Form.Select name="priority" value={formData.priority} onChange={handleChange}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                        <Button variant="primary" type="submit">Create Requirement</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Requirements;
