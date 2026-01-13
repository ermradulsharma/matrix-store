import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Button, Container } from 'react-bootstrap';
import { FaStore, FaClipboardList, FaFileInvoiceDollar, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { fetchProviders, fetchRequirements, fetchInvoices } from '../../../services/api';

const ManagerDashboard = () => {
    const [stats, setStats] = useState({
        providers: 0,
        requirements: 0,
        invoices: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch counts manually since no dedicated stats endpoint exists for Manager
            const [providersRes, reqRes, invRes] = await Promise.all([
                fetchProviders(),
                fetchRequirements(),
                fetchInvoices()
            ]);

            setStats({
                providers: providersRes.data?.providers?.length || 0,
                requirements: reqRes.data?.requirements?.length || 0,
                invoices: invRes.data?.invoices?.length || 0
            });
        } catch (error) {
            console.error("Error loading manager stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <Spinner animation="grow" variant="primary" />
        </div>
    );

    const cards = [
        { title: 'Total Providers', value: stats.providers, icon: FaStore, color: '#4e73df', link: '/manager/providers' },
        { title: 'Active Requirements', value: stats.requirements, icon: FaClipboardList, color: '#1cc88a', link: '/manager/requirements' },
        { title: 'Pending Invoices', value: stats.invoices, icon: FaFileInvoiceDollar, color: '#f6c23e', link: '/manager/invoices' },
    ];

    return (
        <Container fluid className="p-4 bg-light min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Manager Overview</h2>
                    <p className="text-muted mb-0">Overview of your providers and requirements.</p>
                </div>
                <Button variant="primary" onClick={() => navigate('/manager/providers/new')}>
                    <FaPlus className="me-2" /> Add New Provider
                </Button>
            </div>

            <Row className="g-4">
                {cards.map((card, index) => (
                    <Col md={4} key={index}>
                        <Card
                            className="border-0 shadow-sm h-100 overflow-hidden hover-card cursor-pointer"
                            onClick={() => navigate(card.link)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.8rem' }}>{card.title}</p>
                                        <h3 className="fw-bold mb-0 text-dark">{card.value}</h3>
                                    </div>
                                    <div className="p-3 rounded-circle text-white d-flex align-items-center justify-content-center" style={{ backgroundColor: card.color, width: 60, height: 60 }}>
                                        <card.icon size={24} />
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <style>
                {`
                .hover-card:hover { transform: translateY(-5px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important; transition: all 0.3s ease; }
                `}
            </style>
        </Container>
    );
};

export default ManagerDashboard;
