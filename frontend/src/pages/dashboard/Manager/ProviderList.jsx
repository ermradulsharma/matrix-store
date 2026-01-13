import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import { fetchProviders, toggleProviderStatus, deleteProvider } from '../../../services/api';
import { Link } from 'react-router-dom';
import { FaPlus, FaEye, FaUserPlus, FaEdit, FaToggleOn, FaToggleOff, FaTrash, FaUserEdit } from 'react-icons/fa';

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
                    loadProviders();
                }
            } catch (error) {
                console.error('Error updating provider status:', error);
                alert('Failed to update status');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to PERMANENTLY delete this provider and their user account? This action cannot be undone.')) {
            try {
                await deleteProvider(id);
                loadProviders();
                alert('Provider deleted successfully');
            } catch (error) {
                console.error('Error deleting provider:', error);
                alert('Failed to delete provider');
            }
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Providers</h2>
                <div>
                    <Link to="new" className="btn btn-secondary me-2">
                        <FaUserPlus className="me-2" /> Create Provider User
                    </Link>
                    <Link to="profile" className="btn btn-primary">
                        <FaPlus className="me-2" /> Add Provider Profile
                    </Link>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Company</th>
                                <th>Contact Person</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Rating</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {providers.length > 0 ? (
                                providers.map(provider => (
                                    <tr key={provider._id}>
                                        <td>{provider.companyName}</td>
                                        <td>{provider.contactPerson.name}</td>
                                        <td>{provider.contactPerson.email}</td>
                                        <td>
                                            <Badge bg={provider.status === 'active' ? 'success' : 'danger'}>
                                                {provider.status}
                                            </Badge>
                                        </td>
                                        <td>{provider.rating} / 5</td>
                                        <td>
                                            <div className="btn-group">
                                                <Link to={`profile/edit/${provider._id}`} className="btn btn-sm btn-primary me-1" title="Edit Profile">
                                                    <FaEdit />
                                                </Link>
                                                <Link to={`edit/${provider.user?._id}`} className="btn btn-sm btn-secondary me-1" title="Edit User Account">
                                                    <FaUserEdit />
                                                </Link>
                                                <Link to={`view/${provider.user?._id}`} className="btn btn-sm btn-info text-white me-1" title="View User">
                                                    <FaEye />
                                                </Link>
                                                <Button
                                                    variant={provider.status === 'active' ? 'warning' : 'success'}
                                                    size="sm"
                                                    className="me-1"
                                                    onClick={() => handleToggleStatus(provider._id, provider.status)}
                                                    title={provider.status === 'active' ? 'Deactivate' : 'Activate'}
                                                >
                                                    {provider.status === 'active' ? <FaToggleOn /> : <FaToggleOff />}
                                                </Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(provider._id)} title="Delete">
                                                    <FaTrash />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">No providers found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default ProviderList;
