import React, { useContext } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
    const { user, logout, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    if (!isAuthenticated) {
        return (
            <Container className="my-5 text-center">
                <h2>Please login to view your profile</h2>
                <Button variant="primary" onClick={() => navigate('/login')}>Go to Login</Button>
            </Container>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Container className="my-5" style={{ maxWidth: '600px' }}>
            <Card>
                <Card.Body>
                    <h2 className="mb-4">My Profile</h2>
                    <div className="mb-3">
                        <strong>Name:</strong> <span>{user.name}</span>
                    </div>
                    <div className="mb-3">
                        <strong>Email:</strong> <span>{user.email}</span>
                    </div>
                    {user.username && (
                        <div className="mb-3">
                            <strong>Username:</strong> <span>{user.username}</span>
                        </div>
                    )}
                    {user.phone && (
                        <div className="mb-3">
                            <strong>Phone:</strong> <span>{user.phone}</span>
                        </div>
                    )}
                    {user.website && (
                        <div className="mb-3">
                            <strong>Website:</strong> <span>{user.website}</span>
                        </div>
                    )}
                    <hr />
                    <Button variant="primary" className="me-2" onClick={() => navigate('/wishlist')}>My Wishlist</Button>
                    <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Profile;
