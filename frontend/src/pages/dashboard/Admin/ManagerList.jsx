import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Badge, Spinner, Container, Card } from 'react-bootstrap';
import { fetchUsers, deleteUserProfile } from '../../../services/api';
import { FaTrash, FaUserTie, FaEye, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ManagerList = () => {
    const navigate = useNavigate();
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadManagers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchUsers();
            if (res.data.success) {
                setManagers(res.data.users.filter(user => user.role === 'manager'));
            }
        } catch (error) {
            console.error('Error loading managers:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadManagers();
    }, [loadManagers]);

    const deleteUser = async (id) => {
        if (window.confirm('Are you sure you want to remove this manager?')) {
            try {
                // Use the standard deleteUserProfile function
                await deleteUserProfile(id);
                loadManagers(); // Refresh list
            } catch (error) {
                console.error('Error deleting manager:', error);
                alert('Failed to delete manager');
            }
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <Container fluid>
            <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <FaUserTie className="text-primary me-2" size={20} />
                        <h4 className="fw-bold text-dark mb-0">Manage Managers</h4>
                    </div>
                    <Button variant="primary" onClick={() => navigate('new')} className="d-flex align-items-center">
                        <FaUserTie className="me-2" /> Create New Manager
                    </Button>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Name</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Email</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Status</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Managed By</th>
                                <th className="pe-4 py-3 text-end text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {managers.length > 0 ? (
                                managers.map(manager => (
                                    <tr key={manager._id}>
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="avatar rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                                                    {manager.first_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h6 className="mb-0 fw-bold text-dark">{manager.first_name} {manager.last_name}</h6>
                                                    <small className="text-muted">@{manager.username || manager.first_name.toLowerCase()}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-secondary text-sm font-weight-bold">{manager.email}</span>
                                        </td>
                                        <td className="py-3">
                                            <Badge bg={manager.isActive ? 'success' : 'danger'} className="rounded-pill px-3">
                                                {manager.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-secondary text-sm">
                                                {manager.managedBy?.first_name ? `${manager.managedBy.first_name} ${manager.managedBy.last_name || ''}` : <span className="text-muted fst-italic">N/A</span>}
                                            </span>
                                        </td>
                                        <td className="pe-4 py-3 text-end">
                                            <div className="btn-group">
                                                <Button variant="link" size="sm" className="text-info p-1" title="View Profile" onClick={() => navigate(`view/${manager._id}`)}>
                                                    <FaEye size={16} />
                                                </Button>
                                                <Button variant="link" size="sm" className="text-primary p-1" title="Edit Manager" onClick={() => navigate(`edit/${manager._id}`)}>
                                                    <FaEdit size={16} />
                                                </Button>
                                                <Button variant="link" size="sm" className="text-danger p-1" title="Delete Manager" onClick={() => deleteUser(manager._id)}>
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
                                                <FaUserTie size={40} className="opacity-25" />
                                            </div>
                                            <p className="text-muted mb-0">No managers found</p>
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

export default ManagerList;
