import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <Container className="my-5 text-center">
            <h1 style={{ fontSize: '120px', fontWeight: 'bold' }}>404</h1>
            <h2>Page Not Found</h2>
            <p className="text-muted mb-4">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link to="/">
                <Button variant="primary" size="lg">
                    Go to Home
                </Button>
            </Link>
        </Container>
    );
};

export default NotFound;
