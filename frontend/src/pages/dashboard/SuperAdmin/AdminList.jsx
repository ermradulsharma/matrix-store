import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Alert, Container, Card } from 'react-bootstrap';
import { fetchUsers, deleteUserProfile } from '../../../services/api';
import { FaUserShield, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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
        <Container fluid>
            <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <FaUserShield className="text-primary me-2" size={20} />
                        <h4 className="fw-bold text-dark mb-0">Manage Admins</h4>
                    </div>
                    <Button variant="primary" onClick={() => navigate('/admins/new')} className="d-flex align-items-center">
                        <FaUserShield className="me-2" /> Create New Admin
                    </Button>
                </Card.Header>
                <Card.Body className="p-0">
                    {error && <Alert variant="danger" className="m-3">{error}</Alert>}
                    {success && <Alert variant="success" className="m-3">{success}</Alert>}

                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Name</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Email</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Status</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Last Login</th>
                                <th className="pe-4 py-3 text-end text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.length > 0 ? (
                                admins.map(admin => (
                                    <tr key={admin._id}>
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="avatar rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                                                    {admin.first_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h6 className="mb-0 fw-bold text-dark">{admin.first_name} {admin.last_name}</h6>
                                                    <small className="text-muted">@{admin.username || admin.first_name.toLowerCase()}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-secondary text-sm font-weight-bold">{admin.email}</span>
                                        </td>
                                        <td className="py-3">
                                            <Badge bg={admin.isActive ? 'success' : 'danger'} className="rounded-pill px-3">
                                                {admin.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-secondary text-sm">
                                                {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                                            </span>
                                        </td>
                                        <td className="pe-4 py-3 text-end">
                                            <div className="btn-group">
                                                <Button variant="link" size="sm" className="text-info p-1" title="View Details" onClick={() => navigate(`/admins/view/${admin._id}`)}>
                                                    <FaEye size={16} />
                                                </Button>
                                                <Button variant="link" size="sm" className="text-primary p-1" title="Edit" onClick={() => navigate(`/admins/edit/${admin._id}`)}>
                                                    <FaEdit size={16} />
                                                </Button>
                                                <Button variant="link" size="sm" className="text-danger p-1" title="Delete" onClick={() => handleDelete(admin._id)}>
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
                                                <FaUserShield size={40} className="opacity-25" />
                                            </div>
                                            <p className="text-muted mb-0">No admins found</p>
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

export default AdminList;
