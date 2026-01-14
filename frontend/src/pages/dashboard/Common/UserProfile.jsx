import React, { useState, useEffect, useCallback } from 'react';
import { Card, Spinner, Button, Badge, Container, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserDetails, getUserProfile } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { FaEnvelope, FaPhone, FaCalendarAlt, FaUserTag, FaEdit } from 'react-icons/fa';

const UserProfile = () => {
    const { id } = useParams();
    const { user: authUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            let userData;
            if (id) {
                // Viewing another user (or explicitly self by ID)
                userData = await fetchUserDetails(id);
            } else {
                // "My Profile" route - use context or fetch profile
                userData = await getUserProfile();
                if (userData.user) userData = userData.user; // standardized
            }
            setUser(userData);
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;
    if (!user) return <div className="text-center p-5">User not found</div>;

    const isMe = !id || (authUser && authUser._id === user._id);

    return (
        <Container fluid>
            <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
                <Card.Header className="bg-primary bg-gradient p-4 text-white d-flex justify-content-between align-items-center">
                    <h4>{isMe ? 'My Profile' : 'User Profile'}</h4>
                    {isMe && (
                        <Button variant="light" size="sm" className="d-flex align-items-center gap-1" onClick={() => navigate('/dashboard/profile/update')}>
                            <FaEdit /> Edit Profile
                        </Button>
                    )}
                </Card.Header>
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={4} className="text-center border-end border-light-subtle mb-4 mb-md-0">
                            <div className="position-relative d-inline-block">
                                {user.image && user.image.url && user.image.url !== 'default_url' ? (
                                    <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm border border-4 border-white overflow-hidden" style={{ width: '120px', height: '120px' }}>
                                        <img
                                            src={user.image.url.startsWith('http') ? user.image.url : `http://localhost:5000${user.image.url}`}
                                            alt={user.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm border border-4 border-white" style={{ width: '120px', height: '120px', fontSize: '3rem', fontWeight: 'bold' }}>
                                        {user.first_name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <h3 className="fw-bold text-dark mb-1">{user.name}</h3>
                            <Badge bg="info" className="px-3 py-2 rounded-pill text-uppercase text-xs fw-bold letter-spacing-1">{user.role}</Badge>
                        </Col>
                        <Col md={8} className="ps-md-5">
                            <h5 className="fw-bold text-secondary text-uppercase text-xs letter-spacing-1 mb-4">Contact Information</h5>
                            <Row className="g-4">
                                <Col sm={6}>
                                    <div className="d-flex">
                                        <div className="me-3 mt-1">
                                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                                <FaEnvelope className="text-secondary" size={14} />
                                            </div>
                                        </div>
                                        <div>
                                            <small className="text-muted d-block text-xs text-uppercase fw-bold">Email Address</small>
                                            <span className="text-dark fw-medium">{user.email}</span>
                                        </div>
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    <div className="d-flex">
                                        <div className="me-3 mt-1">
                                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                                <FaPhone className="text-secondary" size={14} />
                                            </div>
                                        </div>
                                        <div>
                                            <small className="text-muted d-block text-xs text-uppercase fw-bold">Mobile Number</small>
                                            <span className="text-dark fw-medium">{user.mobile_no || 'N/A'}</span>
                                        </div>
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    <div className="d-flex">
                                        <div className="me-3 mt-1">
                                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                                <FaUserTag className="text-secondary" size={14} />
                                            </div>
                                        </div>
                                        <div>
                                            <small className="text-muted d-block text-xs text-uppercase fw-bold">Username</small>
                                            <span className="text-dark fw-medium">{user.username}</span>
                                        </div>
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    <div className="d-flex">
                                        <div className="me-3 mt-1">
                                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                                <FaCalendarAlt className="text-secondary" size={14} />
                                            </div>
                                        </div>
                                        <div>
                                            <small className="text-muted d-block text-xs text-uppercase fw-bold">Joined On</small>
                                            <span className="text-dark fw-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default UserProfile;
