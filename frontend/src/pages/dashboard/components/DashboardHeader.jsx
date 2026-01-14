import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { Dropdown, Button, Form, InputGroup } from 'react-bootstrap';
import { FaBell, FaUser, FaSignOutAlt, FaCog, FaBars, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSearch } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { searchGlobal } from '../../../services/api';

const DashboardHeader = ({ toggleSidebar, collapsed }) => {
    const { user, logout } = useAuth();
    const { unreadCount, notifications, markRead, markAllRead } = useNotifications();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    // Close search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim()) {
                try {
                    const res = await searchGlobal(searchTerm);
                    if (res.data.success) {
                        setSearchResults(res.data.results);
                        setShowResults(true);
                    }
                } catch (error) {
                    console.error("Search failed", error);
                }
            } else {
                setSearchResults(null);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleResultClick = (link) => {
        setSearchTerm('');
        setShowResults(false);
        navigate(link);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <FaCheckCircle className="text-success" />;
            case 'warning': return <FaExclamationTriangle className="text-warning" />;
            case 'error': return <FaTimesCircle className="text-danger" />;
            default: return <FaInfoCircle className="text-info" />;
        }
    };

    return (
        <div className="dashboard-header dashboard-header-glass border-bottom px-4 py-3 d-flex justify-content-between align-items-center sticky-top shadow-sm">

            {/* LEFT: Toggle & Breadcrumbs */}
            <div className="d-flex align-items-center">
                <Button variant="link" className="p-0 text-white me-3 hover-scale" onClick={toggleSidebar}>
                    <FaBars size={20} />
                </Button>
                <div className="d-none d-md-flex align-items-center">
                    <span className="fw-bold text-white" style={{ letterSpacing: '0.5px' }}>DASHBOARD</span>
                </div>
            </div>

            {/* CENTER: Search Bar */}
            <div className="d-none d-lg-block position-relative w-25" ref={searchRef}>
                <InputGroup className="input-group-flush rounded-pill bg-light border-0 px-3 py-1">
                    <InputGroup.Text className="bg-transparent border-0 ps-1">
                        <FaSearch className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Search..."
                        aria-label="Search"
                        className="bg-transparent border-0 shadow-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => { if (searchResults) setShowResults(true); }}
                    />
                </InputGroup>

                {/* Search Results Dropdown */}
                {showResults && searchResults && (
                    <div className="position-absolute w-100 bg-white shadow-lg rounded-4 mt-2 overflow-hidden" style={{ zIndex: 1050, maxHeight: '400px', overflowY: 'auto' }}>

                        {/* Users */}
                        {searchResults.users?.length > 0 && (
                            <div className="p-2">
                                <h6 className="px-3 py-1 text-muted small fw-bold text-uppercase border-bottom">Users</h6>
                                {searchResults.users.map(u => (
                                    <div key={u._id} className="d-flex align-items-center p-2 hover-bg-light cursor-pointer rounded-2" onClick={() => {
                                        if (u.role === 'super_admin') {
                                            navigate(`/dashboard/profile/${u._id}`);
                                        } else if (u.role === 'admin') {
                                            navigate(`/admins/view/${u._id}`);
                                        } else if (u.role === 'manager') {
                                            navigate(`/managers/view/${u._id}`);
                                        } else if (u.role === 'provider') {
                                            navigate(`/providers/view/${u._id}`);
                                        } else if (u.role === 'customer') {
                                            navigate(`/customers/view/${u._id}`);
                                        } else {
                                            navigate(`/dashboard/user/${u._id}`);
                                        }
                                    }}>
                                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2" style={{ width: 30, height: 30 }}>
                                            {u.image?.url && u.image.url !== 'default_url' ?
                                                <img src={u.image.url.startsWith('http') ? u.image.url : `http://localhost:5000${u.image.url}`} alt={u.first_name} className="w-100 h-100 rounded-circle object-fit-cover" /> :
                                                <span className="fw-bold small">{u.first_name.charAt(0)}</span>
                                            }
                                        </div>
                                        <div>
                                            <div className="text-dark small fw-semibold">{u.first_name} {u.last_name}</div>
                                            <div className="text-muted text-xs">{u.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Products */}
                        {searchResults.products?.length > 0 && (
                            <div className="p-2">
                                <h6 className="px-3 py-1 text-muted small fw-bold text-uppercase border-bottom">Products</h6>
                                {searchResults.products.map(p => (
                                    <div key={p._id} className="d-flex align-items-center p-2 hover-bg-light cursor-pointer rounded-2" onClick={() => handleResultClick(`/product/${p._id}`)}>
                                        <div className="rounded bg-light d-flex align-items-center justify-content-center me-2" style={{ width: 30, height: 30 }}>
                                            <span className="fw-bold small">{p.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <div className="text-dark small fw-semibold">{p.name}</div>
                                            <div className="text-muted text-xs">${p.price}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Orders */}
                        {searchResults.orders?.length > 0 && (
                            <div className="p-2">
                                <h6 className="px-3 py-1 text-muted small fw-bold text-uppercase border-bottom">Orders</h6>
                                {searchResults.orders.map(o => (
                                    <div key={o._id} className="d-flex align-items-center p-2 hover-bg-light cursor-pointer rounded-2" onClick={() => console.log('Order Details not implemented yet')}>
                                        <div className="me-2">
                                            <span className={`badge bg-${o.orderStatus === 'Delivered' ? 'success' : 'warning'} rounded-pill`} style={{ fontSize: '0.6rem' }}>{o.orderStatus}</span>
                                        </div>
                                        <div>
                                            <div className="text-dark small fw-semibold">Order #{o._id.substring(0, 8)}</div>
                                            <div className="text-muted text-xs">{o.user?.first_name} • ${o.totalPrice}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(!searchResults.users?.length && !searchResults.products?.length && !searchResults.orders?.length) && (
                            <div className="p-4 text-center text-muted small">No results found</div>
                        )}
                    </div>
                )}
            </div>

            {/* RIGHT: Actions */}
            <div className="d-flex align-items-center gap-2">

                {/* Notifications */}
                <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="p-0 border-0 text-dark position-relative no-caret hover-scale">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <FaBell size={18} className="text-white" />
                        </div>
                        {unreadCount > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white" style={{ fontSize: '0.6rem' }}>
                                {unreadCount}
                            </span>
                        )}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="shadow-lg border-0 mt-2 p-0 rounded-4 overflow-hidden" style={{ width: '350px', maxHeight: '450px' }}>
                        <div className="d-flex justify-content-between align-items-center p-3 bg-light border-bottom">
                            <h6 className="mb-0 fw-bold">Notifications</h6>
                            {unreadCount > 0 && (
                                <Button variant="link" className="text-decoration-none p-0" style={{ fontSize: '0.8rem' }} onClick={(e) => { e.preventDefault(); markAllRead(); }}>
                                    Mark all read
                                </Button>
                            )}
                        </div>
                        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <Dropdown.Item
                                        key={notification._id}
                                        className={`p-3 border-bottom ${!notification.isRead ? 'bg-primary-subtle' : ''} hover-bg-light transition-all`}
                                        onClick={() => {
                                            markRead(notification._id);
                                            if (notification.link) navigate(notification.link);
                                        }}
                                        style={{ whiteSpace: 'normal' }}
                                    >
                                        <div className="d-flex gap-3">
                                            <div className="mt-1">{getIcon(notification.type)}</div>
                                            <div className="flex-grow-1">
                                                <p className="mb-1 text-sm text-dark">{notification.message}</p>
                                                <small className="text-muted text-xs d-block mt-1">{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notification.createdAt).toLocaleDateString()}</small>
                                            </div>
                                            {!notification.isRead && <div className="align-self-center"><span className="badge bg-primary rounded-circle p-1"> </span></div>}
                                        </div>
                                    </Dropdown.Item>
                                ))
                            ) : (
                                <div className="p-5 text-center text-muted">
                                    <FaBell size={30} className="mb-3 opacity-25" />
                                    <p className="mb-0">No new notifications</p>
                                </div>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="p-2 text-center border-top bg-light">
                                <Link to="/notifications" className="text-decoration-none small text-muted">View all notifications</Link>
                            </div>
                        )}
                    </Dropdown.Menu>
                </Dropdown>

                {/* User Profile */}
                <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="text-decoration-none d-flex align-items-center gap-2 p-0 border-0 no-caret">
                        <div className="d-flex align-items-center gap-3">
                            {/* <div className="text-end d-none d-md-block">
                                <div className="fw-bold text-dark lh-1" style={{ fontSize: '0.9rem' }}>{user?.name || 'User'}</div>
                                <div className="text-muted small mt-1 text-capitalize" style={{ fontSize: '0.75rem' }}>{user?.role?.replace('_', ' ')}</div>
                            </div> */}
                            <div className="position-relative">
                                <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center shadow-sm" style={{ width: '45px', height: '45px', border: '2px solid #fff' }}>
                                    {user?.image?.url && user.image.url !== "https://example.com/default-avatar.png" && user.image.url !== "default_url" ? (
                                        <img src={user.image.url.startsWith('http') ? user.image.url : `http://localhost:5000${user.image.url}`} alt={user.name} className="rounded-circle w-100 h-100 object-fit-cover" />
                                    ) : (
                                        <span className="fw-bold fs-5">{user?.first_name?.charAt(0) || <FaUser />}</span>
                                    )}
                                </div>
                                <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-white rounded-circle"></span>
                            </div>
                        </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="shadow-lg border-0 mt-3 p-2 rounded-4 animate-slide-in" style={{ width: '220px' }}>
                        <div className="px-3 py-2 border-bottom d-md-none">
                            <div className="fw-bold text-dark">{user?.name}</div>
                            <div className="text-muted small text-capitalize">{user?.role}</div>
                        </div>
                        <Dropdown.Item onClick={() => {
                            const rootPath = user?.role === 'super_admin' ? '/dashboard' : `/${user?.role}`;
                            navigate(`${rootPath}/profile`);
                        }} className="rounded-2 py-2 mb-1">
                            <FaUser className="me-2 text-primary opacity-75" /> My Profile
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => {
                            const rootPath = user?.role === 'super_admin' ? '/dashboard' : `/${user?.role}`;
                            navigate(`${rootPath}/settings`);
                        }} className="rounded-2 py-2 mb-1">
                            <FaCog className="me-2 text-secondary opacity-75" /> Settings
                        </Dropdown.Item>
                        <Dropdown.Divider className="my-2" />
                        <Dropdown.Item onClick={handleLogout} className="text-danger rounded-2 py-2">
                            <FaSignOutAlt className="me-2" /> Logout
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>
    );
};

export default DashboardHeader;
