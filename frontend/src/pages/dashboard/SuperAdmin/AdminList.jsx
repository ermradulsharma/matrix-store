import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import { fetchUsers } from '../../../services/api';
import { FaUserShield, FaEdit, FaTrash } from 'react-icons/fa';

const AdminList = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        try {
            const res = await fetchUsers();
            if (res.data.success) {
                setAdmins(res.data.users.filter(u => u.role === 'admin'));
            }
        } catch (error) {
            console.error('Error loading admins:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Admins</h2>
                <Button variant="primary">
                    <FaUserShield className="me-2" /> Create New Admin
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
                                <th>Last Login</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.length > 0 ? (
                                admins.map(admin => (
                                    <tr key={admin._id}>
                                        <td>{admin.first_name} {admin.last_name}</td>
                                        <td>{admin.email}</td>
                                        <td>
                                            <Badge bg={admin.isActive ? 'success' : 'danger'}>
                                                {admin.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td>{admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}</td>
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
                                    <td colSpan="5" className="text-center py-4">No admins found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default AdminList;
