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
    const res = await api.post("/registration", userData);
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

    const res = await api.get("/get-products", { params });

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
    const res = await api.get(`/get-product-details/${id}`);
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
    const res = await api.get("/get-category");
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
    const res = await api.put("/review", reviewData);
    return res.data;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
};

/** Get product reviews */
export const getProductReviews = async (productId) => {
  try {
    const res = await api.get("/get-reviews", { params: { productId } });
    return res.data.reviews || [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};

// ============= ORDERS =============

/** Submit an order (placeholder - backend doesn't have order endpoint yet) */
export const submitOrder = async (orderData) => {
  try {
    // For now, just return success since backend doesn't have order endpoint
    console.warn("Order endpoint not implemented in backend yet");
    return {
      success: true,
      message: "Order placed successfully",
      orderId: Date.now(),
    };
  } catch (error) {
    console.error("Error submitting order:", error);
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
