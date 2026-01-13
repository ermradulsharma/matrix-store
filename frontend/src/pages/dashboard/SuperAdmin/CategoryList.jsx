import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { fetchCategories, deleteCategory, toggleCategoryStatus } from '../../../services/api';
import { FaTrash, FaEdit, FaToggleOn, FaToggleOff, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            setError('Failed to load categories');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? This cannot be undone.')) {
            try {
                const res = await deleteCategory(id);
                if (res.success) {
                    setCategories(categories.filter(cat => cat._id !== id));
                }
            } catch (err) {
                alert('Failed to delete category');
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await toggleCategoryStatus(id);
            if (res.success) {
                setCategories(categories.map(cat =>
                    cat._id === id ? { ...cat, status: res.status } : cat
                ));
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <Spinner animation="border" variant="primary" />
        </div>
    );

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark">Category Management</h2>
                <Button variant="primary" onClick={() => navigate('new')}>
                    <FaPlus className="me-2" /> Add New Category
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="card border-0 shadow-sm">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="border-0 py-3 ps-4">Image</th>
                            <th className="border-0 py-3">Title</th>
                            <th className="border-0 py-3">Slug</th>
                            <th className="border-0 py-3">Status</th>
                            <th className="border-0 py-3 text-end pe-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length > 0 ? (
                            categories.map(category => (
                                <tr key={category._id}>
                                    <td className="ps-4">
                                        <div style={{ width: '50px', height: '50px', overflow: 'hidden', borderRadius: '8px' }}>
                                            <img
                                                src={category.image?.url || 'https://via.placeholder.com/50'}
                                                alt={category.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    </td>
                                    <td className="fw-bold">{category.title}</td>
                                    <td className="text-muted">{category.slug}</td>
                                    <td>
                                        <Badge bg={category.status === 'active' ? 'success' : 'secondary'} className="px-3 py-2 rounded-pill">
                                            {category.status || 'Active'}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="me-2 text-primary"
                                            onClick={() => navigate(`edit/${category._id}`)}
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className={`me-2 ${category.status === 'active' ? 'text-warning' : 'text-success'}`}
                                            onClick={() => handleToggleStatus(category._id)}
                                            title={category.status === 'active' ? 'Deactivate' : 'Activate'}
                                        >
                                            {category.status === 'active' ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                                        </Button>
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="text-danger"
                                            onClick={() => handleDelete(category._id)}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-5 text-muted">
                                    No categories found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default CategoryList;
