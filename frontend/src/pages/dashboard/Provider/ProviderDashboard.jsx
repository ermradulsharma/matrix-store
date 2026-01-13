import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Button, Container } from 'react-bootstrap';
import { FaBoxOpen, FaFileInvoiceDollar, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, fetchInvoices } from '../../../services/api';

const ProviderDashboard = () => {
    const [stats, setStats] = useState({
        products: 0,
        invoices: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch stats. Note: fetchProducts might return ALL products, ideally backend filters for provider.
            // Assuming the endpoints return relevant data for this user.
            const [prodRes, invRes] = await Promise.all([
                fetchProducts({ limit: 1 }), // Optimization: just want total count if available in metadata
                fetchInvoices()
            ]);

            setStats({
                products: prodRes.total || 0, // fetchProducts returns { products, total, ... }
                invoices: invRes.data?.invoices?.length || 0
            });
        } catch (error) {
            console.error("Error loading provider stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <Spinner animation="grow" variant="primary" />
        </div>
    );

    return (
        <Container fluid className="p-4 bg-light min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Provider Dashboard</h2>
                    <p className="text-muted mb-0">Manage your products and invoices.</p>
                </div>
            </div>

            <Row className="g-4 mb-5">
                <Col md={6}>
                    <Card className="border-0 shadow-sm h-100 bg-primary text-white">
                        <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="opacity-75 mb-1">Total Products</h5>
                                <h2 className="fw-bold mb-0">{stats.products}</h2>
                            </div>
                            <FaBoxOpen size={48} className="opacity-50" />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="border-0 shadow-sm h-100 bg-success text-white">
                        <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="opacity-75 mb-1">My Invoices</h5>
                                <h2 className="fw-bold mb-0">{stats.invoices}</h2>
                            </div>
                            <FaFileInvoiceDollar size={48} className="opacity-50" />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <div className="d-flex gap-3">
                <Button variant="primary" size="lg" onClick={() => navigate('/provider/invoices/new')}>
                    <FaPlus className="me-2" /> Create New Invoice
                </Button>
                {/* Add product button logic if path exists. Assuming /products is list, maybe add new there? */}
            </div>
        </Container>
    );
};

export default ProviderDashboard;
