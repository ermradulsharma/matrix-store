import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Spinner, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaShoppingCart, FaStore, FaMoneyBillWave, FaUserShield, FaUserTie, FaUser, FaBoxOpen, FaDownload } from 'react-icons/fa';
import { fetchDashboardStats } from '../../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SystemOverview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await fetchDashboardStats();
            if (res.data.success) {
                setStats(res.data.stats);
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = () => {
        const doc = new jsPDF();
        doc.text("System Overview Report", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);

        // Summary Table
        autoTable(doc, {
            startY: 30,
            head: [['Metric', 'Value']],
            body: [
                ['Total Revenue', `$${stats?.orders?.totalAmount || 0}`],
                ['Total Orders', stats?.orders?.total || 0],
                ['Total Products', stats?.products || 0],
                ['Total Users', stats?.users?.total || 0],
            ],
        });

        // Recent Orders Table
        if (stats?.recentOrders?.length > 0) {
            doc.text("Recent 5 Orders", 14, doc.lastAutoTable.finalY + 15);
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 20,
                head: [['Order ID', 'Customer', 'Amount', 'Status', 'Date']],
                body: stats.recentOrders.map(order => [
                    order._id,
                    order.user?.name || 'Unknown',
                    `$${order.totalPrice}`,
                    order.orderStatus,
                    new Date(order.createdAt).toLocaleDateString()
                ])
            });
        }

        doc.save('max-store-report.pdf');
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const statCards = [
        { title: 'Total Revenue', value: stats?.orders?.totalAmount ? `$${stats.orders.totalAmount.toLocaleString()}` : '$0', icon: FaMoneyBillWave, color: 'success' },
        { title: 'Total Orders', value: stats?.orders?.total || 0, icon: FaShoppingCart, color: 'primary' },
        { title: 'Total Products', value: stats?.products || 0, icon: FaBoxOpen, color: 'warning' },
        { title: 'Total Users', value: stats?.users?.total || 0, icon: FaUsers, color: 'info' },
    ];

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">System Overview</h2>
                <Button variant="outline-primary" onClick={downloadReport}>
                    <FaDownload className="me-2" /> Download Report
                </Button>
            </div>

            {/* Key Metrics */}
            <Row className="mb-4">
                {statCards.map((stat, index) => (
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

            {/* Analytics Section */}
            <Row className="mb-4">
                <Col md={8}>
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0">Revenue Trend (Last 6 Months)</h5>
                        </Card.Header>
                        <Card.Body>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={stats?.revenueData || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="total" stroke="#8884d8" name="Revenue ($)" activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0">Order Status</h5>
                        </Card.Header>
                        <Card.Body>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={stats?.pieData || []}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            label
                                        >
                                            {(stats?.pieData || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Role Breakdown & Recent Activity */}
            <Row>
                <Col md={6} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0">User Distribution</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col xs={6} className="mb-3">
                                    <Link to="/dashboard/super-admin/admins" className="text-decoration-none text-dark">
                                        <div className="d-flex align-items-center p-3 border rounded hover-shadow transition-all" style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}>
                                            <FaUserShield className="text-dark me-3" size={24} />
                                            <div>
                                                <small className="text-muted d-block">Admins</small>
                                                <strong className="h5 mb-0">{stats?.users?.admin || 0}</strong>
                                            </div>
                                        </div>
                                    </Link>
                                </Col>
                                <Col xs={6} className="mb-3">
                                    <Link to="/dashboard/manager-list" className="text-decoration-none text-dark">
                                        <div className="d-flex align-items-center p-3 border rounded hover-shadow transition-all" style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}>
                                            <FaUserTie className="text-secondary me-3" size={24} />
                                            <div>
                                                <small className="text-muted d-block">Managers</small>
                                                <strong className="h5 mb-0">{stats?.users?.manager || 0}</strong>
                                            </div>
                                        </div>
                                    </Link>
                                </Col>
                                <Col xs={6}>
                                    <Link to="/dashboard/provider-list" className="text-decoration-none text-dark">
                                        <div className="d-flex align-items-center p-3 border rounded hover-shadow transition-all" style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}>
                                            <FaStore className="text-info me-3" size={24} />
                                            <div>
                                                <small className="text-muted d-block">Providers</small>
                                                <strong className="h5 mb-0">{stats?.users?.provider || 0}</strong>
                                            </div>
                                        </div>
                                    </Link>
                                </Col>
                                <Col xs={6}>
                                    <Link to="/dashboard/customer-list" className="text-decoration-none text-dark">
                                        <div className="d-flex align-items-center p-3 border rounded hover-shadow transition-all" style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}>
                                            <FaUser className="text-primary me-3" size={24} />
                                            <div>
                                                <small className="text-muted d-block">Customers</small>
                                                <strong className="h5 mb-0">{stats?.users?.customer || 0}</strong>
                                            </div>
                                        </div>
                                    </Link>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0">Recent Orders</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Status</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.recentOrders?.map(order => (
                                        <tr key={order._id}>
                                            <td><small>{order._id.substring(0, 8)}...</small></td>
                                            <td>
                                                <Badge bg={order.orderStatus === 'delivered' ? 'success' : 'warning'}>
                                                    {order.orderStatus}
                                                </Badge>
                                            </td>
                                            <td>${order.totalPrice}</td>
                                            <td><small>{new Date(order.createdAt).toLocaleDateString()}</small></td>
                                        </tr>
                                    ))}
                                    {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                                        <tr><td colSpan="4" className="text-center">No recent orders</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SystemOverview;
