const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const providerController = require('../controllers/providerController');
const requirementController = require('../controllers/requirementController');
const invoiceController = require('../controllers/invoiceController');
const { isauthenticate, isAuthorizedRoles } = require('../middlewares/authentication');

// User Routes
router.post('/register', userController.userRegistration);
router.post('/login', userController.loginUser);
router.get('/logout', userController.logout);
router.post('/password/forgot', userController.forgotPassword);
router.put('/password/reset/:token', userController.resetPassword);

// Authenticated User Routes
router.put('/password/change', isauthenticate, userController.changePassword);
router.get('/profile', isauthenticate, userController.userProfile);
router.put('/profile/update', isauthenticate, userController.updateProfile);

// Admin User Management
router.get('/admin/users', isauthenticate, isAuthorizedRoles('admin', 'super_admin'), userController.getAllUsers);
router.put('/admin/user/:id', isauthenticate, isAuthorizedRoles('admin', 'super_admin'), userController.updateProfile);
router.delete('/admin/user/:id', isauthenticate, isAuthorizedRoles('admin', 'super_admin'), userController.deleteUserProfile);

// Category Routes
router.post('/category/new', isauthenticate, isAuthorizedRoles('admin', 'super_admin'), categoryController.createCategory);
router.get('/categories', categoryController.getAllCategory);
router.get('/category/:id', categoryController.getCategoryDetails);
router.put('/category/:id', isauthenticate, isAuthorizedRoles('admin', 'super_admin'), categoryController.updateCategory);
router.delete('/category/:id', isauthenticate, isAuthorizedRoles('admin', 'super_admin'), categoryController.deleteCategory);

// Product Routes (Public)
router.get('/products', productController.getAllProducts);
router.get('/product/:id', productController.getProductDetails);

// Product Routes (Authenticated)
router.post('/product/new', isauthenticate, isAuthorizedRoles('admin', 'manager', 'super_admin'), productController.createProduct);
router.put('/product/:id', isauthenticate, isAuthorizedRoles('admin', 'manager', 'super_admin'), productController.updateProduct);
router.delete('/product/:id', isauthenticate, isAuthorizedRoles('admin', 'super_admin'), productController.deleteProduct);

// Product Reviews
router.put('/product/review/:id', isauthenticate, productController.productReview);
router.get('/product/reviews/:id', productController.getProductReview);
router.delete('/product/review/:id', isauthenticate, productController.deleteProductReviews);

// Provider Management Routes (Manager/Admin)
router.post('/provider/create', isauthenticate, isAuthorizedRoles('manager', 'admin', 'super_admin'), providerController.createProvider);
router.get('/providers', isauthenticate, isAuthorizedRoles('manager', 'admin', 'super_admin'), providerController.getAllProviders);
router.get('/provider/:id', isauthenticate, isAuthorizedRoles('manager', 'admin', 'super_admin', 'provider'), providerController.getProvider);
router.put('/provider/:id', isauthenticate, isAuthorizedRoles('manager', 'admin', 'super_admin'), providerController.updateProvider);
router.put('/provider/:id/deactivate', isauthenticate, isAuthorizedRoles('manager', 'admin', 'super_admin'), providerController.deactivateProvider);
router.get('/provider/:id/performance', isauthenticate, isAuthorizedRoles('manager', 'admin', 'super_admin'), providerController.getProviderPerformance);

// Requirement Routes
router.post('/requirement/create', isauthenticate, isAuthorizedRoles('manager', 'admin', 'super_admin'), requirementController.createRequirement);
router.get('/requirements', isauthenticate, isAuthorizedRoles('manager', 'admin', 'super_admin', 'provider'), requirementController.getAllRequirements);
router.get('/requirement/:id', isauthenticate, isAuthorizedRoles('manager', 'admin', 'super_admin', 'provider'), requirementController.getRequirement);
router.put('/requirement/:id/accept', isauthenticate, isAuthorizedRoles('provider'), requirementController.acceptRequirement);
router.put('/requirement/:id/fulfill', isauthenticate, isAuthorizedRoles('provider'), requirementController.fulfillRequirement);
router.put('/requirement/:id/reject', isauthenticate, isAuthorizedRoles('provider'), requirementController.rejectRequirement);
router.post('/requirement/:id/note', isauthenticate, isAuthorizedRoles('manager', 'admin', 'super_admin', 'provider'), requirementController.addNote);

// Invoice Routes
router.post('/invoice/create', isauthenticate, isAuthorizedRoles('provider'), invoiceController.createInvoice);
router.get('/invoices', isauthenticate, isAuthorizedRoles('manager', 'admin', 'super_admin', 'provider'), invoiceController.getAllInvoices);
router.get('/invoice/:id', isauthenticate, isAuthorizedRoles('manager', 'admin', 'super_admin', 'provider'), invoiceController.getInvoice);
router.put('/invoice/:id/submit', isauthenticate, isAuthorizedRoles('provider'), invoiceController.submitInvoice);
router.put('/invoice/:id/approve', isauthenticate, isAuthorizedRoles('manager', 'admin', 'super_admin'), invoiceController.approveInvoice);
router.put('/invoice/:id/reject', isauthenticate, isAuthorizedRoles('manager', 'admin', 'super_admin'), invoiceController.rejectInvoice);
router.put('/invoice/:id/mark-paid', isauthenticate, isAuthorizedRoles('admin', 'super_admin'), invoiceController.markAsPaid);

module.exports = router;
