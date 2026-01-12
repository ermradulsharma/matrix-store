import axios from "axios";

// Base URL for backend API (using proxy configured in package.json)
// Base URL for backend API
// Base URL for backend API
const API_BASE = "http://localhost:5000/api/v1";

// Create axios instance for backend API
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Important for cookie-based auth
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ============= AUTHENTICATION =============

/** User login */
export const loginUser = async (email, password) => {
  try {
    const res = await api.post("/login", { email, password });
    if (res.data.success && res.data.token) {
      localStorage.setItem("authToken", res.data.token);
    }
    return res.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

/**
 * Send OTP (Mock)
 * @param {string} mobile
 */
export const sendOtp = async (mobile) => {
  console.log(`Sending OTP to ${mobile}...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "OTP sent successfully" });
    }, 1000);
  });
};

/**
 * Verify OTP (Mock)
 * @param {string} mobile
 * @param {string} otp
 */
export const verifyOtp = async (mobile, otp) => {
  console.log(`Verifying OTP ${otp} for ${mobile}...`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (otp === "1234") {
        // Hardcoded mock OTP
        resolve({ success: true, message: "OTP verified successfully" });
      } else {
        reject({ response: { data: { message: "Invalid OTP" } } });
      }
    }, 1000);
  });
};

/** User registration */
export const registerUser = async (userData) => {
  try {
    // UPDATED: Endpoint changed from /registration to /register
    const res = await api.post("/register", userData);
    if (res.data.success && res.data.token) {
      localStorage.setItem("authToken", res.data.token);
    }
    return res.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

/** User logout */
export const logoutUser = async () => {
  try {
    const res = await api.get("/logout");
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    return res.data;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

/** Get user profile */
export const getUserProfile = async () => {
  try {
    const res = await api.get("/profile");
    return res.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

/** Update user profile */
export const updateUserProfile = async (profileData) => {
  try {
    const res = await api.put("/profile/update", profileData);
    return res.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// ============= PRODUCTS =============

/**
 * Fetch a list of products with optional pagination, search, and category filter.
 */
export const fetchProducts = async ({
  limit = 12,
  skip = 0,
  search = "",
  category = "",
} = {}) => {
  try {
    const params = {};
    if (search) params.keyword = search;
    if (category) params.category = category;

    // UPDATED: Endpoint changed from /get-products to /products
    const res = await api.get("/products", { params });

    // Backend returns { success, products, message }
    // Transform to match expected format with pagination
    const products = res.data.products || [];
    return {
      products: products.slice(skip, skip + limit),
      total: products.length,
      skip,
      limit,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

/** Fetch a single product by its ID */
export const fetchProductById = async (id) => {
  try {
    // UPDATED: Endpoint changed from /get-product-details/${id} to /product/${id}
    const res = await api.get(`/product/${id}`);
    return res.data.product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

// ============= CATEGORIES =============

/** Fetch all product categories */
export const fetchCategories = async () => {
  try {
    // UPDATED: Endpoint changed from /get-category to /categories
    const res = await api.get("/categories");
    // Backend returns { success, categories }
    return res.data.categories || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// ============= REVIEWS =============

/** Submit a product review */
export const submitProductReview = async (reviewData) => {
  try {
    // UPDATED: Endpoint changed to match router /product/review/:id
    // reviewData should contain productId
    const res = await api.put(
      `/product/review/${reviewData.productId}`,
      reviewData
    );
    return res.data;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
};

/** Get product reviews */
export const getProductReviews = async (productId) => {
  try {
    // UPDATED: Endpoint changed from /get-reviews to /product/reviews/${productId}
    const res = await api.get(`/product/reviews/${productId}`);
    return res.data.reviews || [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};

// ============= ORDERS =============

// ============= PRODUCT MANAGEMENT (ADMIN) =============

export const createProduct = async (productData) => {
  try {
    const config = { headers: { "Content-Type": "application/json" } };
    const res = await api.post(`/product/new`, productData, config);
    return res.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const config = { headers: { "Content-Type": "application/json" } };
    const res = await api.put(`/product/${id}`, productData, config);
    return res.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const res = await api.delete(`/product/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// ============= ORDERS =============

/** Submit a new order */
export const submitOrder = async (orderData) => {
  try {
    const config = { headers: { "Content-Type": "application/json" } };
    const res = await api.post("/order/new", orderData, config);
    return res.data;
  } catch (error) {
    console.error("Error submitting order:", error);
    throw error;
  }
};

/** Get logged in user's orders */
export const getMyOrders = async () => {
  try {
    const res = await api.get("/orders/me");
    return res.data.orders;
  } catch (error) {
    console.error("Error fetching my orders:", error);
    throw error;
  }
};

/** Get order details */
export const getOrderDetails = async (id) => {
  try {
    const res = await api.get(`/order/${id}`);
    return res.data.order;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
};

/** Get all orders (Admin) */
export const getAllOrders = async () => {
  try {
    const res = await api.get("/admin/orders");
    return res.data.orders;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};

/** Update order status (Admin) */
export const updateOrder = async (id, orderData) => {
  try {
    const config = { headers: { "Content-Type": "application/json" } };
    const res = await api.put(`/admin/order/${id}`, orderData, config);
    return res.data;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

/** Delete order (Admin) */
export const deleteOrder = async (id) => {
  try {
    const res = await api.delete(`/admin/order/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

// Provider Management
export const createProvider = (data) => api.post("/provider/create", data);
export const fetchProviders = () => api.get("/providers");
export const fetchProviderDetails = (id) => api.get(`/provider/${id}`);
export const updateProvider = (id, data) => api.put(`/provider/${id}`, data);
export const deactivateProvider = (id) => api.put(`/provider/${id}/deactivate`);
export const fetchProviderPerformance = (id) =>
  api.get(`/provider/${id}/performance`);

// Requirement Management
export const createRequirement = (data) =>
  api.post("/requirement/create", data);
export const fetchRequirements = () => api.get("/requirements");
export const fetchRequirementDetails = (id) => api.get(`/requirement/${id}`);
export const acceptRequirement = (id) => api.put(`/requirement/${id}/accept`);
export const fulfillRequirement = (id) => api.put(`/requirement/${id}/fulfill`);
export const rejectRequirement = (id, reason) =>
  api.put(`/requirement/${id}/reject`, { reason });
export const addRequirementNote = (id, message) =>
  api.post(`/requirement/${id}/note`, { message });

// Invoice Management
export const createInvoice = (data) => api.post("/invoice/create", data);
export const fetchInvoices = () => api.get("/invoices");
export const fetchInvoiceDetails = (id) => api.get(`/invoice/${id}`);
export const submitInvoice = (id) => api.put(`/invoice/${id}/submit`);
export const approveInvoice = (id) => api.put(`/invoice/${id}/approve`);
export const rejectInvoice = (id, reason) =>
  api.put(`/invoice/${id}/reject`, { reason });
export const markInvoicePaid = (id, data) =>
  api.put(`/invoice/${id}/mark-paid`, data);

export const fetchUsers = () => api.get("/users");

export default api;
