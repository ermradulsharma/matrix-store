import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Container, Card } from 'react-bootstrap';
import { fetchUsers } from '../../../services/api';
import { FaEdit, FaTrash, FaEye, FaUsers } from 'react-icons/fa';
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
        <Container fluid>
            <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <FaUsers className="text-primary me-2" size={20} />
                        <h4 className="fw-bold text-dark mb-0">Manage Customers</h4>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Name</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Email</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Status</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Joined Date</th>
                                <th className="pe-4 py-3 text-end text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length > 0 ? (
                                customers.map(customer => (
                                    <tr key={customer._id}>
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="avatar rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                                                    {customer.first_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h6 className="mb-0 fw-bold text-dark">{customer.first_name} {customer.last_name}</h6>
                                                    <small className="text-muted">@{customer.username || 'customer'}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-secondary text-sm font-weight-bold">{customer.email}</span>
                                        </td>
                                        <td className="py-3">
                                            <Badge bg={customer.isActive ? 'success' : 'danger'} className="rounded-pill px-3">
                                                {customer.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-secondary text-sm">
                                                {new Date(customer.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="pe-4 py-3 text-end">
                                            <div className="btn-group">
                                                <Link to={`/dashboard/user/${customer._id}`} className="btn btn-sm btn-link text-info p-1" title="View Details">
                                                    <FaEye size={16} />
                                                </Link>
                                                <Button variant="link" size="sm" className="text-primary p-1" title="Edit">
                                                    <FaEdit size={16} />
                                                </Button>
                                                <Button variant="link" size="sm" className="text-danger p-1" title="Delete">
                                                    <FaTrash size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <div className="d-flex flex-column align-items-center justify-content-center">
                                            <div className="text-muted mb-2">
                                                <FaUsers size={40} className="opacity-25" />
                                            </div>
                                            <p className="text-muted mb-0">No customers found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CustomerList;
