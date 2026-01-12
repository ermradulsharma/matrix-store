import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Badge, Card, Tab, Nav, Alert } from "react-bootstrap";
import { Heart, HeartFill, Cart3, Truck, ShieldCheck, ArrowLeft } from "react-bootstrap-icons";
import { CartContext } from "../../../context/CartContext";
import { WishlistContext } from "../../../context/WishlistContext";
import RatingStars from "../RatingStars/RatingStars";
import Loader from "../Loader/Loader";
import { fetchProductById } from "../../../services/api";
import "../../../styles/components/ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useContext(CartContext);
  const { addToWishlist, wishlistItems } = useContext(WishlistContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.message || "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);


  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleAddToWishlist = () => {
    if (product) {
      addToWishlist(product);
    }
  };

  const isInWishlist = wishlistItems?.some((item) => (item._id || item.id) === (product?._id || product?.id));

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">Error: {error}</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="my-5">
        <Alert variant="warning">Product not found</Alert>
      </Container>
    );
  }

  const images = product.images?.map(img => img.url || img) || [product.thumbnail];
  const discountPrice = product.price - (product.price * (product.discountPercentage || 0)) / 100;


  return (
    <div className="product-details-page">
      <Container className="py-5">
        {/* Back Button */}
        <Button
          variant="link"
          className="mb-4 back-btn text-decoration-none text-muted p-0"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="me-2" />
          Back to Shopping
        </Button>

        <Row className="g-5">
          {/* Product Images */}
          <Col lg={6}>
            <div className="product-images-container">
              {/* Main Image */}
              <div className="main-image-wrapper mb-3">
                <img
                  src={images[selectedImage]}
                  alt={product.title}
                  className="main-image"
                />
                {product.discountPercentage > 0 && (
                  <Badge bg="danger" className="discount-badge-large">
                    -{product.discountPercentage}% OFF
                  </Badge>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="image-thumbnails-scroll">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`thumbnail-item ${selectedImage === idx ? 'active' : ''}`}
                      onClick={() => setSelectedImage(idx)}
                    >
                      <img src={img} alt={`${product.title} ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>

          {/* Product Info */}
          <Col lg={6}>
            <div className="product-info-wrapper">
              {/* Category & Brand */}
              <div className="product-meta-tags mb-3">
                <span className="text-uppercase text-muted fw-bold small tracking-wide">{product.category}</span>
                {product.brand && <span className="text-muted mx-2">•</span>}
                {product.brand && <span className="text-uppercase text-primary fw-bold small tracking-wide">{product.brand}</span>}
              </div>

              {/* Title */}
              <h1 className="product-title-large mb-3">{product.name || product.title}</h1>

              {/* Rating */}
              <div className="d-flex align-items-center mb-4">
                <div className="rating-stars me-2">
                  <RatingStars rating={product.rating || 0} size="1.1rem" />
                </div>
                <span className="text-muted small me-3">
                  ({product.rating?.toFixed(1) || 'N/A'} Rating)
                </span>
                <span className="border-start ps-3">
                  {product.stock > 0 ? (
                    <span className="text-success fw-bold small">
                      <ShieldCheck className="me-1" /> In Stock
                    </span>
                  ) : (
                    <span className="text-danger fw-bold small">Out of Stock</span>
                  )}
                </span>
              </div>

              {/* Price */}
              <div className="product-price-section mb-4 p-3 bg-light rounded-3">
                <div className="d-flex align-items-baseline gap-2">
                  <span className="display-5 fw-bold text-dark">${discountPrice.toFixed(2)}</span>
                  {product.discountPercentage > 0 && (
                    <>
                      <span className="text-muted text-decoration-line-through fs-5">${product.price.toFixed(2)}</span>
                      <span className="text-success fw-bold small">Save ${(product.price - discountPrice).toFixed(2)}</span>
                    </>
                  )}
                </div>
                <p className="text-muted small mb-0 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Description */}
              <div className="product-description-text mb-4">
                <p className="text-secondary lh-lg">{product.description}</p>
              </div>

              {/* Quantity Selector */}
              <div className="quantity-selector-wrapper mb-4">
                <label className="fw-bold mb-2 d-block">Quantity</label>
                <div className="d-flex align-items-center gap-3">
                  <div className="quantity-controls-group">
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <span className="qty-value">{quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-muted small">
                    {product.stock} items available
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons-grid mb-5">
                <Button
                  variant="primary"
                  size="lg"
                  className="add-to-cart-btn-large w-100"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <Cart3 className="me-2" />
                  Add to Cart
                </Button>
                <Button
                  variant={isInWishlist ? "danger" : "outline-secondary"}
                  size="lg"
                  className="wishlist-btn-large"
                  onClick={handleAddToWishlist}
                >
                  {isInWishlist ? <HeartFill /> : <Heart />}
                </Button>
              </div>

              {/* Features */}
              <div className="product-features-grid">
                <div className="feature-box">
                  <Truck className="feature-icon mb-2" size={24} />
                  <h6 className="fw-bold mb-1">Free Delivery</h6>
                  <p className="text-muted small mb-0">Orders over $50</p>
                </div>
                <div className="feature-box">
                  <ShieldCheck className="feature-icon mb-2" size={24} />
                  <h6 className="fw-bold mb-1">Secure Payment</h6>
                  <p className="text-muted small mb-0">100% Protected</p>
                </div>
                <div className="feature-box">
                  <ArrowLeft className="feature-icon mb-2" size={24} /> {/* Placeholder icon for return */}
                  <h6 className="fw-bold mb-1">Easy Returns</h6>
                  <p className="text-muted small mb-0">30 Days Policy</p>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Additional Info Tabs */}
        <Row className="mt-5">
          <Col>
            <Tab.Container defaultActiveKey="details">
              <Nav variant="tabs" className="product-tabs">
                <Nav.Item>
                  <Nav.Link eventKey="details">Product Details</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="reviews">Reviews</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="shipping">Shipping Info</Nav.Link>
                </Nav.Item>
              </Nav>
              <Tab.Content className="tab-content-custom">
                <Tab.Pane eventKey="details">
                  <h5>Product Specifications</h5>
                  <ul>
                    <li><strong>Brand:</strong> {product.brand || 'N/A'}</li>
                    <li><strong>Category:</strong> {product.category}</li>
                    <li><strong>SKU:</strong> {product.sku || product.id}</li>
                    <li><strong>Weight:</strong> {product.weight || 'N/A'} kg</li>
                    <li><strong>Dimensions:</strong> {product.dimensions?.width}x{product.dimensions?.height}x{product.dimensions?.depth} cm</li>
                    <li><strong>Warranty:</strong> {product.warrantyInformation || 'Standard warranty'}</li>
                    <li><strong>Return Policy:</strong> {product.returnPolicy || '30-day return policy'}</li>
                  </ul>
                </Tab.Pane>
                <Tab.Pane eventKey="reviews">
                  <h5 className="mb-4">Customer Reviews</h5>
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((review, idx) => (
                      <Card key={idx} className="review-card mb-3">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <strong>{review.reviewerName}</strong>
                              <div className="review-rating">
                                <RatingStars rating={review.rating} size="0.9rem" />
                              </div>
                            </div>
                            <small className="text-muted">{new Date(review.date).toLocaleDateString()}</small>
                          </div>
                          <p className="mb-0">{review.comment}</p>
                        </Card.Body>
                      </Card>
                    ))
                  ) : (
                    <p className="text-muted">No reviews yet. Be the first to review this product!</p>
                  )}
                </Tab.Pane>
                <Tab.Pane eventKey="shipping">
                  <h5>Shipping Information</h5>
                  <p><strong>Shipping:</strong> {product.shippingInformation || 'Ships within 2-3 business days'}</p>
                  <p><strong>Availability:</strong> {product.availabilityStatus || 'In Stock'}</p>
                  <p><strong>Minimum Order Quantity:</strong> {product.minimumOrderQuantity || 1}</p>
                  <ul>
                    <li>Free standard shipping on orders over $50</li>
                    <li>Express shipping available at checkout</li>
                    <li>International shipping available to select countries</li>
                    <li>Estimated delivery: 5-7 business days</li>
                  </ul>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ProductDetails;
