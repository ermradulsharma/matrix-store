import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, ButtonGroup } from 'react-bootstrap';
import { Grid3x3Gap, ListUl, Funnel } from 'react-bootstrap-icons';
import { fetchProducts } from '../../services/api';
import ProductCard from '../../components/frontend/ProductCard/ProductCard';
import Loader from '../../components/frontend/Loader/Loader';
import Pagination from '../../components/frontend/Pagination/Pagination';
import SearchBar from '../../components/frontend/SearchBar/SearchBar';
import CategoryFilter from '../../components/frontend/CategoryFilter/CategoryFilter';
import { toast } from 'react-toastify';
import '../../styles/pages/Shop.css';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [priceRange, setPriceRange] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(true);
    const productsPerPage = 12;

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const skip = (currentPage - 1) * productsPerPage;
                const data = await fetchProducts({
                    limit: productsPerPage,
                    skip,
                    search: searchQuery,
                    category,
                });

                const productsList = data.products || data;
                setProducts(Array.isArray(productsList) ? productsList : []);
                setTotalPages(Math.ceil((data.total || productsList.length) / productsPerPage));
            } catch (error) {
                console.error('Error loading products:', error);
                toast.error('Failed to load products. Please try again later.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [currentPage, searchQuery, category, productsPerPage]);

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    }, []);

    const handleCategoryChange = useCallback((cat) => {
        setCategory(cat);
        setCurrentPage(1);
    }, []);

    const handleSortChange = useCallback((e) => {
        setSortBy(e.target.value);
    }, []);

    const handleClearFilters = useCallback(() => {
        setCategory('');
        setPriceRange('all');
        setSearchQuery('');
        setCurrentPage(1);
    }, []);

    // Filter by price range
    const priceFilteredProducts = products.filter((product) => {
        const price = product.price || 0;
        if (priceRange === 'all') return true;
        if (priceRange === 'under50') return price < 50;
        if (priceRange === '50to100') return price >= 50 && price <= 100;
        if (priceRange === '100to500') return price > 100 && price <= 500;
        if (priceRange === 'over500') return price > 500;
        return true;
    });

    // Sort products
    const sortedProducts = [...priceFilteredProducts].sort((a, b) => {
        if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'name') return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
    });

    return (
        <div className="shop-page">
            {/* Page Header */}
            <div className="shop-header">
                <Container>
                    <h1 className="text-center mb-2">Shop Our Products</h1>
                    <p className="text-center mb-0">Discover amazing products at great prices</p>
                </Container>
            </div>

            <Container className="my-4">
                <Row>
                    {/* Sidebar Filters */}
                    {showFilters && (
                        <Col lg={3} className="mb-4">
                            <div className="filters-sidebar">
                                <div className="filters-header">
                                    <h5>
                                        <Funnel className="me-2" /> Filters
                                    </h5>
                                    <Button variant="link" size="sm" onClick={handleClearFilters}>Clear All</Button>
                                </div>

                                {/* Search */}
                                <div className="filter-section">
                                    <h6 className="filter-title">Search</h6>
                                    <SearchBar onSearch={handleSearch} placeholder="Search products..." />
                                </div>

                                {/* Category Filter */}
                                <div className="filter-section">
                                    <h6 className="filter-title">Category</h6>
                                    <CategoryFilter onCategoryChange={handleCategoryChange} />
                                </div>

                                {/* Price Filter */}
                                <div className="filter-section">
                                    <h6 className="filter-title">Price Range</h6>
                                    <Form.Check type="radio" label="All Prices" name="priceRange" value="all" checked={priceRange === 'all'} onChange={(e) => {
                                        setPriceRange(e.target.value);
                                        setCurrentPage(1);
                                    }} />
                                    <Form.Check type="radio" label="Under $50" name="priceRange" value="under50" checked={priceRange === 'under50'} onChange={(e) => {
                                        setPriceRange(e.target.value);
                                        setCurrentPage(1);
                                    }} />
                                    <Form.Check type="radio" label="$50 - $100" name="priceRange" value="50to100" checked={priceRange === '50to100'} onChange={(e) => {
                                        setPriceRange(e.target.value);
                                        setCurrentPage(1);
                                    }} />
                                    <Form.Check type="radio" label="$100 - $500" name="priceRange" value="100to500" checked={priceRange === '100to500'} onChange={(e) => {
                                        setPriceRange(e.target.value);
                                        setCurrentPage(1);
                                    }} />
                                    <Form.Check type="radio" label="Over $500" name="priceRange" value="over500" checked={priceRange === 'over500'} onChange={(e) => {
                                        setPriceRange(e.target.value);
                                        setCurrentPage(1);
                                    }} />
                                </div>
                            </div>
                        </Col>
                    )}

                    {/* Products Grid */}
                    <Col lg={showFilters ? 9 : 12}>
                        {/* Toolbar */}
                        <div className="products-toolbar">
                            <div className="toolbar-left">
                                <Button variant="outline-secondary" size="sm" className="d-lg-none me-2" onClick={() => setShowFilters(!showFilters)}>
                                    <Funnel className="me-1" /> Filters
                                </Button>
                                <span className="results-count">
                                    {sortedProducts.length} Products Found
                                </span>
                            </div>

                            <div className="toolbar-right">
                                <Form.Select size="sm" value={sortBy} onChange={handleSortChange} className="sort-select">
                                    <option value="default">Sort by: Default</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="name">Name: A-Z</option>
                                    <option value="rating">Highest Rated</option>
                                </Form.Select>

                                <ButtonGroup size="sm" className="view-toggle ms-2 d-none d-md-flex">
                                    <Button variant={viewMode === 'grid' ? 'primary' : 'outline-primary'} onClick={() => setViewMode('grid')}>
                                        <Grid3x3Gap />
                                    </Button>
                                    <Button variant={viewMode === 'list' ? 'primary' : 'outline-primary'} onClick={() => setViewMode('list')}>
                                        <ListUl />
                                    </Button>
                                </ButtonGroup>
                            </div>
                        </div>



                        {/* Products */}
                        {loading ? (
                            <Loader />
                        ) : sortedProducts.length === 0 ? (
                            <div className="no-products">
                                <h4>No products found</h4>
                                <p>Try adjusting your search or filter criteria</p>
                            </div>
                        ) : (
                            <>
                                <Row className={`products-${viewMode} g-4 fade-in`}>
                                    {sortedProducts.map((product) => (
                                        <Col key={product.id} xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} lg={viewMode === 'grid' ? (showFilters ? 4 : 3) : 12}>
                                            <ProductCard product={product} />
                                        </Col>
                                    ))}
                                </Row>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-4">
                                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                    </div>
                                )}
                            </>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Shop;
