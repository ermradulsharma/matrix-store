import React from 'react';
import { Container } from 'react-bootstrap';
import { FaHeart } from 'react-icons/fa';

const DashboardFooter = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="footer mt-auto py-3 bg-white border-top">
            <Container fluid>
                <div className="d-flex justify-content-between align-items-center px-4">
                    <span className="text-muted small">
                        &copy; {year} <strong>Matrix Store</strong>. All rights reserved.
                    </span>
                    <span className="text-muted small d-flex align-items-center">
                        Made with <FaHeart className="mx-1 text-danger" size={12} /> by Team Matrix
                    </span>
                </div>
            </Container>
        </footer>
    );
};

export default DashboardFooter;
