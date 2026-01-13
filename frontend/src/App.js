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
import EditProvider from "./pages/dashboard/Manager/EditProvider";
import Requirements from "./pages/dashboard/Manager/Requirements";
import InvoiceApprovals from "./pages/dashboard/Manager/InvoiceApprovals";

// Provider Dashboard Components
import AssignedRequirements from "./pages/dashboard/Provider/AssignedRequirements";
import CreateInvoice from "./pages/dashboard/Provider/CreateInvoice";
import InvoiceHistory from "./pages/dashboard/Provider/InvoiceHistory";

// Admin & Super Admin Components
import AdminList from "./pages/dashboard/SuperAdmin/AdminList";
import CreateAdmin from "./pages/dashboard/SuperAdmin/CreateAdmin";
import EditAdmin from "./pages/dashboard/SuperAdmin/EditAdmin";
import SystemOverview from "./pages/dashboard/SuperAdmin/SystemOverview";
import CustomerList from "./pages/dashboard/SuperAdmin/CustomerList";
import ProductList from "./pages/dashboard/SuperAdmin/ProductList";
import ManagerList from "./pages/dashboard/Admin/ManagerList";
import CreateManager from "./pages/dashboard/Admin/CreateManager";
import CreateProviderUser from "./pages/dashboard/Common/CreateProviderUser";
import CategoryList from "./pages/dashboard/SuperAdmin/CategoryList";
import CreateCategory from "./pages/dashboard/SuperAdmin/CreateCategory";
import EditCategory from "./pages/dashboard/SuperAdmin/EditCategory";
import EditUserAccount from "./pages/dashboard/Common/EditUserAccount";
import Reports from "./pages/dashboard/SuperAdmin/Reports";
import UserProfile from "./pages/dashboard/Common/UserProfile";
import UpdateProfile from "./pages/dashboard/Common/UpdateProfile";
import Settings from "./pages/dashboard/Common/Settings";

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

                            {/* Super Admin Routes */}
                            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["super_admin"]} />} >
                                <Route element={<DashboardLayout />}>
                                    <Route index element={<SystemOverview />} />
                                    <Route path="profile" element={<UserProfile />} />
                                    <Route path="profile/update" element={<UpdateProfile />} />
                                    <Route path="settings" element={<Settings />} />
                                </Route>
                            </Route>

                            {/* Shared List Routes for Super Admin (and sometimes Admin) */}
                            {/* Note: User asked for /admins, /managers etc. specifically for SA. */}
                            {/* ADMINS */}
                            <Route path="/admins" element={<ProtectedRoute allowedRoles={["super_admin"]} />} >
                                <Route element={<DashboardLayout />}>
                                    <Route index element={<AdminList />} />
                                    <Route path="new" element={<CreateAdmin />} />
                                    <Route path="view/:id" element={<UserProfile />} />
                                    <Route path="edit/:id" element={<EditAdmin />} />
                                </Route>
                            </Route>
                            {/* MANAGERS - Accessible to SA, Admin */}
                            <Route path="/managers" element={<ProtectedRoute allowedRoles={["super_admin"]} />} >
                                <Route element={<DashboardLayout />}>
                                    <Route index element={<ManagerList />} />
                                </Route>
                            </Route>
                            {/* PROVIDERS - Accessible to SA, Admin via /providers if shared, but Admin needs /admin/providers as per request? */}
                            {/* User requested SPECIFIC paths. I will follow them exactly. */}

                            {/* Super Admin specific "List" routes as requested: /admins, /managers, /providers, /products */}
                            <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />} >
                                <Route element={<DashboardLayout />}>
                                    <Route path="/reports" element={<Reports />} />
                                </Route>
                            </Route>

                            {/* Global Resource Lists (Super Admin Access) */}
                            <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />} >
                                <Route element={<DashboardLayout />}>
                                    {/* /admins is already covered above? No, I'll group them */}
                                    <Route path="/providers" element={<ProviderList />} />
                                    <Route path="/products" element={<ProductList />} />
                                    <Route path="/customers" element={<CustomerList />} />
                                    {/* Added routes */}
                                    <Route path="/managers" element={<ManagerList />} />
                                    <Route path="/managers/new" element={<CreateManager />} />
                                    <Route path="/providers/user/new" element={<CreateProviderUser />} />
                                    <Route path="/categories" element={<CategoryList />} />
                                    <Route path="/categories/new" element={<CreateCategory />} />
                                    <Route path="/categories/edit/:id" element={<EditCategory />} />
                                </Route>
                            </Route>

                            {/* Admin Routes */}
                            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]} />} >
                                <Route element={<DashboardLayout />}>
                                    <Route index element={<DashboardHome />} />

                                    {/* Managers */}
                                    <Route path="managers" element={<ManagerList />} />
                                    <Route path="managers/new" element={<CreateManager />} />
                                    <Route path="managers/edit/:id" element={<EditUserAccount redirectPath="/admin/managers" title="Edit Manager" />} />
                                    <Route path="managers/view/:id" element={<UserProfile />} />

                                    {/* Providers */}
                                    <Route path="providers" element={<ProviderList />} />
                                    <Route path="providers/new" element={<CreateProviderUser />} /> {/* User Account */}
                                    <Route path="providers/edit/:id" element={<EditUserAccount redirectPath="/admin/providers" title="Edit Provider User" />} />
                                    <Route path="providers/view/:id" element={<UserProfile />} /> {/* User Account View */}

                                    {/* Provider Profile */}
                                    <Route path="providers/profile" element={<CreateProvider />} /> {/* Profile Creation */}
                                    <Route path="providers/profile/edit/:id" element={<EditProvider redirectPath="/admin/providers" />} /> {/* Profile Edit */}

                                    {/* Products */}
                                    <Route path="products" element={<ProductList />} />

                                    {/* Personal Profile */}
                                    <Route path="profile" element={<UserProfile />} />
                                    <Route path="profile/update" element={<UpdateProfile />} />
                                    <Route path="settings" element={<Settings />} />
                                </Route>
                            </Route>

                            {/* Manager Routes */}
                            <Route path="/manager" element={<ProtectedRoute allowedRoles={["manager"]} />} >
                                <Route element={<DashboardLayout />}>
                                    <Route index element={<DashboardHome />} />

                                    {/* Providers - Aligned with Admin Standard for shared list compatibility */}
                                    <Route path="providers" element={<ProviderList />} />
                                    <Route path="providers/new" element={<CreateProviderUser />} />
                                    <Route path="providers/edit/:id" element={<EditUserAccount redirectPath="/manager/providers" title="Edit Provider User" />} />
                                    <Route path="providers/view/:id" element={<UserProfile />} />

                                    <Route path="providers/profile" element={<CreateProvider />} />
                                    <Route path="providers/profile/edit/:id" element={<EditProvider redirectPath="/manager/providers" />} />

                                    <Route path="products" element={<ProductList />} />
                                    <Route path="customers" element={<CustomerList />} />
                                    <Route path="requirements" element={<Requirements />} />
                                    <Route path="invoices" element={<InvoiceApprovals />} />
                                    <Route path="profile" element={<UserProfile />} />
                                    <Route path="profile/update" element={<UpdateProfile />} />
                                    <Route path="settings" element={<Settings />} />
                                </Route>
                            </Route>

                            {/* Provider Routes */}
                            <Route path="/provider" element={<ProtectedRoute allowedRoles={["provider"]} />} >
                                <Route element={<DashboardLayout />}>
                                    <Route index element={<DashboardHome />} />
                                    <Route path="products" element={<ProductList />} />
                                    <Route path="requirements" element={<AssignedRequirements />} />
                                    <Route path="invoices" element={<InvoiceHistory />} />
                                    <Route path="invoices/new" element={<CreateInvoice />} />
                                    <Route path="profile" element={<UserProfile />} />
                                    <Route path="profile/update" element={<UpdateProfile />} />
                                    <Route path="settings" element={<Settings />} />
                                </Route>
                            </Route>

                            {/* Shared User View Route */}
                            <Route element={<ProtectedRoute allowedRoles={["super_admin", "admin", "manager", "provider",]} />} >
                                <Route element={<DashboardLayout />}>
                                    <Route path="/dashboard/user/:id" element={<UserProfile />} />
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
