import React from 'react';
import { Table, Badge } from 'react-bootstrap';

const OrderHistory = ({ orders }) => {
    if (!orders || orders.length === 0) {
        return <p>No orders found.</p>;
    }

    return (
        <Table striped bordered hover responsive>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {orders.map((order, idx) => (
                    <tr key={order._id || idx}>
                        <td>{idx + 1}</td>
                        <td>{order._id?.slice(0, 8) || 'N/A'}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>{order.total?.toFixed(2) || '0.00'}</td>
                        <td>
                            <Badge bg={order.status === 'paid' ? 'success' : order.status === 'pending' ? 'warning' : 'secondary'}>
                                {order.status?.toUpperCase() || 'UNKNOWN'}
                            </Badge>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default OrderHistory;
