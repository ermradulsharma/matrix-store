import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import { fetchUsers } from '../../../services/api';
import { FaUserTie, FaEdit, FaTrash } from 'react-icons/fa';

const ManagerList = () => {
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadManagers();
    }, []);

    const loadManagers = async () => {
        try {
            const res = await fetchUsers();
            if (res.data.success) {
                setManagers(res.data.users.filter(u => u.role === 'manager'));
            }
        } catch (error) {
            console.error('Error loading managers:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Managers</h2>
                <Button variant="primary">
                    <FaUserTie className="me-2" /> Create New Manager
                </Button>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Managed By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {managers.length > 0 ? (
                                managers.map(manager => (
                                    <tr key={manager._id}>
                                        <td>{manager.first_name} {manager.last_name}</td>
                                        <td>{manager.email}</td>
                                        <td>
                                            <Badge bg={manager.isActive ? 'success' : 'danger'}>
                                                {manager.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td>{manager.managedBy?.first_name || 'N/A'}</td>
                                        <td>
                                            <div className="btn-group">
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
                                    <td colSpan="5" className="text-center py-4">No managers found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default ManagerList;
