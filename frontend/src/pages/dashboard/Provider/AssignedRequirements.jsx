import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { fetchRequirements, acceptRequirement, fulfillRequirement, rejectRequirement } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes, FaBoxOpen, FaFileInvoiceDollar } from 'react-icons/fa';

const AssignedRequirements = () => {
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

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
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await acceptRequirement(id);
            loadRequirements();
        } catch (error) {
            console.error('Error accepting requirement:', error);
        }
    };

    const handleFulfill = async (id) => {
        if (window.confirm('Are you sure you have fulfilled this requirement? This will allow you to create an invoice.')) {
            try {
                await fulfillRequirement(id);
                loadRequirements();
            } catch (error) {
                console.error('Error fulfilling requirement:', error);
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
            setShowRejectModal(false);
            setRejectReason('');
            loadRequirements();
        } catch (error) {
            console.error('Error rejecting requirement:', error);
        }
    };

    const handleCreateInvoice = (req) => {
        navigate('/dashboard/provider/invoices/new', { state: { requirement: req } });
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid">
            <h2 className="mb-4">My Assigned Requirements</h2>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Title</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Deadline</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requirements.length > 0 ? (
                                requirements.map(req => (
                                    <tr key={req._id}>
                                        <td>{req.title}</td>
                                        <td>{req.productDetails.category}</td>
                                        <td>{req.productDetails.quantity}</td>
                                        <td>{new Date(req.deadline).toLocaleDateString()}</td>
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
                                            {req.status === 'pending' && (
                                                <div className="btn-group">
                                                    <Button variant="outline-success" size="sm" onClick={() => handleAccept(req._id)} title="Accept">
                                                        <FaCheck /> Accept
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleRejectClick(req)} title="Reject">
                                                        <FaTimes /> Reject
                                                    </Button>
                                                </div>
                                            )}
                                            {req.status === 'accepted' && (
                                                <Button variant="outline-primary" size="sm" onClick={() => handleFulfill(req._id)}>
                                                    <FaBoxOpen className="me-1" /> Mark Fulfilled
                                                </Button>
                                            )}
                                            {req.status === 'fulfilled' && (
                                                <Button variant="outline-success" size="sm" onClick={() => handleCreateInvoice(req)}>
                                                    <FaFileInvoiceDollar className="me-1" /> Create Invoice
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
                </div>
            </div>

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
        </div>
    );
};

export default AssignedRequirements;
