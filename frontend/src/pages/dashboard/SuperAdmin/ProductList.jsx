import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Form, InputGroup, Pagination, Container, Card } from 'react-bootstrap';
import { fetchProducts, deleteProduct, toggleProductStatus } from '../../../services/api';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaSearch, FaPlus, FaBoxOpen, FaToggleOn, FaToggleOff, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import StockManagementModal from '../Common/StockManagementModal';
import { toast } from 'react-toastify';

const ProductList = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showStockModal, setShowStockModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const LIMIT = 10;

    const getDashboardPrefix = () => {
        if (user?.role === 'super_admin') return '/products';
        if (user?.role === 'admin') return '/admin/products';
        if (user?.role === 'manager') return '/manager/products';
        if (user?.role === 'provider') return '/provider/products';
        return '/dashboard';
    };

    const prefix = getDashboardPrefix();

    const loadProducts = React.useCallback(async () => {
        setLoading(true);
        try {
            const skip = (currentPage - 1) * LIMIT;
            const res = await fetchProducts({ limit: LIMIT, skip, search });
            setProducts(res.products);
            setTotalPages(Math.ceil(res.total / LIMIT));
        } catch (error) {
            console.error('Error loading products:', error);
            toast.error("Failed to load products");
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
                toast.success("Product deleted successfully");
                loadProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error(error.response?.data?.message || 'Failed to delete product');
            }
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await toggleProductStatus(id);
            toast.success(`Product ${currentStatus === 'active' ? 'deactivated' : 'activated'}`);
            loadProducts();
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update product status');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadProducts();
    };

    return (
        <Container fluid>
            <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white py-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                            <FaBoxOpen className="text-primary me-2" size={20} />
                            <h4 className="fw-bold text-dark mb-0">Product Management</h4>
                        </div>
                        <Link to={`${prefix}/new`} className="btn btn-primary d-flex align-items-center">
                            <FaPlus className="me-2" /> Add New Product
                        </Link>
                    </div>
                    <Form onSubmit={handleSearch}>
                        <InputGroup>
                            <InputGroup.Text className="bg-light border-end-0"><FaSearch className="text-muted" /></InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search products by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-light border-start-0 ps-0"
                            />
                            <Button type="submit" variant="primary">Search</Button>
                        </InputGroup>
                    </Form>
                </Card.Header>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
                    ) : (
                        <Table responsive hover className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4 py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Product</th>
                                    <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Price</th>
                                    <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Stock</th>
                                    <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Status</th>
                                    <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Rating</th>
                                    <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Owner</th>
                                    <th className="pe-4 py-3 text-end text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length > 0 ? (
                                    products.map(product => (
                                        <tr key={product._id}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded border d-flex align-items-center justify-content-center bg-light me-3" style={{ width: '50px', height: '50px', overflow: 'hidden' }}>
                                                        <img
                                                            src={product.images && product.images[0] ? product.images[0].url : 'https://via.placeholder.com/50'}
                                                            alt={product.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <h6 className="mb-0 fw-bold text-dark">{product.name}</h6>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <span className="text-secondary text-sm font-weight-bold">${product.price}</span>
                                            </td>
                                            <td className="py-3">
                                                <Badge bg={product.stock > 0 ? 'success' : 'danger'} className="rounded-pill px-3">
                                                    {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                                                </Badge>
                                            </td>
                                            <td className="py-3">
                                                <Badge bg={product.status === 'active' ? 'success' : 'warning'} className="text-capitalize fs-7">
                                                    {product.status || 'active'}
                                                </Badge>
                                            </td>
                                            <td className="py-3">
                                                <div className="d-flex align-items-center">
                                                    <span className="text-warning me-1">★</span>
                                                    <span className="text-secondary text-sm fw-bold">{product.ratings.toFixed(1)}</span>
                                                    <span className="text-muted text-xs ms-1">({product.numOfReviews})</span>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                {product.user_id ? (
                                                    <div className="d-flex flex-column">
                                                        <span className="text-dark text-sm fw-bold">{product.user_id.name}</span>
                                                        <Badge bg="info" className="text-capitalize w-auto align-self-start" style={{ fontSize: '0.65rem' }}>
                                                            {product.user_id.role}
                                                        </Badge>
                                                    </div>
                                                ) : <span className="text-muted text-sm fst-italic">Unknown</span>}
                                            </td>
                                            <td className="pe-4 py-3 text-end">
                                                <div className="btn-group">
                                                    {/* View Link: Use internal dashboard route */}
                                                    <Link to={`${prefix}/view/${product._id}`} className="btn btn-sm btn-link text-info p-1" title="View Product">
                                                        <FaEye size={16} />
                                                    </Link>
                                                    {/* Configure Edit Link */}
                                                    <Link to={`${prefix}/edit/${product._id}`} className="btn btn-sm btn-link text-primary p-1" title="Edit Product">
                                                        <FaEdit size={16} />
                                                    </Link>

                                                    {/* Toggle Status Button */}
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className={product.status === 'active' ? 'text-warning p-1' : 'text-success p-1'}
                                                        onClick={() => handleToggleStatus(product._id, product.status)}
                                                        title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {product.status === 'active' ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
                                                    </Button>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="text-secondary p-1"
                                                        onClick={() => { setSelectedProduct(product); setShowStockModal(true); }}
                                                        title="Manage Stock"
                                                    >
                                                        <FaClipboardList size={16} />
                                                    </Button>

                                                    <Button variant="link" size="sm" className="text-danger p-1" onClick={() => handleDelete(product._id)} title="Delete Product">
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
                                                    <FaBoxOpen size={40} className="opacity-25" />
                                                </div>
                                                <p className="text-muted mb-0">No products found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
                {totalPages > 1 && (
                    <Card.Footer className="bg-white py-3 border-top-0 d-flex justify-content-center">
                        <Pagination className="mb-0">
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
                    </Card.Footer>
                )}
            </Card>
            <StockManagementModal
                show={showStockModal}
                onHide={() => setShowStockModal(false)}
                product={selectedProduct}
                onSuccess={loadProducts}
            />
        </Container>
    );
};

export default ProductList;
