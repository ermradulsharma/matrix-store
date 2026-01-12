import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import { fetchUsers, deleteUserProfile } from '../../../services/api';
import { FaTrash, FaUserTie, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ManagerList = () => {
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
                                                <Link to={`/dashboard/user/${manager._id}`} className="btn btn-sm btn-info text-white me-2">
                                                    <FaEye />
                                                </Link>
                                                <Button variant="danger" size="sm" onClick={() => deleteUser(manager._id)}>
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
