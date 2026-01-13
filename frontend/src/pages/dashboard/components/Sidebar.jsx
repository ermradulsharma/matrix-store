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
    FaChartLine
} from 'react-icons/fa';

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const renderNavItems = () => {
        switch (user?.role) {
            case 'super_admin':
                return (
                    <>
                        <Nav.Item>
                            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                                <FaChartLine className="me-2" /> System Overview
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/reports" className={`nav-link ${isActive('/reports') ? 'active' : ''}`}>
                                <FaFileInvoiceDollar className="me-2" /> Analytics & Reports
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
                                <FaBoxOpen className="me-2" /> Products
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/categories" className={`nav-link ${isActive('/categories') ? 'active' : ''}`}>
                                <FaClipboardList className="me-2" /> Categories
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/admins" className={`nav-link ${isActive('/admins') ? 'active' : ''}`}>
                                <FaUsers className="me-2" /> Admins
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/managers" className={`nav-link ${isActive('/managers') ? 'active' : ''}`}>
                                <FaUsers className="me-2" /> Managers
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/providers" className={`nav-link ${isActive('/providers') ? 'active' : ''}`}>
                                <FaUsers className="me-2" /> Providers
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/customers" className={`nav-link ${isActive('/customers') ? 'active' : ''}`}>
                                <FaUsers className="me-2" /> Customers
                            </Link>
                        </Nav.Item>
                    </>
                );
            case 'admin':
                return (
                    <>
                        <Nav.Item>
                            <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                                <FaChartLine className="me-2" /> Overview
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/admin/products" className={`nav-link ${isActive('/admin/products') ? 'active' : ''}`}>
                                <FaBoxOpen className="me-2" /> Products
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/admin/managers" className={`nav-link ${isActive('/admin/managers') ? 'active' : ''}`}>
                                <FaUsers className="me-2" /> Managers
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/admin/providers" className={`nav-link ${isActive('/admin/providers') ? 'active' : ''}`}>
                                <FaUsers className="me-2" /> Providers
                            </Link>
                        </Nav.Item>
                    </>
                );
            case 'manager':
                return (
                    <>
                        <Nav.Item>
                            <Link to="/manager" className={`nav-link ${isActive('/manager') ? 'active' : ''}`}>
                                <FaChartLine className="me-2" /> Overview
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/manager/products" className={`nav-link ${isActive('/manager/products') ? 'active' : ''}`}>
                                <FaBoxOpen className="me-2" /> Products
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/manager/providers" className={`nav-link ${isActive('/manager/providers') ? 'active' : ''}`}>
                                <FaBuilding className="me-2" /> Providers
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/manager/customers" className={`nav-link ${isActive('/manager/customers') ? 'active' : ''}`}>
                                <FaUsers className="me-2" /> Customers
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/manager/requirements" className={`nav-link ${isActive('/manager/requirements') ? 'active' : ''}`}>
                                <FaClipboardList className="me-2" /> Requirements
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/manager/invoices" className={`nav-link ${isActive('/manager/invoices') ? 'active' : ''}`}>
                                <FaFileInvoiceDollar className="me-2" /> Invoices
                            </Link>
                        </Nav.Item>
                    </>
                );
            case 'provider':
                return (
                    <>
                        <Nav.Item>
                            <Link to="/provider" className={`nav-link ${isActive('/provider') ? 'active' : ''}`}>
                                <FaChartLine className="me-2" /> Overview
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/provider/products" className={`nav-link ${isActive('/provider/products') ? 'active' : ''}`}>
                                <FaBoxOpen className="me-2" /> Products
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/provider/requirements" className={`nav-link ${isActive('/provider/requirements') ? 'active' : ''}`}>
                                <FaClipboardList className="me-2" /> My Requirements
                            </Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/provider/invoices" className={`nav-link ${isActive('/provider/invoices') ? 'active' : ''}`}>
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
        <div className="d-flex flex-column flex-shrink-0 vh-100 sticky-top sidebar" style={{ width: '280px' }}>
            <Link to="/" className="d-flex align-items-center justify-content-center link-dark text-decoration-none border-bottom" style={{ minHeight: '73px' }}>
                <FaHome className="me-2" size={24} />
                <span className="fs-4 fw-bold">Matrix Store</span>
            </Link>
            <Nav className="flex-column flex-grow-1 overflow-auto p-0">
                {renderNavItems()}
            </Nav>
        </div>
    );
};

export default Sidebar;
