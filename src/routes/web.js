const express = require('express');
const router = express.Router();

// Import your controller or handlers
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const userController = require("../controllers/userController");
const { isauthenticate, isAuthorizedRoles } = require('../middlewares/authentication');

// Public Routes (No Authentication Required)

// User Routes
router.post('/registration', userController.userRegistration);
router.post('/login', userController.loginUser);
router.post('/password/forgot', userController.forgotPassword);
router.put('/password/reset/:token', userController.resetPassword);

// Category Routes
router.get('/get-category', categoryController.getAllCategory);

// Product 
router.get('/get-products', productController.getAllProducts);
router.get('/get-product-details/:id', productController.getProductDetails);
router.get('/get-reviews', productController.getProductReview);


// Group of routes that require authentication
const authenticatedRoutes = express.Router();
authenticatedRoutes.use(isauthenticate);

// User Route
authenticatedRoutes.get('/logout', userController.logout);
authenticatedRoutes.put('/password/update', userController.changePassword);
authenticatedRoutes.get('/profile', userController.userProfile);
authenticatedRoutes.put('/profile/update', userController.updateProfile); // When user or admin update own profile

// Product Routs
authenticatedRoutes.put('/review', productController.productReview);


// Admin Access Routes
// For Users
authenticatedRoutes.put('/update/user/:id', isAuthorizedRoles("admin"), userController.updateProfile); // When admin update user profile
// authenticatedRoutes.put('/update/user/:id', isAuthorizedRoles("admin"), userController.updateUserProfile);
authenticatedRoutes.delete('/delete/user/:id', isAuthorizedRoles("admin"), userController.deleteUserProfile);
authenticatedRoutes.get('/get/users', isAuthorizedRoles("admin"), userController.getAllUsers)

// Category Routes
authenticatedRoutes.post('/create-category', categoryController.createCategory);
authenticatedRoutes.get('/category-details/:id', categoryController.getCategoryDetails);
authenticatedRoutes.patch('/update-category/:id', categoryController.updateCategory);
authenticatedRoutes.delete('/delete-category/:id', categoryController.deleteCategory);

// For Products
authenticatedRoutes.post('/create-product', isAuthorizedRoles("admin"), productController.createProduct);
authenticatedRoutes.put('/update-product/:id', isAuthorizedRoles("admin"), productController.updateProduct);
authenticatedRoutes.delete('/delete-product/:id', isAuthorizedRoles("admin"), productController.deleteProduct);
authenticatedRoutes.delete('/delete-reviews', isAuthorizedRoles("admin"), productController.deleteProductReviews);

// Attach the authenticated routes to the main router
router.use(authenticatedRoutes);

module.exports = router
