import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Form, InputGroup, Pagination } from 'react-bootstrap';
import { fetchProducts, deleteProduct } from '../../../services/api'; // Ensure deleteProduct is available
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaSearch, FaPlus, FaBoxOpen } from 'react-icons/fa';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

    const loadProducts = React.useCallback(async () => {
        setLoading(true);
        try {
            // Calculate skip based on page
            const skip = (currentPage - 1) * LIMIT;
            const res = await fetchProducts({ limit: LIMIT, skip, search });

            setProducts(res.products);
            setTotalPages(Math.ceil(res.total / LIMIT));
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, search]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                loadProducts(); // Refresh list
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product');
            }
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to page 1 on search
        loadProducts();
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2><FaBoxOpen className="me-2" />Product Management</h2>
                <Link to="/dashboard/super-admin/products/new" className="btn btn-primary">
                    <FaPlus className="me-2" /> Add New Product
                </Link>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <Form onSubmit={handleSearch}>
                        <InputGroup>
                            <InputGroup.Text><FaSearch /></InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search products by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button type="submit" variant="outline-primary">Search</Button>
                        </InputGroup>
                    </Form>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center p-5"><Spinner animation="border" /></div>
                    ) : (
                        <Table responsive hover className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Category</th>
                                    <th>Rating</th>
                                    <th>Owner</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length > 0 ? (
                                    products.map(product => (
                                        <tr key={product._id}>
                                            <td>
                                                <img
                                                    src={product.images && product.images[0] ? product.images[0].url : 'https://via.placeholder.com/50'}
                                                    alt={product.name}
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            </td>
                                            <td>{product.name}</td>
                                            <td>${product.price}</td>
                                            <td>
                                                <Badge bg={product.stock > 0 ? 'success' : 'danger'}>
                                                    {product.stock > 0 ? product.stock : 'Out of Stock'}
                                                </Badge>
                                            </td>
                                            <td>{product.category}</td>
                                            <td>{product.ratings.toFixed(1)} ({product.numOfReviews})</td>
                                            <td>
                                                {product.user_id ? (
                                                    <small>
                                                        {product.user_id.name} <br />
                                                        <Badge bg="secondary" className="text-capitalize">{product.user_id.role}</Badge>
                                                    </small>
                                                ) : <span className="text-muted">Unknown</span>}
                                            </td>
                                            <td>
                                                <div className="btn-group">
                                                    <Link to={`/product/${product._id}`} className="btn btn-sm btn-outline-info" target="_blank">
                                                        <FaEye />
                                                    </Link>
                                                    <Link to={`/dashboard/super-admin/product/edit/${product._id}`} className="btn btn-sm btn-outline-primary">
                                                        <FaEdit />
                                                    </Link>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(product._id)}>
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">No products found</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="card-footer bg-white d-flex justify-content-center">
                        <Pagination>
                            <Pagination.Prev
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            />
                            {[...Array(totalPages).keys()].map(x => (
                                <Pagination.Item
                                    key={x + 1}
                                    active={x + 1 === currentPage}
                                    onClick={() => setCurrentPage(x + 1)}
                                >
                                    {x + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            />
                        </Pagination>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
