import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { fetchUsers, deleteUserProfile } from '../../../services/api';
import { FaUserShield, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const AdminList = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const loadAdmins = React.useCallback(async () => {
        try {
            const res = await fetchUsers();
            if (res.data.success) {
                setAdmins(res.data.users.filter(u => u.role === 'admin'));
            }
        } catch (error) {
            console.error('Error loading admins:', error);
            setError('Failed to load admins');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAdmins();
    }, [loadAdmins]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this admin?')) {
            try {
                const res = await deleteUserProfile(id);
                if (res.data.success) {
                    setSuccess('Admin deleted successfully');
                    setAdmins(admins.filter(a => a._id !== id));
                    setTimeout(() => setSuccess(null), 3000);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete admin');
                setTimeout(() => setError(null), 3000);
            }
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Admins</h2>
                <Button variant="primary" onClick={() => navigate('/admins/new')}>
                    <FaUserShield className="me-2" /> Create New Admin
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

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
                                                <Link to={`/admins/view/${admin._id}`} className="btn btn-sm btn-info text-white me-2">
                                                    <FaEye />
                                                </Link>
                                                <Button variant="outline-primary" size="sm" onClick={() => navigate(`/admins/edit/${admin._id}`)} className="me-2">
                                                    <FaEdit />
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(admin._id)}>
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
