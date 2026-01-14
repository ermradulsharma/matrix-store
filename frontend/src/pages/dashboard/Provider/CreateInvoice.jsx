import React, { useState } from 'react';
import { Form, Button, Card, Alert, Table } from 'react-bootstrap';
import { createInvoice, submitInvoice } from '../../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const requirement = location.state?.requirement;

    const [formData, setFormData] = useState({
        requirement: requirement?._id || '',
        items: requirement ? requirement.items.map(item => ({
            description: item.name,
            quantity: item.fulfilledQuantity || item.quantity,
            unitPrice: item.expectedPrice || 0
        })) : [{ description: '', quantity: 1, unitPrice: 0 }],
        paymentMethod: 'bank_transfer',
        paymentReference: '',
        notes: ''
    });
    // const [error, setError] = useState(''); // Removed unused error state

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }]
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await createInvoice(formData);
            if (res.data.success) {
                // Auto-submit the invoice after creation for simplicity in this flow
                await submitInvoice(res.data.invoice._id);
                toast.success("Invoice created and submitted successfully!");
                navigate('/dashboard/provider/invoices');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error creating invoice');
        }
    };

    return (
        <div className="container-fluid">
            <h2 className="mb-4">Create New Invoice</h2>
            {/* Error handling moved to Toast */}

            <Card className="shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        {requirement && (
                            <Alert variant="info">
                                Creating invoice for requirement: <strong>{requirement.title}</strong>
                            </Alert>
                        )}

                        <h5 className="mb-3">Invoice Items</h5>
                        <Table bordered>
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th style={{ width: '150px' }}>Quantity</th>
                                    <th style={{ width: '150px' }}>Unit Price</th>
                                    <th style={{ width: '150px' }}>Total</th>
                                    <th style={{ width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <Form.Control
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                required
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                                                required
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                                                required
                                            />
                                        </td>
                                        <td className="align-middle text-end">
                                            ${(item.quantity * item.unitPrice).toFixed(2)}
                                        </td>
                                        <td className="align-middle text-center">
                                            {formData.items.length > 1 && (
                                                <Button variant="outline-danger" size="sm" onClick={() => removeItem(index)}>
                                                    <FaTrash />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="text-end fw-bold">Subtotal:</td>
                                    <td className="text-end fw-bold">${calculateTotal().toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </Table>

                        <Button variant="outline-secondary" size="sm" onClick={addItem} className="mb-4">
                            <FaPlus className="me-1" /> Add Item
                        </Button>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Payment Method</Form.Label>
                                    <Form.Select
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    >
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="check">Check</option>
                                        <option value="paypal">PayPal</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Notes</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={1}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end mt-3">
                            <Button variant="secondary" className="me-2" onClick={() => navigate('/dashboard/provider/invoices')}>Cancel</Button>
                            <Button variant="primary" type="submit">Create & Submit Invoice</Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default CreateInvoice;
