import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import { fetchInvoices, submitInvoice } from '../../../services/api';
import { Link } from 'react-router-dom';
import { FaPlus, FaPaperPlane, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

const InvoiceHistory = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleSubmit = async (id) => {
        if (window.confirm('Are you sure you want to submit this invoice for approval?')) {
            try {
                await submitInvoice(id);
                toast.success("Invoice submitted for approval!");
                loadInvoices();
            } catch (error) {
                console.error('Error submitting invoice:', error);
                toast.error("Failed to submit invoice");
            }
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Invoices</h2>
                <Link to="/dashboard/provider/invoices/new" className="btn btn-primary">
                    <FaPlus className="me-2" /> Create Invoice
                </Link>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Invoice #</th>
                                <th>Requirement</th>
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
                                        <td>{inv.requirement?.title || 'N/A'}</td>
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
                                            <div className="btn-group">
                                                {inv.status === 'draft' && (
                                                    <Button variant="outline-primary" size="sm" onClick={() => handleSubmit(inv._id)} title="Submit">
                                                        <FaPaperPlane />
                                                    </Button>
                                                )}
                                                <Button variant="outline-secondary" size="sm" title="View Details">
                                                    <FaEye />
                                                </Button>
                                            </div>
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
        </div>
    );
};

export default InvoiceHistory;
