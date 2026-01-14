const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const providerController = require("../controllers/providerController");
const requirementController = require("../controllers/requirementController");
const invoiceController = require("../controllers/invoiceController");
const orderController = require("../controllers/orderController");
const {
  isauthenticate,
  isAuthorizedRoles,
} = require("../middlewares/authentication");

const upload = require("../middlewares/upload");

// User Routes
router.post("/register", upload.single('image'), userController.userRegistration);
router.post("/login", userController.loginUser);
router.get("/logout", userController.logout);
router.post("/password/forgot", userController.forgotPassword);
router.put("/password/reset/:token", userController.resetPassword);

// Authenticated User Routes
router.put("/password/change", isauthenticate, userController.changePassword);
router.get("/profile", isauthenticate, userController.userProfile);
router.put("/profile/update", isauthenticate, upload.single('image'), userController.updateProfile);

// Dashboard Stats
const dashboardController = require("../controllers/dashboardController");
router.get(
  "/admin/stats",
  isauthenticate,
  isAuthorizedRoles("super_admin", "admin", "manager"),
  dashboardController.getSuperAdminStats
);
router.get(
  "/admin/analytics",
  isauthenticate,
  isAuthorizedRoles("super_admin", "admin", "manager"),
  dashboardController.getAdvancedStats
);

// Admin User Management
router.get(
  "/admin/users",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin", "manager"),
  userController.getAllUsers
);

router.get(
  "/admin/user/:id",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin", "manager"),
  userController.getSingleUser
);

router.post(
  "/admin/user/new",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin", "manager"),
  upload.single('image'),
  userController.createUser
);
router.put(
  "/admin/user/role/:id",
  isauthenticate,
  isAuthorizedRoles("super_admin"),
  userController.updateUserRole
);
router.put(
  "/admin/user/:id",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin"),
  upload.single('image'),
  userController.updateUserAdmin
);
router.delete(
  "/admin/user/:id",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin", "manager"),
  userController.deleteUserProfile
);

router.put(
  "/admin/user/:id/permissions",
  isauthenticate,
  isAuthorizedRoles("super_admin"),
  userController.updateUserPermissions
);

// Category Routes
router.post(
  "/category/new",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin"),
  upload.single('image'),
  categoryController.createCategory
);
router.get("/categories", categoryController.getAllCategory);
router.get("/category/:id", categoryController.getCategoryDetails);
router.put(
  "/category/:id",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin"),
  upload.single('image'),
  categoryController.updateCategory
);
router.delete(
  "/category/:id",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin"),
  categoryController.deleteCategory
);
router.put(
  "/category/:id/toggle-status",
  isauthenticate,
  isAuthorizedRoles("super_admin"),
  categoryController.toggleCategoryStatus
);

// Product Routes (Public)
router.get("/products", productController.getAllProducts);
router.get("/product/:id", productController.getProductDetails);

// Product Routes (Authenticated)
router.post(
  "/product/new",
  isauthenticate,
  isAuthorizedRoles("admin", "manager", "super_admin"),
  upload.array('images', 5), // Allow up to 5 images
  productController.createProduct
);
router.put(
  "/product/:id",
  isauthenticate,
  isAuthorizedRoles("admin", "manager", "super_admin"),
  upload.array('images', 5),
  productController.updateProduct
);
router.delete(
  "/product/:id",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin", "manager"),
  productController.deleteProduct
);


router.put(
  "/product/:id/toggle-status",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin", "manager"),
  productController.toggleProductStatus
);

router.put(
  "/product/:id/stock/adjust",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin", "manager", "provider"),
  productController.adjustStock
);

router.get(
  "/product/:id/stock/history",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin", "manager", "provider"),
  productController.stockHistory
);


// Product Reviews
router.put(
  "/product/review/:id",
  isauthenticate,
  productController.productReview
);
router.get("/product/reviews/:id", productController.getProductReview);
router.delete(
  "/product/review/:id",
  isauthenticate,
  productController.deleteProductReviews
);

// Provider Management Routes (Manager/Admin)
router.post(
  "/provider/create",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin"),
  providerController.createProvider
);
router.get(
  "/providers",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin"),
  providerController.getAllProviders
);
router.get(
  "/provider/:id",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin", "provider"),
  providerController.getProvider
);
router.put(
  "/provider/:id",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin"),
  providerController.updateProvider
);
router.put(
  "/provider/:id/toggle-status",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin"),
  providerController.toggleProviderStatus
);
router.delete(
  "/provider/:id",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin"),
  providerController.deleteProvider
);
router.get(
  "/provider/:id/performance",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin"),
  providerController.getProviderPerformance
);

// Requirement Routes
router.post(
  "/requirement/create",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin"),
  requirementController.createRequirement
);
router.get(
  "/requirements",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin", "provider"),
  requirementController.getAllRequirements
);
router.get(
  "/requirement/:id",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin", "provider"),
  requirementController.getRequirement
);
router.put(
  "/requirement/:id/accept",
  isauthenticate,
  isAuthorizedRoles("provider"),
  requirementController.acceptRequirement
);
router.put(
  "/requirement/:id/fulfill",
  isauthenticate,
  isAuthorizedRoles("provider"),
  requirementController.fulfillRequirement
);
router.put(
  "/requirement/:id/reject",
  isauthenticate,
  isAuthorizedRoles("provider"),
  requirementController.rejectRequirement
);
router.put(
  "/requirement/:id",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin"),
  requirementController.updateRequirement
);
router.put(
  "/requirement/:id/approve",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin"),
  requirementController.approveRequirement
);
router.put(
  "/requirement/:id/send",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin"),
  requirementController.sendToProvider
);
router.put(
  "/requirement/:id/provider-update",
  isauthenticate,
  isAuthorizedRoles("provider"),
  requirementController.providerUpdateRequirement
);
router.post(
  "/requirement/:id/note",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin", "provider"),
  requirementController.addNote
);

// Invoice Routes
router.post(
  "/invoice/create",
  isauthenticate,
  isAuthorizedRoles("provider"),
  invoiceController.createInvoice
);
router.get(
  "/invoices",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin", "provider"),
  invoiceController.getAllInvoices
);
router.get(
  "/invoice/:id",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin", "provider"),
  invoiceController.getInvoice
);
router.put(
  "/invoice/:id/submit",
  isauthenticate,
  isAuthorizedRoles("provider"),
  invoiceController.submitInvoice
);
router.put(
  "/invoice/:id/approve",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin"),
  invoiceController.approveInvoice
);
router.put(
  "/invoice/:id/reject",
  isauthenticate,
  isAuthorizedRoles("manager", "admin", "super_admin"),
  invoiceController.rejectInvoice
);
router.put(
  "/invoice/:id/mark-paid",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin"),
  invoiceController.markAsPaid
);

// Order Routes
router.post("/order/new", isauthenticate, orderController.newOrder);
router.get("/order/:id", isauthenticate, orderController.getSingleOrder);
router.get("/orders/me", isauthenticate, orderController.myOrders);

// Admin Order Routes
router.get(
  "/admin/orders",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin"),
  orderController.getAllOrders
);
router.put(
  "/admin/order/:id",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin"),
  orderController.updateOrder
);
router.delete(
  "/admin/order/:id",
  isauthenticate,
  isAuthorizedRoles("admin", "super_admin"),
  orderController.deleteOrder
);

// Notification Routes
const notificationController = require("../controllers/notificationController");

router.get("/notifications", isauthenticate, notificationController.getNotifications);
router.put("/notifications/read-all", isauthenticate, notificationController.markAllAsRead);
router.put("/notifications/:id/read", isauthenticate, notificationController.markAsRead);

// Search Routes
const searchController = require("../controllers/searchController");
router.get("/admin/global-search", isauthenticate, isAuthorizedRoles("admin", "super_admin"), searchController.globalSearch);

const roleController = require("../controllers/roleController");
// Role Management (Super Admin Only)
router.get(
  "/admin/roles",
  isauthenticate,
  isAuthorizedRoles("super_admin"),
  roleController.getAllRoles
);

router.put(
  "/admin/role/:id/permissions",
  isauthenticate,
  isAuthorizedRoles("super_admin"),
  roleController.updateRolePermissions
);

router.post(
  "/admin/role/new",
  isauthenticate,
  isAuthorizedRoles("super_admin"),
  roleController.createRole
);

// Role Management (Super Admin Only)

module.exports = router;
