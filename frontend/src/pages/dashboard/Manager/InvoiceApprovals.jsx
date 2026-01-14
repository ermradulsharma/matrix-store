import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { fetchInvoices, approveInvoice, rejectInvoice, markInvoicePaid } from '../../../services/api';
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

    // Payment Logic
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({ method: 'bank_transfer', reference: '' });

    const handlePaymentClick = (invoice) => {
        setSelectedInvoice(invoice);
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            await markInvoicePaid(selectedInvoice._id, {
                paymentMethod: paymentDetails.method,
                paymentReference: paymentDetails.reference
            });
            toast.success("Invoice Marked as Paid!");
            setShowPaymentModal(false);
            setPaymentDetails({ method: 'bank_transfer', reference: '' });
            loadInvoices();
        } catch (error) {
            console.error('Error paying invoice:', error);
            toast.error("Failed to update payment status");
        }
    };

    if (loading) return <div className="text-center p-5">Loading...</div>;

    return (
        <div className="container-fluid">
            <h2 className="mb-4">Invoice Approvals & Payments</h2>

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
                                                    inv.status === 'approved' ? 'primary' :
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
                                            {inv.status === 'approved' && (
                                                <Button variant="success" size="sm" className="ms-1" onClick={() => handlePaymentClick(inv)}>
                                                    Pay Now
                                                </Button>
                                            )}
                                            <Button variant="outline-secondary" size="sm" className="ms-2" title="View Details">
                                                <FaEye />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">No invoices found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>

            {/* Reject Modal */}
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

            {/* Payment Modal */}
            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Mark Invoice as Paid</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handlePaymentSubmit}>
                    <Modal.Body>
                        <p><strong>Invoice:</strong> {selectedInvoice?.invoiceNumber}</p>
                        <p><strong>Amount:</strong> ${selectedInvoice?.totalAmount?.toFixed(2)}</p>

                        <Form.Group className="mb-3">
                            <Form.Label>Payment Method</Form.Label>
                            <Form.Select
                                value={paymentDetails.method}
                                onChange={(e) => setPaymentDetails({ ...paymentDetails, method: e.target.value })}
                            >
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="cheque">Cheque</option>
                                <option value="cash">Cash</option>
                                <option value="online">Online</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Transaction Reference / Notes</Form.Label>
                            <Form.Control
                                type="text"
                                value={paymentDetails.reference}
                                onChange={(e) => setPaymentDetails({ ...paymentDetails, reference: e.target.value })}
                                placeholder="e.g. TRN12345678"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                        <Button variant="success" type="submit">Confirm Payment</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default InvoiceApprovals;
