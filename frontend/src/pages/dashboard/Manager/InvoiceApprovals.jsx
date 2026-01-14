import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { fetchInvoices, approveInvoice, rejectInvoice } from '../../../services/api';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

const InvoiceApprovals = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            const res = await fetchInvoices();
            if (res.data.success) {
                setInvoices(res.data.invoices);
            }
        } catch (error) {
            console.error('Error loading invoices:', error);
            toast.error("Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (window.confirm('Are you sure you want to approve this invoice?')) {
            try {
                await approveInvoice(id);
                toast.success("Invoice Approved!");
                loadInvoices();
            } catch (error) {
                console.error('Error approving invoice:', error);
                toast.error("Failed to approve invoice");
            }
        }
    };

    const handleRejectClick = (invoice) => {
        setSelectedInvoice(invoice);
        setShowRejectModal(true);
    };

    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        try {
            await rejectInvoice(selectedInvoice._id, rejectReason);
            toast.info("Invoice Rejected");
            setShowRejectModal(false);
            setRejectReason('');
            loadInvoices();
        } catch (error) {
            console.error('Error rejecting invoice:', error);
            toast.error("Failed to reject invoice");
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid">
            <h2 className="mb-4">Invoice Approvals</h2>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Invoice #</th>
                                <th>Provider</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length > 0 ? (
                                invoices.map(inv => (
                                    <tr key={inv._id}>
                                        <td>{inv.invoiceNumber}</td>
                                        <td>{inv.provider?.companyName}</td>
                                        <td>${inv.totalAmount.toFixed(2)}</td>
                                        <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <Badge bg={
                                                inv.status === 'paid' ? 'success' :
                                                    inv.status === 'approved' ? 'info' :
                                                        inv.status === 'rejected' ? 'danger' : 'warning'
                                            }>
                                                {inv.status}
                                            </Badge>
                                        </td>
                                        <td>
                                            {inv.status === 'submitted' && (
                                                <div className="btn-group">
                                                    <Button variant="outline-success" size="sm" onClick={() => handleApprove(inv._id)} title="Approve">
                                                        <FaCheck />
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleRejectClick(inv)} title="Reject">
                                                        <FaTimes />
                                                    </Button>
                                                </div>
                                            )}
                                            <Button variant="outline-secondary" size="sm" className="ms-2" title="View Details">
                                                <FaEye />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">No invoices pending approval</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>

            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Reject Invoice</Modal.Title>
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
                        <Button variant="danger" type="submit">Reject Invoice</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default InvoiceApprovals;
