import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Modal, Form, Card, Row, Col } from 'react-bootstrap';
import { fetchRequirements, acceptRequirement, fulfillRequirement, rejectRequirement, providerUpdateRequirement } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes, FaBoxOpen, FaFileInvoiceDollar, FaEye, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AssignedRequirements = () => {
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [updateItems, setUpdateItems] = useState([]);

    useEffect(() => {
        loadRequirements();
    }, []);

    const loadRequirements = async () => {
        try {
            const res = await fetchRequirements();
            if (res.data.success) {
                setRequirements(res.data.requirements);
            }
        } catch (error) {
            console.error('Error loading requirements:', error);
            toast.error("Failed to load assigned requirements");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await acceptRequirement(id);
            toast.success("Requirement accepted!");
            loadRequirements();
        } catch (error) {
            console.error('Error accepting requirement:', error);
            toast.error("Failed to accept requirement");
        }
    };

    const handleFulfill = async (id) => {
        if (window.confirm('Are you sure you have fulfilled this requirement? This will allow you to create an invoice.')) {
            try {
                await fulfillRequirement(id);
                toast.success("Requirement marked as fulfilled!");
                loadRequirements();
            } catch (error) {
                console.error('Error fulfilling requirement:', error);
                toast.error("Failed to mark fulfilled");
            }
        }
    };

    const handleRejectClick = (req) => {
        setSelectedReq(req);
        setShowRejectModal(true);
    };

    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        try {
            await rejectRequirement(selectedReq._id, rejectReason);
            toast.info("Requirement rejected");
            setShowRejectModal(false);
            setRejectReason('');
            loadRequirements();
        } catch (error) {
            console.error('Error rejecting requirement:', error);
            toast.error("Failed to reject");
        }
    };

    const handleCreateInvoice = (req) => {
        navigate('/dashboard/provider/invoices/new', { state: { requirement: req } });
    };

    const handleView = (req) => {
        setSelectedReq(req);
        setUpdateItems(JSON.parse(JSON.stringify(req.items))); // Deep copy for editing
        setShowViewModal(true);
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...updateItems];
        newItems[index][name] = value;
        setUpdateItems(newItems);
    };

    const handleSaveUpdates = async () => {
        try {
            await providerUpdateRequirement(selectedReq._id, { items: updateItems });
            toast.success("Updates saved!");
            loadRequirements();
            setShowViewModal(false);
        } catch (error) {
            console.error("Error saving updates:", error);
            toast.error("Failed to save updates");
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid">
            <h2 className="mb-4">My Assigned Requirements</h2>

            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Title</th>
                                <th>Items</th>
                                <th>Deadline</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requirements.length > 0 ? (
                                requirements.map(req => (
                                    <tr key={req._id}>
                                        <td>{req.title}</td>
                                        <td><Badge bg="secondary">{req.items?.length || 0} Items</Badge></td>
                                        <td>{new Date(req.deadline).toLocaleDateString()}</td>
                                        <td>
                                            <Badge bg={
                                                req.priority === 'high' ? 'danger' :
                                                    req.priority === 'medium' ? 'info' : 'secondary'
                                            }>
                                                {req.priority}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg={
                                                req.status === 'fulfilled' ? 'success' :
                                                    req.status === 'in_progress' ? 'primary' :
                                                        req.status === 'closed' ? 'dark' : 'warning'
                                            }>
                                                {req.status.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleView(req)}>
                                                <FaEye /> View
                                            </Button>

                                            {req.status === 'pending' && (
                                                <div className="btn-group me-2">
                                                    <Button variant="success" size="sm" onClick={() => handleAccept(req._id)} title="Accept">
                                                        <FaCheck />
                                                    </Button>
                                                    <Button variant="danger" size="sm" onClick={() => handleRejectClick(req)} title="Reject">
                                                        <FaTimes />
                                                    </Button>
                                                </div>
                                            )}
                                            {req.status === 'in_progress' && ( // Should match 'in_progress' from controller
                                                <Button variant="primary" size="sm" className="me-2" onClick={() => handleFulfill(req._id)}>
                                                    <FaBoxOpen className="me-1" /> Fulfill
                                                </Button>
                                            )}
                                            {req.status === 'fulfilled' && (
                                                <Button variant="success" size="sm" onClick={() => handleCreateInvoice(req)}>
                                                    <FaFileInvoiceDollar className="me-1" /> Invoice
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">No requirements assigned yet</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Reject Modal */}
            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Reject Requirement</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleRejectSubmit}>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Reason for Rejection</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                        <Button variant="danger" type="submit">Reject</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* View/Update Modal */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{selectedReq?.title} - Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Description:</strong> {selectedReq?.description}</p>
                    <p><strong>Approved By:</strong> {selectedReq?.approvedBy?.first_name} {selectedReq?.approvedBy?.last_name}</p>
                    {selectedReq?.adminNote && <div className="alert alert-info"><strong>Note:</strong> {selectedReq.adminNote}</div>}

                    <h5 className="mt-4">Items</h5>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {updateItems.map((item, index) => (
                            <Card key={index} className="mb-2 bg-light border-0">
                                <Card.Body className="p-2">
                                    <Row className="align-items-center">
                                        <Col md={5}>
                                            <strong>{item.name}</strong>
                                            <div className="text-muted small">{item.specifications}</div>
                                        </Col>
                                        <Col md={2}>
                                            <small>Req Qty:</small><br />
                                            <strong>{item.quantity}</strong>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <small>Fulfilled Qty:</small>
                                                <Form.Control
                                                    size="sm"
                                                    type="number"
                                                    name="fulfilledQuantity"
                                                    value={item.fulfilledQuantity || 0}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    disabled={selectedReq?.status !== 'in_progress'}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <small>Price:</small><br />
                                            {item.expectedPrice}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
                    {selectedReq?.status === 'in_progress' && (
                        <Button variant="primary" onClick={handleSaveUpdates}>
                            <FaSave className="me-2" /> Save Progress
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AssignedRequirements;
