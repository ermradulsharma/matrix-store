import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import OrderHistory from '../../components/customer/OrderHistory';
import { Container, Card, Button, Modal, Form } from 'react-bootstrap';

const CustomerProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [showEdit, setShowEdit] = useState(false);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        if (user) {
            // Fetch profile
            api.get('/profile')
                .then(res => setProfile(res.data.user))
                .catch(err => console.error(err));
            // Fetch orders
            api.get('/orders')
                .then(res => setOrders(res.data.orders))
                .catch(err => console.error(err));
        }
    }, [user]);

    const handleEdit = () => {
        setEditData({ name: profile.name, mobile: profile.mobile });
        setShowEdit(true);
    };

    const handleSave = async () => {
        try {
            const res = await api.put('/profile/update', editData);
            setProfile(res.data.user);
            setShowEdit(false);
        } catch (err) {
            console.error(err);
        }
    };

    if (!profile) return <div>Loading...</div>;

    return (
        <Container className="my-4">
            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>My Information</Card.Title>
                    <p><strong>Name:</strong> {profile.name}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Mobile:</strong> {profile.mobile}</p>
                    <Button variant="primary" onClick={handleEdit}>Edit Profile</Button>
                </Card.Body>
            </Card>

            <h4>Order History</h4>
            <OrderHistory orders={orders} />

            <Modal show={showEdit} onHide={() => setShowEdit(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formMobile">
                            <Form.Label>Mobile</Form.Label>
                            <Form.Control type="text" value={editData.mobile || ''} onChange={e => setEditData({ ...editData, mobile: e.target.value })} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Save</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CustomerProfile;
