import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import { fetchUsers } from '../../../services/api';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            // Ideally passing role query param if fetchUsers supports it, 
            // otherwise client-side filter
            const res = await fetchUsers();
            if (res.data.success) {
                setCustomers(res.data.users.filter(u => u.role === 'customer'));
            }
        } catch (error) {
            console.error('Error loading customers:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Customers</h2>
                {/* No create button for customers usually */}
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Joined Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length > 0 ? (
                                customers.map(customer => (
                                    <tr key={customer._id}>
                                        <td>{customer.first_name} {customer.last_name}</td>
                                        <td>{customer.email}</td>
                                        <td>
                                            <Badge bg={customer.isActive ? 'success' : 'danger'}>
                                                {customer.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="btn-group">
                                                <Link to={`/dashboard/user/${customer._id}`} className="btn btn-sm btn-info text-white me-2">
                                                    <FaEye />
                                                </Link>
                                                <Button variant="outline-primary" size="sm">
                                                    <FaEdit />
                                                </Button>
                                                <Button variant="outline-danger" size="sm">
                                                    <FaTrash />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">No customers found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default CustomerList;
