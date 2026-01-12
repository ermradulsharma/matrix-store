import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    FaHome,
    FaUsers,
    FaBoxOpen,
    FaFileInvoiceDollar,
    FaClipboardList,
    FaBuilding,
    FaChartLine,
    FaSignOutAlt,
    FaUser
} from 'react-icons/fa';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const renderNavItems = () => {
        switch (user?.role) {
            case 'super_admin':
                return (
                    <>
                        <Nav.Item>
                            <Link to="/dashboard/super-admin" className={`nav-link ${isActive('/dashboard/super-admin') ? 'active' : ''}`}>
                                <FaChartLine className="me-2" /> System Overview
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/dashboard/super-admin/reports" className={`nav-link ${isActive('/dashboard/super-admin/reports') ? 'active' : ''}`}>
                                <FaFileInvoiceDollar className="me-2" /> Analytics & Reports
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/dashboard/super-admin/products" className={`nav-link ${isActive('/dashboard/super-admin/products') ? 'active' : ''}`}>
                                <FaBoxOpen className="me-2" /> Products
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/dashboard/admin-list" className={`nav-link ${isActive('/dashboard/admin-list') ? 'active' : ''}`}>
                                <FaUsers className="me-2" /> Admins
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/dashboard/manager-list" className={`nav-link ${isActive('/dashboard/manager-list') ? 'active' : ''}`}>
                                <FaUsers className="me-2" /> Managers
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/dashboard/provider-list" className={`nav-link ${isActive('/dashboard/provider-list') ? 'active' : ''}`}>
                                <FaUsers className="me-2" /> Providers
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/dashboard/customer-list" className={`nav-link ${isActive('/dashboard/customer-list') ? 'active' : ''}`}>
                                <FaUsers className="me-2" /> Customers
                            </Link>
                        </Nav.Item>
                    </>
                );
            case 'admin':
                return (
                    <>
                        <Nav.Item>
                            <Link to="/dashboard/admin" className={`nav-link ${isActive('/dashboard/admin') ? 'active' : ''}`}>
                                <FaChartLine className="me-2" /> Overview
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/dashboard/admin/managers" className={`nav-link ${isActive('/dashboard/admin/managers') ? 'active' : ''}`}>
                                <FaUsers className="me-2" /> Manage Managers
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/dashboard/admin/products" className={`nav-link ${isActive('/dashboard/admin/products') ? 'active' : ''}`}>
                                <FaBoxOpen className="me-2" /> Product Approvals
                            </Link>
                        </Nav.Item>
                    </>
                );
            case 'manager':
                return (
                    <>
                        <Nav.Item>
                            <Link to="/dashboard/manager" className={`nav-link ${isActive('/dashboard/manager') ? 'active' : ''}`}>
                                <FaChartLine className="me-2" /> Overview
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/dashboard/manager/providers" className={`nav-link ${isActive('/dashboard/manager/providers') ? 'active' : ''}`}>
                                <FaBuilding className="me-2" /> Providers
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/dashboard/manager/customers" className={`nav-link ${isActive('/dashboard/manager/customers') ? 'active' : ''}`}>
                                <FaUsers className="me-2" /> Customers
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/dashboard/manager/requirements" className={`nav-link ${isActive('/dashboard/manager/requirements') ? 'active' : ''}`}>
                                <FaClipboardList className="me-2" /> Requirements
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/dashboard/manager/invoices" className={`nav-link ${isActive('/dashboard/manager/invoices') ? 'active' : ''}`}>
                                <FaFileInvoiceDollar className="me-2" /> Invoices
                            </Link>
                        </Nav.Item>
                    </>
                );
            case 'provider':
                return (
                    <>
                        <Nav.Item>
                            <Link to="/dashboard/provider" className={`nav-link ${isActive('/dashboard/provider') ? 'active' : ''}`}>
                                <FaChartLine className="me-2" /> Overview
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/dashboard/provider/requirements" className={`nav-link ${isActive('/dashboard/provider/requirements') ? 'active' : ''}`}>
                                <FaClipboardList className="me-2" /> My Requirements
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/dashboard/provider/invoices" className={`nav-link ${isActive('/dashboard/provider/invoices') ? 'active' : ''}`}>
                                <FaFileInvoiceDollar className="me-2" /> My Invoices
                            </Link>
                        </Nav.Item>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 bg-light" style={{ width: '280px', minHeight: '100vh' }}>
            <Link to="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
                <FaHome className="me-2" size={24} />
                <span className="fs-4">Matrix Store</span>
            </Link>
            <hr />
            <div className="mb-3">
                <div className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                        {user?.first_name?.charAt(0)}
                    </div>
                    <div>
                        <strong>{user?.first_name} {user?.last_name}</strong>
                        <div className="text-muted small text-capitalize">{user?.role?.replace('_', ' ')}</div>
                    </div>
                </div>
            </div>
            <hr />
            <Nav className="flex-column mb-auto">
                {renderNavItems()}
            </Nav>

            <hr className="my-2" />

            <Nav className="flex-column mb-4">
                <Nav.Item>
                    <Link to="/dashboard/profile" className={`nav-link ${isActive('/dashboard/profile') ? 'active' : ''}`}>
                        <FaUser className="me-2" /> My Profile
                    </Link>
                </Nav.Item>
                <Nav.Item>
                    <button className="nav-link btn btn-link text-start text-danger" onClick={logout}>
                        <FaSignOutAlt className="me-2" /> Logout
                    </button>
                </Nav.Item>
            </Nav>
        </div>
    );
};

export default Sidebar;
