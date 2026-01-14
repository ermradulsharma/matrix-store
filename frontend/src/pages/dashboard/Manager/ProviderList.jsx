import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Badge, Spinner, Container, Card } from 'react-bootstrap';
import { fetchProviders, toggleProviderStatus, deleteProvider } from '../../../services/api';
import { Link } from 'react-router-dom';
import { FaPlus, FaEye, FaUserPlus, FaEdit, FaToggleOn, FaToggleOff, FaTrash, FaUserEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProviderList = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadProviders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchProviders();
            setProviders(res.data.providers || []);
        } catch (error) {
            console.error('Error loading providers:', error);
            toast.error("Failed to load providers");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProviders();
    }, [loadProviders]);

    const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus === 'active' ? 'deactivate' : 'activate';
        if (window.confirm(`Are you sure you want to ${action} this provider?`)) {
            try {
                const res = await toggleProviderStatus(id);
                if (res.data.success) {
                    toast.success(`Provider ${action}d successfully`);
                    loadProviders();
                }
            } catch (error) {
                console.error('Error updating provider status:', error);
                toast.error('Failed to update status');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to PERMANENTLY delete this provider and their user account? This action cannot be undone.')) {
            try {
                await deleteProvider(id);
                loadProviders();
                toast.success('Provider deleted successfully');
            } catch (error) {
                console.error('Error deleting provider:', error);
                toast.error('Failed to delete provider');
            }
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <Container fluid>
            <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <FaUserPlus className="text-primary me-2" size={20} />
                        <h4 className="fw-bold text-dark mb-0">Providers Management</h4>
                    </div>
                    <div>
                        <Link to="new" className="btn btn-outline-primary me-2 d-inline-flex align-items-center">
                            <FaUserPlus className="me-2" /> Create Provider User
                        </Link>
                        <Link to="profile" className="btn btn-primary d-inline-flex align-items-center">
                            <FaPlus className="me-2" /> Add Provider Profile
                        </Link>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Company</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Contact Person</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Email</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Status</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Rating</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Managed By</th>
                                <th className="pe-4 py-3 text-end text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {providers.length > 0 ? (
                                providers.map(provider => (
                                    <tr key={provider._id}>
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="avatar rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3 overflow-hidden" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                                                    {provider.user?.image?.url && provider.user.image.url !== 'default_url' ? (
                                                        <img
                                                            src={provider.user.image.url.startsWith('http') ? provider.user.image.url : `http://localhost:5000${provider.user.image.url}`}
                                                            alt={provider.companyName}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        provider.companyName.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <h6 className="mb-0 fw-bold text-dark">{provider.companyName}</h6>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-secondary text-sm fw-bold">{provider.contactPerson.name}</span>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-secondary text-sm">{provider.contactPerson.email}</span>
                                        </td>
                                        <td className="py-3">
                                            <Badge bg={provider.status === 'active' ? 'success' : 'danger'} className="rounded-pill px-3">
                                                {provider.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-sm fw-bold text-warning">★ {provider.rating} / 5</span>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-secondary text-sm">{provider.manager?.first_name || <span className="text-muted fst-italic">N/A</span>}</span>
                                        </td>
                                        <td className="pe-4 py-3 text-end">
                                            <div className="btn-group">
                                                <Link to={`view/${provider.user?._id}`} className="btn btn-sm btn-link text-info p-1" title="View User">
                                                    <FaEye size={16} />
                                                </Link>
                                                <Link to={`profile/edit/${provider._id}`} className="btn btn-sm btn-link text-primary p-1" title="Edit Profile">
                                                    <FaEdit size={16} />
                                                </Link>
                                                <Link to={`edit/${provider.user?._id}`} className="btn btn-sm btn-link text-dark p-1" title="Edit User Account">
                                                    <FaUserEdit size={16} />
                                                </Link>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className={`p-1 ${provider.status === 'active' ? 'text-warning' : 'text-success'}`}
                                                    onClick={() => handleToggleStatus(provider._id, provider.status)}
                                                    title={provider.status === 'active' ? 'Deactivate' : 'Activate'}
                                                >
                                                    {provider.status === 'active' ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                                                </Button>
                                                <Button variant="link" size="sm" className="text-danger p-1" onClick={() => handleDelete(provider._id)} title="Delete">
                                                    <FaTrash size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <div className="d-flex flex-column align-items-center justify-content-center">
                                            <div className="text-muted mb-2">
                                                <FaUserPlus size={40} className="opacity-25" />
                                            </div>
                                            <p className="text-muted mb-0">No providers found</p>
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

export default ProviderList;
