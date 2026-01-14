import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Modal, Form, Card, Row, Col } from 'react-bootstrap';
import { fetchRequirements, approveRequirement } from '../../../services/api';
import { FaCheck, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

const RequirementApprovals = () => {
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    const [editItems, setEditItems] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await fetchRequirements(); // This fetches ALL. We need to filter for pending_approval on frontend or backend.
            // Backend getAllRequirements returns all for Admin.
            if (res.data.success) {
                // Filter locally for now
                const pending = res.data.requirements.filter(r => r.approvalStatus === 'pending_approval');
                setRequirements(pending);
            }
        } catch (error) {
            console.error("Error loading approvals:", error);
            toast.error("Failed to load requirements");
        } finally {
            setLoading(false);
        }
    };

    const handleView = (req) => {
        setSelectedReq(req);
        setEditItems(JSON.parse(JSON.stringify(req.items))); // Deep copy
        setAdminNote(req.adminNote || '');
        setShowModal(true);
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...editItems];
        newItems[index][name] = value;
        setEditItems(newItems);
    };

    const addItem = () => {
        setEditItems([...editItems, { name: '', specifications: '', quantity: 1, expectedPrice: 0 }]);
    };

    const removeItem = (index) => {
        setEditItems(editItems.filter((_, i) => i !== index));
    };

    const handleApprove = async () => {
        if (!window.confirm("Approve this requirement?")) return;
        try {
            // We send items and adminNote. The controller updates items if provided.
            await approveRequirement(selectedReq._id, {
                items: editItems,
                adminNote
            });
            toast.success("Requirement Approved!");
            setShowModal(false);
            loadData();
        } catch (error) {
            console.error("Error approving:", error);
            toast.error("Failed to approve requirement");
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid">
            <h2 className="mb-4">Pending Requirement Approvals</h2>

            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Title</th>
                                <th>Created By</th>
                                <th>Items</th>
                                <th>Deadline</th>
                                <th>Priority</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requirements.length > 0 ? (
                                requirements.map(req => (
                                    <tr key={req._id}>
                                        <td>{req.title}</td>
                                        <td>{req.createdBy?.first_name} {req.createdBy?.last_name}</td>
                                        <td>{req.items?.length || 0}</td>
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
                                            <Button variant="primary" size="sm" onClick={() => handleView(req)}>
                                                <FaEdit className="me-1" /> Review & Approve
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">No pending approvals</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Review Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Review Requirement: {selectedReq?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Description:</strong> {selectedReq?.description}</p>
                    <p><strong>Assigned To:</strong> {selectedReq?.assignedTo?.companyName || 'Unassigned'}</p>

                    <h5 className="mt-4 mb-3 d-flex justify-content-between align-items-center">
                        Items (Editable)
                        <Button variant="outline-secondary" size="sm" onClick={addItem}><FaPlus /> Add Item</Button>
                    </h5>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {editItems.map((item, index) => (
                            <Card key={index} className="mb-2 bg-light border-0">
                                <Card.Body className="p-2">
                                    <div className="d-flex justify-content-end">
                                        <Button variant="text" size="sm" className="text-danger p-0" onClick={() => removeItem(index)}><FaTrash /></Button>
                                    </div>
                                    <Row className="g-2">
                                        <Col md={5}>
                                            <Form.Control
                                                size="sm"
                                                placeholder="Item Name"
                                                name="name"
                                                value={item.name}
                                                onChange={(e) => handleItemChange(index, e)}
                                            />
                                        </Col>
                                        <Col md={3}>
                                            <Form.Control
                                                size="sm"
                                                placeholder="Specs"
                                                name="specifications"
                                                value={item.specifications}
                                                onChange={(e) => handleItemChange(index, e)}
                                            />
                                        </Col>
                                        <Col md={2}>
                                            <Form.Control
                                                size="sm"
                                                type="number"
                                                placeholder="Qty"
                                                name="quantity"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, e)}
                                            />
                                        </Col>
                                        <Col md={2}>
                                            <Form.Control
                                                size="sm"
                                                type="number"
                                                placeholder="Price"
                                                name="expectedPrice"
                                                value={item.expectedPrice}
                                                onChange={(e) => handleItemChange(index, e)}
                                            />
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>

                    <Form.Group className="mt-3">
                        <Form.Label>Admin Note (Optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            placeholder="Add notes for the manager/provider..."
                        />
                    </Form.Group>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="success" onClick={handleApprove}>
                        <FaCheck className="me-2" /> Approve & Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default RequirementApprovals;
