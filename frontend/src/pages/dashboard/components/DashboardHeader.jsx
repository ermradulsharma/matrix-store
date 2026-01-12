import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Dropdown } from 'react-bootstrap';
import { FaBell, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-header bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
            <div>
                <h4 className="mb-0">Dashboard</h4>
            </div>

            <div className="d-flex align-items-center gap-3">
                {/* Notifications */}
                <div className="position-relative">
                    <FaBell size={20} className="text-muted cursor-pointer" />
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                        3
                    </span>
                </div>

                {/* User Dropdown */}
                <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="text-decoration-none text-dark d-flex align-items-center gap-2 p-0">
                        <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                <FaUser />
                            </div>
                            <div className="text-start d-none d-md-block">
                                <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{user?.name || 'User'}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.role?.replace('_', ' ')}</div>
                            </div>
                        </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => navigate('/profile')}>
                            <FaUser className="me-2" /> My Profile
                        </Dropdown.Item>
                        <Dropdown.Item>
                            <FaCog className="me-2" /> Settings
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleLogout} className="text-danger">
                            <FaSignOutAlt className="me-2" /> Logout
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>
    );
};

export default DashboardHeader;
