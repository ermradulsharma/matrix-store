import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { FaUsers, FaShoppingCart, FaStore, FaMoneyBillWave } from 'react-icons/fa';

const SystemOverview = () => {
    // In a real app, fetch these stats from an API
    const stats = [
        { title: 'Total Users', value: '1,234', icon: FaUsers, color: 'primary' },
        { title: 'Total Orders', value: '567', icon: FaShoppingCart, color: 'success' },
        { title: 'Active Providers', value: '45', icon: FaStore, color: 'info' },
        { title: 'Total Revenue', value: '$123,456', icon: FaMoneyBillWave, color: 'warning' },
    ];

    return (
        <div className="container-fluid">
            <h2 className="mb-4">System Overview</h2>
            <Row>
                {stats.map((stat, index) => (
                    <Col md={3} className="mb-4" key={index}>
                        <Card className={`border-start border-4 border-${stat.color} shadow-sm h-100`}>
                            <Card.Body className="d-flex align-items-center">
                                <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded me-3`}>
                                    <stat.icon className={`text-${stat.color}`} size={24} />
                                </div>
                                <div>
                                    <h6 className="text-muted mb-1">{stat.title}</h6>
                                    <h3 className="mb-0">{stat.value}</h3>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row>
                <Col md={8} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-white">
                            <h5 className="mb-0">Recent Activity</h5>
                        </Card.Header>
                        <Card.Body>
                            <p className="text-muted text-center py-5">Chart placeholder</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-white">
                            <h5 className="mb-0">System Health</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Server Status</span>
                                <Badge bg="success">Online</Badge>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Database</span>
                                <Badge bg="success">Connected</Badge>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Last Backup</span>
                                <span className="text-muted">2 hours ago</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SystemOverview;
