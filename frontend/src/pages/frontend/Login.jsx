import React, { useContext, useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
    const { login, loading, error } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (!email || !password) {
            setLocalError('Please enter both email and password');
            return;
        }

        const result = await login(email, password);
        if (result.success) {
            const role = result.user.role;
            if (role === 'super_admin') {
                navigate('/dashboard');
            } else if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'manager') {
                navigate('/manager');
            } else if (role === 'provider') {
                navigate('/provider');
            } else {
                navigate('/profile');
            }
        } else {
            setLocalError(result.error || 'Login failed');
        }
    };

    return (
        <Container className="my-5" style={{ maxWidth: '500px' }}>
            <Card>
                <Card.Body>
                    <h2 className="text-center mb-4">Login</h2>
                    {(error || localError) && <Alert variant="danger">{error || localError}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </Form>
                    <div className="text-center mt-3">
                        <span>Don't have an account? </span>
                        <Link to="/register">Register here</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;
