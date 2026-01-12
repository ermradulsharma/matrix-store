import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirect Product page to Shop page since they're consolidated
function Product() {
    return <Navigate to="/shop" replace />;
}

export default Product;
