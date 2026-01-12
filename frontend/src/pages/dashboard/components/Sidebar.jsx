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
    FaSignOutAlt
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
                            <Link to="/dashboard/super-admin/admins" className={`nav-link ${isActive('/dashboard/super-admin/admins') ? 'active' : ''}`}>
                                <FaUsers className="me-2" /> Manage Admins
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
            <hr />
            <Nav className="flex-column">
                <Nav.Item>
                    <Nav.Link onClick={logout} className="text-danger" style={{ cursor: 'pointer' }}>
                        <FaSignOutAlt className="me-2" /> Sign out
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </div>
    );
};

export default Sidebar;
