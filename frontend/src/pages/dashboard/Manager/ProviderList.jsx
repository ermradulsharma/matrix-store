import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import { fetchProviders, deactivateProvider } from '../../../services/api';
import { Link } from 'react-router-dom';
import { FaPlus, FaEye } from 'react-icons/fa';

const ProviderList = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadProviders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchProviders();
            // fetchProviders calls /providers which usually returns only providers or needs filtering?
            // api.js: export const fetchProviders = () => api.get("/providers");
            // Assuming it returns correct data structure
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

    const handleDeactivate = async (id) => {
        if (window.confirm('Are you sure you want to deactivate this provider?')) {
            try {
                await deactivateProvider(id);
                loadProviders();
            } catch (error) {
                console.error('Error deactivating provider:', error);
            }
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Providers</h2>
                <Link to="/dashboard/manager/providers/new" className="btn btn-primary">
                    <FaPlus className="me-2" /> Add Provider
                </Link>
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
                                                <Link to={`/dashboard/user/${provider.user?._id}`} className="btn btn-sm btn-info text-white me-2">
                                                    <FaEye />
                                                </Link>
                                                <Button variant="warning" size="sm" onClick={() => handleDeactivate(provider._id)}>
                                                    Deactivate
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
