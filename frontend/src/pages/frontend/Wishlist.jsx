import React, { useContext } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../../context/WishlistContext';
import { CartContext } from '../../context/CartContext';
import ProductCard from '../../components/frontend/ProductCard/ProductCard';
import '../../styles/pages/Wishlist.css';

const Wishlist = () => {
    const { wishlistItems, clearWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);

    const handleMoveAllToCart = () => {
        wishlistItems.forEach(item => addToCart(item));
        clearWishlist();
    };

    if (wishlistItems.length === 0) {
        return (
            <Container className="my-5">
                <div className="empty-wishlist">
                    <h2>Your wishlist is empty</h2>
                    <p className="text-muted mb-4">Save items you love for later!</p>
                    <Link to="/shop">
                        <Button variant="primary" size="lg">Browse Products</Button>
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <Container className="my-4 wishlist-page">
            <div className="wishlist-header">
                <Row className="align-items-center">
                    <Col>
                        <h1>My Wishlist ({wishlistItems.length} items)</h1>
                    </Col>
                    <Col xs="auto">
                        <div className="wishlist-actions">
                            <Button variant="light" size="lg" onClick={handleMoveAllToCart}>
                                Move All to Cart
                            </Button>
                            <Button variant="danger" size="lg" outline onClick={clearWishlist}>
                                Clear Wishlist
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>
            <Row className="g-4 fade-in">
                {wishlistItems.map((product) => (
                    <Col key={product.id} xs={12} sm={6} md={4} lg={3}>
                        <ProductCard product={product} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Wishlist;
