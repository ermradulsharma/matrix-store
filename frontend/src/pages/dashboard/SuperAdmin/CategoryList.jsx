import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Container, Card } from 'react-bootstrap';
import { fetchCategories, deleteCategory, toggleCategoryStatus } from '../../../services/api';
import { FaTrash, FaEdit, FaToggleOn, FaToggleOff, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
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
            toast.error('Failed to load categories');
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
                    toast.success("Category Deleted!");
                }
            } catch (err) {
                toast.error('Failed to delete category');
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
                toast.success(`Category ${res.status === 'active' ? 'activated' : 'deactivated'}`);
            }
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <Spinner animation="border" variant="primary" />
        </div>
    );

    return (
        <Container fluid>
            <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <FaPlus className="text-primary me-2" size={20} />
                        <h4 className="fw-bold text-dark mb-0">Category Management</h4>
                    </div>
                    <Button variant="primary" onClick={() => navigate('new')} className="d-flex align-items-center">
                        <FaPlus className="me-2" /> Add New Category
                    </Button>
                </Card.Header>
                <Card.Body className="p-0">

                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Image</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Title</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Slug</th>
                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Status</th>
                                <th className="pe-4 py-3 text-end text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length > 0 ? (
                                categories.map(category => (
                                    <tr key={category._id}>
                                        <td className="ps-4 py-3">
                                            <div className="avatar rounded border d-flex align-items-center justify-content-center bg-light" style={{ width: '50px', height: '50px', overflow: 'hidden' }}>
                                                <img
                                                    src={category.image?.url || 'https://via.placeholder.com/50'}
                                                    alt={category.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <h6 className="mb-0 fw-bold text-dark">{category.title}</h6>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-secondary text-sm">{category.slug}</span>
                                        </td>
                                        <td className="py-3">
                                            <Badge bg={category.status === 'active' ? 'success' : 'secondary'} className="rounded-pill px-3">
                                                {category.status || 'Active'}
                                            </Badge>
                                        </td>
                                        <td className="pe-4 py-3 text-end">
                                            <div className="btn-group">
                                                <Button variant="link" size="sm" className="text-primary p-1" title="Edit" onClick={() => navigate(`edit/${category._id}`)}>
                                                    <FaEdit size={16} />
                                                </Button>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className={`p-1 ${category.status === 'active' ? 'text-warning' : 'text-success'}`}
                                                    title={category.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    onClick={() => handleToggleStatus(category._id)}
                                                >
                                                    {category.status === 'active' ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                                                </Button>
                                                <Button variant="link" size="sm" className="text-danger p-1" title="Delete" onClick={() => handleDelete(category._id)}>
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
                                                <FaPlus size={40} className="opacity-25" />
                                            </div>
                                            <p className="text-muted mb-0">No categories found</p>
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

export default CategoryList;
