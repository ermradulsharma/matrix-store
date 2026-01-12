import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./styles/global/App.css";

// Context Providers
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/AuthContext";

// Layouts
import FrontendLayout from "./layouts/FrontendLayout";

// Pages
import Home from "./pages/frontend/Home";
import Product from "./pages/frontend/Product";
import ProductDetails from "./components/frontend/ProductDetails/ProductDetails";
import Shop from "./pages/frontend/Shop";
import Cart from "./pages/frontend/Cart";
import Wishlist from "./pages/frontend/Wishlist";
import Checkout from "./pages/frontend/Checkout";
import OrderSuccess from "./pages/frontend/OrderSuccess";
import Login from "./pages/frontend/Login";
import Register from "./pages/frontend/Register";
import CustomerProfile from "./pages/frontend/CustomerProfile";
import About from "./pages/frontend/About";
import Services from "./pages/frontend/Services";
import Contact from "./pages/frontend/Contact";
import Faq from "./pages/frontend/Faq";
import PrivacyPolicy from "./pages/frontend/PrivacyPolicy";
import TermsCondition from "./pages/frontend/TermsCondition";
import NotFound from "./pages/frontend/NotFound";

// Dashboard Components
import DashboardLayout from "./pages/dashboard/layouts/DashboardLayout";
import ProtectedRoute from "./pages/dashboard/components/ProtectedRoute";
import PublicRoute from "./pages/dashboard/components/PublicRoute";
import DashboardHome from "./pages/dashboard/DashboardHome";

// Manager Dashboard Components
import ProviderList from "./pages/dashboard/Manager/ProviderList";
import CreateProvider from "./pages/dashboard/Manager/CreateProvider";
import Requirements from "./pages/dashboard/Manager/Requirements";
import InvoiceApprovals from "./pages/dashboard/Manager/InvoiceApprovals";

// Provider Dashboard Components
import AssignedRequirements from "./pages/dashboard/Provider/AssignedRequirements";
import CreateInvoice from "./pages/dashboard/Provider/CreateInvoice";
import InvoiceHistory from "./pages/dashboard/Provider/InvoiceHistory";

// Admin & Super Admin Components
import AdminList from "./pages/dashboard/SuperAdmin/AdminList";
import SystemOverview from "./pages/dashboard/SuperAdmin/SystemOverview";
import CustomerList from "./pages/dashboard/SuperAdmin/CustomerList";
import ProductList from "./pages/dashboard/SuperAdmin/ProductList";
import ManagerList from "./pages/dashboard/Admin/ManagerList";
import Reports from "./pages/dashboard/SuperAdmin/Reports";
import UserProfile from "./pages/dashboard/Common/UserProfile";
import UpdateProfile from "./pages/dashboard/Common/UpdateProfile";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <Routes>
              {/* Frontend Routes with NavBar and Footer */}
              {/* Frontend Routes with NavBar and Footer */}
              <Route element={<PublicRoute />}>
                <Route element={<FrontendLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product" element={<Product />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<CustomerProfile />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-condition" element={<TermsCondition />} />
                </Route>
              </Route>

              {/* Dashboard Routes without NavBar and Footer */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "super_admin",
                      "admin",
                      "manager",
                      "provider",
                    ]}
                  />
                }
              >
                <Route element={<DashboardLayout />}>
                  <Route index element={<DashboardHome />} />
                  {/* Super Admin Routes */}
                  <Route
                    path="super-admin"
                    element={<ProtectedRoute allowedRoles={["super_admin"]} />}
                  >
                    <Route index element={<SystemOverview />} />
                    <Route path="admins" element={<AdminList />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="products" element={<ProductList />} />
                  </Route>
                  {/* Super Admin User Lists - Direct Dashboard Access */}
                  <Route
                    element={<ProtectedRoute allowedRoles={["super_admin"]} />}
                  >
                    <Route path="admin-list" element={<AdminList />} />
                    <Route path="manager-list" element={<ManagerList />} />
                    <Route path="provider-list" element={<ProviderList />} />
                    <Route path="customer-list" element={<CustomerList />} />
                  </Route>
                  {/* Admin Routes */}
                  <Route
                    path="admin"
                    element={<ProtectedRoute allowedRoles={["admin"]} />}
                  >
                    <Route index element={<DashboardHome />} />
                    <Route path="managers" element={<ManagerList />} />
                  </Route>
                  {/* Manager Routes */}
                  <Route
                    path="manager"
                    element={<ProtectedRoute allowedRoles={["manager"]} />}
                  >
                    <Route index element={<DashboardHome />} />
                    <Route path="providers" element={<ProviderList />} />
                    <Route path="providers/new" element={<CreateProvider />} />
                    <Route path="customers" element={<CustomerList />} />
                    <Route path="requirements" element={<Requirements />} />
                    <Route path="invoices" element={<InvoiceApprovals />} />
                  </Route>
                  {/* Provider Routes */}
                  <Route
                    path="provider"
                    element={<ProtectedRoute allowedRoles={["provider"]} />}
                  >
                    <Route index element={<DashboardHome />} />
                    <Route
                      path="requirements"
                      element={<AssignedRequirements />}
                    />
                    <Route path="invoices" element={<InvoiceHistory />} />
                    <Route path="invoices/new" element={<CreateInvoice />} />
                  </Route>
                  {/* Common / Profile Routes */}
                  <Route path="profile" element={<UserProfile />} />
                  <Route path="profile/update" element={<UpdateProfile />} />
                  <Route path="user/:id" element={<UserProfile />} />{" "}
                  {/* View other User */}
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
