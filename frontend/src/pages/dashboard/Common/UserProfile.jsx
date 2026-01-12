import React, { useState, useEffect, useCallback } from 'react';
import { Card, Spinner, Button, Badge } from 'react-bootstrap';
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
        <div className="container-fluid p-4">
            <h2 className="mb-4">{isMe ? 'My Profile' : 'User Profile'}</h2>
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <Card className="shadow-sm">
                        <Card.Body className="p-5">
                            <div className="text-center mb-4">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                                    {user.first_name?.charAt(0)}
                                </div>
                                <h3>{user.name}</h3>
                                <Badge bg="info" className="text-capitalize">{user.role}</Badge>
                            </div>

                            <hr />

                            <div className="row g-4 mt-2">
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center">
                                        <FaEnvelope className="text-muted me-3" size={20} />
                                        <div>
                                            <small className="text-muted d-block">Email</small>
                                            <strong>{user.email}</strong>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center">
                                        <FaPhone className="text-muted me-3" size={20} />
                                        <div>
                                            <small className="text-muted d-block">Mobile</small>
                                            <strong>{user.mobile_no || 'N/A'}</strong>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center">
                                        <FaUserTag className="text-muted me-3" size={20} />
                                        <div>
                                            <small className="text-muted d-block">Username</small>
                                            <strong>{user.username}</strong>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center">
                                        <FaCalendarAlt className="text-muted me-3" size={20} />
                                        <div>
                                            <small className="text-muted d-block">Joined On</small>
                                            <strong>{new Date(user.createdAt).toLocaleDateString()}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isMe && (
                                <div className="text-center mt-5">
                                    <Button variant="primary" onClick={() => navigate('/dashboard/profile/update')}>
                                        <FaEdit className="me-2" /> Edit Profile
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
