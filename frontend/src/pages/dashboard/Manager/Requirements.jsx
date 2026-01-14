import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { fetchRequirements, createRequirement, fetchProviders, sendRequirement } from '../../../services/api';
import { FaPlus, FaEye, FaPaperPlane, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Requirements = () => {
    const [requirements, setRequirements] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);

    // Initial Form State
    const initialFormState = {
        title: '',
        description: '',
        assignedTo: '',
        items: [{ name: '', specifications: '', quantity: 1, expectedPrice: 0 }],
        deadline: '',
        priority: 'medium'
    };
    const [formData, setFormData] = useState(initialFormState);

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
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    // Generic Change Handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Item Change Handler
    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        newItems[index][name] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    // Add New Item
    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { name: '', specifications: '', quantity: 1, expectedPrice: 0 }]
        }));
    };

    // Remove Item
    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createRequirement(formData);
            toast.success("Requirement created successfully!");
            setShowModal(false);
            loadData();
            setFormData(initialFormState);
        } catch (error) {
            console.error('Error creating requirement:', error);
            toast.error(error.response?.data?.message || "Failed to create requirement");
        }
    };

    const handleSend = async (id) => {
        if (!window.confirm("Are you sure you want to send this requirement to the provider?")) return;
        try {
            await sendRequirement(id);
            toast.success("Requirement sent to provider!");
            loadData();
        } catch (error) {
            console.error("Error sending requirement:", error);
            toast.error(error.response?.data?.message || "Failed to send requirement");
        }
    };

    const viewDetails = (req) => {
        setSelectedReq(req);
        setShowViewModal(true);
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

            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Title</th>
                                <th>Assigned To</th>
                                <th>Items</th>
                                <th>Status</th>
                                <th>Approval</th>
                                <th>Sent</th>
                                <th>Priority</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requirements.length > 0 ? (
                                requirements.map(req => (
                                    <tr key={req._id}>
                                        <td>{req.title}</td>
                                        <td>{req.assignedTo?.companyName || req.assignedTo?.user?.first_name || 'Unassigned'}</td>
                                        <td><Badge bg="secondary">{req.items?.length || 0} Items</Badge></td>
                                        <td>
                                            <Badge bg={
                                                req.status === 'fulfilled' ? 'success' :
                                                    req.status === 'in_progress' ? 'primary' :
                                                        req.status === 'closed' ? 'dark' : 'warning'
                                            }>
                                                {req.status?.replace('_', ' ') || 'Pending'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg={
                                                req.approvalStatus === 'approved' ? 'success' :
                                                    req.approvalStatus === 'rejected' ? 'danger' : 'warning'
                                            }>
                                                {req.approvalStatus?.replace('_', ' ') || 'Pending'}
                                            </Badge>
                                        </td>
                                        <td>
                                            {req.isSentToProvider ? <Badge bg="success">Yes</Badge> : <Badge bg="secondary">No</Badge>}
                                        </td>
                                        <td>
                                            <Badge bg={
                                                req.priority === 'high' ? 'danger' :
                                                    req.priority === 'medium' ? 'info' : 'secondary'
                                            }>
                                                {req.priority}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button variant="outline-primary" size="sm" className="me-2" onClick={() => viewDetails(req)}>
                                                <FaEye /> View
                                            </Button>
                                            {req.approvalStatus === 'approved' && !req.isSentToProvider && (
                                                <Button variant="success" size="sm" onClick={() => handleSend(req._id)}>
                                                    <FaPaperPlane /> Send
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">No requirements found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Create Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Create New Requirement</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Assign To Provider</Form.Label>
                                    <Form.Select name="assignedTo" value={formData.assignedTo} onChange={handleChange} required>
                                        <option value="">Select Provider</option>
                                        {providers.map(p => (
                                            <option key={p._id} value={p._id}>{p.companyName || p.user?.first_name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={2} name="description" value={formData.description} onChange={handleChange} required />
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6>Items</h6>
                            <Button variant="outline-secondary" size="sm" onClick={addItem}><FaPlus /> Add Item</Button>
                        </div>

                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {formData.items.map((item, index) => (
                                <Card key={index} className="mb-2 bg-light border-0">
                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Item #{index + 1}</span>
                                            {index > 0 && <Button variant="text" className="text-danger p-0" onClick={() => removeItem(index)}><FaTrash /></Button>}
                                        </div>
                                        <Row>
                                            <Col md={4}>
                                                <Form.Control placeholder="Item Name" name="name" value={item.name} onChange={(e) => handleItemChange(index, e)} required />
                                            </Col>
                                            <Col md={4}>
                                                <Form.Control placeholder="Specs" name="specifications" value={item.specifications} onChange={(e) => handleItemChange(index, e)} />
                                            </Col>
                                            <Col md={2}>
                                                <Form.Control type="number" placeholder="Qty" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} required min="1" />
                                            </Col>
                                            <Col md={2}>
                                                <Form.Control type="number" placeholder="Price" name="expectedPrice" value={item.expectedPrice} onChange={(e) => handleItemChange(index, e)} />
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>

                        <Row className="mt-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Deadline</Form.Label>
                                    <Form.Control type="date" name="deadline" value={formData.deadline} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Priority</Form.Label>
                                    <Form.Select name="priority" value={formData.priority} onChange={handleChange}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                        <Button variant="primary" type="submit">Create</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* View Modal */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{selectedReq?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Status:</strong> {selectedReq?.status}</p>
                    <p><strong>Approval:</strong> {selectedReq?.approvalStatus}</p>
                    <p><strong>Description:</strong> {selectedReq?.description}</p>
                    <p><strong>Assigned To:</strong> {selectedReq?.assignedTo?.companyName || 'N/A'}</p>
                    <h6 className="mt-4">Items Required</h6>
                    <Table bordered size="sm">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Specs</th>
                                <th>Qty</th>
                                <th>Exp. Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedReq?.items?.map((item, i) => (
                                <tr key={i}>
                                    <td>{item.name}</td>
                                    <td>{item.specifications}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.expectedPrice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {selectedReq?.adminNote && (
                        <div className="alert alert-info mt-3">
                            <strong>Admin Note:</strong> {selectedReq.adminNote}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Requirements;
