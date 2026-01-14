import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Table, Badge, Tabs, Tab, Spinner } from 'react-bootstrap';
import { adjustStock, fetchStockHistory } from '../../../services/api';
import { toast } from 'react-toastify';

const StockManagementModal = ({ show, onHide, product, onSuccess }) => {
    const [key, setKey] = useState('adjust');
    const [history, setHistory] = useState([]);
    const [quantity, setQuantity] = useState('');
    const [type, setType] = useState('add');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);

    const loadHistory = useCallback(async () => {
        if (!product?._id) return;
        setHistoryLoading(true);
        try {
            const data = await fetchStockHistory(product._id);
            setHistory(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load stock history");
        } finally {
            setHistoryLoading(false);
        }
    }, [product]);

    useEffect(() => {
        if (show && product?._id) {
            loadHistory();
            setQuantity('');
            setNote('');
        }
    }, [show, product, loadHistory]);

    const handleAdjust = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await adjustStock(product._id, {
                quantity: parseInt(quantity),
                type,
                note
            });
            onSuccess(); // Refresh parent
            loadHistory(); // Refresh history tab
            setQuantity('');
            setNote('');
            toast.success('Stock adjusted successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to adjust stock');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Manage Stock: {product?.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3 d-flex justify-content-between align-items-center p-3 bg-light rounded">
                    <h5 className="mb-0">Current Stock: <strong>{product?.stock}</strong></h5>
                    {product?.sku && <span className="text-muted">SKU: {product.sku}</span>}
                </div>

                <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
                    <Tab eventKey="adjust" title="Adjust Stock">
                        <Form onSubmit={handleAdjust}>
                            <Form.Group className="mb-3">
                                <Form.Label>Action</Form.Label>
                                <div className="d-flex gap-3">
                                    <Form.Check
                                        type="radio"
                                        label="Add Stock (+)"
                                        name="type"
                                        id="type-add"
                                        checked={type === 'add'}
                                        onChange={() => setType('add')}
                                        className="text-success fw-bold"
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Remove Stock (-)"
                                        name="type"
                                        id="type-subtract"
                                        checked={type === 'subtract'}
                                        onChange={() => setType('subtract')}
                                        className="text-danger fw-bold"
                                    />
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    min="1"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Reason / Note</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="e.g. New Shipment, Damaged Goods..."
                                />
                            </Form.Group>

                            <div className="d-flex justify-content-end">
                                <Button variant="secondary" onClick={onHide} className="me-2">Cancel</Button>
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? <Spinner size="sm" /> : (type === 'add' ? 'Add Stock' : 'Remove Stock')}
                                </Button>
                            </div>
                        </Form>
                    </Tab>
                    <Tab eventKey="history" title="Movement History">
                        {historyLoading ? <div className="text-center p-3"><Spinner /></div> : (
                            <div className="table-responsive" style={{ maxHeight: '300px' }}>
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Qty</th>
                                            <th>User</th>
                                            <th>Note</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.length > 0 ? history.map(log => (
                                            <tr key={log._id}>
                                                <td>{new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}</td>
                                                <td>
                                                    <Badge bg={
                                                        log.type === 'purchase' || log.type === 'initial' || (log.type === 'manual_adjustment' && log.quantity > 0) ? 'success' :
                                                            log.type === 'sale' ? 'primary' : 'warning'
                                                    }>
                                                        {log.type.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className={log.quantity > 0 ? 'text-success' : 'text-danger'}>
                                                    {log.quantity > 0 ? '+' : ''}{log.quantity}
                                                </td>
                                                <td>{log.user_id?.name || 'Unknown'}</td>
                                                <td><small>{log.note}</small></td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="text-center">No history found</td></tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Tab>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
};

export default StockManagementModal;
