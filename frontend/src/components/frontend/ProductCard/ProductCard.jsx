import React, { useContext } from "react";
import { Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Heart, HeartFill, Cart3, Eye } from "react-bootstrap-icons";
import { CartContext } from "../../../context/CartContext";
import { WishlistContext } from "../../../context/WishlistContext";
import RatingStars from "../RatingStars/RatingStars";
import "../../../styles/components/ProductCard.css";

function ProductCard({ product, title, description, imageUrl, price, buttonLink }) {
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, wishlistItems } = useContext(WishlistContext);

  // Support both formats: product object or individual props
  const productData = product || {
    id: Date.now(),
    title,
    description,
    image: imageUrl,
    price,
    rating: 0,
  };

  const productTitle = productData.name || productData.title || title;
  const productDesc = productData.description || description;
  const productImage = productData.images?.[0]?.url || productData.thumbnail || productData.image || imageUrl;
  const productPrice = productData.price || price;
  const productId = productData._id || productData.id;
  const productRating = productData.ratings || productData.rating?.rate || productData.rating || 0;
  const productLink = buttonLink || `/product/${productId}`;
  const discountPercentage = productData.discountPercentage || 0;


  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(productData);
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(productData);
  };

  const isInWishlist = wishlistItems?.some((item) => item.id === productId);

  return (
    <div className="product-card">
      {/* Badges */}
      <div className="product-card-badges">
        {discountPercentage > 0 && (
          <Badge bg="danger" className="product-badge">
            -{discountPercentage}% OFF
          </Badge>
        )}
        {productData.stock < 10 && productData.stock > 0 && (
          <Badge bg="warning" text="dark" className="product-badge">
            Low Stock
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        className="product-wishlist-btn"
        onClick={handleAddToWishlist}
        title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        {isInWishlist ? (
          <HeartFill className="text-danger" size={20} />
        ) : (
          <Heart size={20} />
        )}
      </button>

      {/* Product Image */}
      <Link to={productLink} className="product-card-image-wrapper">
        <div className="product-card-image-container">
          <img
            src={productImage}
            alt={productTitle}
            className="product-card-image"
            loading="lazy"
          />
          <div className="product-card-overlay">
            <Button variant="light" size="sm" className="quick-view-btn">
              <Eye className="me-1" /> Quick View
            </Button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="product-card-body">
        <Link to={productLink} className="text-decoration-none">
          <h6 className="product-card-title">
            {productTitle?.length > 50
              ? `${productTitle.substring(0, 50)}...`
              : productTitle}
          </h6>
        </Link>

        {productRating > 0 && (
          <div className="product-card-rating">
            <RatingStars rating={productRating} size="0.85rem" />
            <span className="rating-text">({productRating.toFixed(1)})</span>
          </div>
        )}

        <p className="product-card-description">
          {productDesc?.length > 60
            ? `${productDesc.substring(0, 60)}...`
            : productDesc}
        </p>

        <div className="product-card-footer">
          <div className="product-price">
            <span className="price-current">${productPrice?.toFixed(2)}</span>
            {discountPercentage > 0 && (
              <span className="price-original">
                ${(productPrice / (1 - discountPercentage / 100)).toFixed(2)}
              </span>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            className="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            <Cart3 className="me-1" size={16} />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
