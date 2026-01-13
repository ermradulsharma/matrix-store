import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Spinner, Button, Table, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
    FaUsers, FaShoppingCart, FaStore, FaMoneyBillWave,
    FaUserShield, FaUserTie, FaUser, FaBoxOpen, FaDownload,
    FaChartLine, FaChartPie
} from 'react-icons/fa';
import { fetchDashboardStats } from '../../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SystemOverview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState([]);

    useEffect(() => {
        loadStats(selectedYear);
    }, [selectedYear]);

    const loadStats = async (year) => {
        try {
            const res = await fetchDashboardStats(year);
            if (res.data.success) {
                setStats(res.data.stats);
                if (res.data.stats.availableYears) {
                    setAvailableYears(res.data.stats.availableYears);
                }
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

        // Geo Stats
        if (stats?.geoStats) {
            doc.text("Top Countries", 14, doc.lastAutoTable.finalY + 10);
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 15,
                head: [['Country', 'Sales', 'Orders']],
                body: stats.geoStats.country.slice(0, 5).map(i => [i.name, `$${i.value}`, i.count])
            });
        }

        // Revenue Trend (Matches the Chart logic)
        if (stats?.revenueData?.length > 0) {
            doc.text(`Revenue Trend (${selectedYear})`, 14, doc.lastAutoTable.finalY + 10);
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 15,
                head: [['Time Period', 'Revenue']],
                body: stats.revenueData.map(item => [item.name, `$${item.total}`])
            });
        }

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

        doc.save('matrix-store-report.pdf');
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <Spinner animation="grow" variant="primary" />
        </div>
    );

    const COLORS = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'];

    const cardStyles = [
        { bg: 'linear-gradient(45deg, #4e73df, #224abe)', text: 'white', icon: FaMoneyBillWave, title: 'Total Revenue', value: stats?.orders?.totalAmount ? `$${stats.orders.totalAmount.toLocaleString()}` : '$0' },
        { bg: 'linear-gradient(45deg, #1cc88a, #13855c)', text: 'white', icon: FaShoppingCart, title: 'Total Orders', value: stats?.orders?.total || 0 },
        { bg: 'linear-gradient(45deg, #36b9cc, #258391)', text: 'white', icon: FaBoxOpen, title: 'Total Products', value: stats?.products || 0 },
        { bg: 'linear-gradient(45deg, #f6c23e, #dda20a)', text: 'white', icon: FaUsers, title: 'Total Users', value: stats?.users?.total || 0 },
    ];

    return (
        <Container fluid className="p-4 bg-light min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">System Overview</h2>
                    <p className="text-muted mb-0">Welcome back, here's what's happening via Matrix Store.</p>
                </div>
                <Button variant="primary" className="shadow-sm d-flex align-items-center gap-2" onClick={downloadReport}>
                    <FaDownload /> Download Report
                </Button>
            </div>

            {/* Key Metrics */}
            <Row className="g-4 mb-4">
                {cardStyles.map((card, index) => (
                    <Col md={6} xl={3} key={index}>
                        <Card className="border-0 shadow-sm h-100 overflow-hidden transform-hover">
                            <Card.Body className="p-4" style={{ background: card.bg, color: card.text }}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="mb-1 opacity-75 fw-medium text-uppercase" style={{ fontSize: '0.85rem' }}>{card.title}</p>
                                        <h3 className="fw-bold mb-0">{card.value}</h3>
                                    </div>
                                    <div className="p-3 rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center">
                                        <card.icon size={24} color="white" />
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Charts Section */}
            <Row className="g-4 mb-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0 text-dark"><FaChartLine className="me-2 text-primary" /> Revenue Trend</h5>
                            <select
                                className="form-select w-auto shadow-sm border-0 bg-light fw-bold text-secondary"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                            >
                                {availableYears.length > 0 ? (
                                    availableYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))
                                ) : (
                                    <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                )}
                            </select>
                        </Card.Header>
                        <Card.Body>
                            <div style={{ width: '100%', height: 350, minWidth: 0, position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats?.revenueData || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e6f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#858796', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#858796', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value) => [`$${value}`, 'Revenue']} />
                                        <Line type="monotone" dataKey="total" stroke="#4e73df" strokeWidth={3} dot={{ r: 4, fill: '#4e73df', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white py-3 border-bottom-0">
                            <h5 className="fw-bold mb-0 text-dark"><FaChartPie className="me-2 text-info" /> Order Status</h5>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center">
                            <div style={{ width: '100%', height: 300, minWidth: 0, position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={stats?.pieData || []} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                                            {(stats?.pieData || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Bottom Section: Users & Recent Orders */}
            <Row className="g-4">
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100 rounded-3">
                        <Card.Header className="bg-white py-3 border-bottom">
                            <h5 className="fw-bold mb-0 text-dark">User Distribution</h5>
                        </Card.Header>
                        <Card.Body className="p-3">
                            <Row className="g-3">
                                <Col xs={6}>
                                    <Link to="/dashboard/super-admin/admins" className="text-decoration-none">
                                        <div className="p-3 border rounded-3 text-center bg-white hover-card transition-all h-100">
                                            <FaUserShield className="text-primary mb-2" size={28} />
                                            <div className="text-muted small fw-bold">Admins</div>
                                            <div className="fs-4 fw-bold text-dark">{stats?.users?.admin || 0}</div>
                                        </div>
                                    </Link>
                                </Col>
                                <Col xs={6}>
                                    <Link to="/dashboard/super-admin/managers" className="text-decoration-none">
                                        <div className="p-3 border rounded-3 text-center bg-white hover-card transition-all h-100">
                                            <FaUserTie className="text-success mb-2" size={28} />
                                            <div className="text-muted small fw-bold">Managers</div>
                                            <div className="fs-4 fw-bold text-dark">{stats?.users?.manager || 0}</div>
                                        </div>
                                    </Link>
                                </Col>
                                <Col xs={6}>
                                    <Link to="/dashboard/super-admin/providers" className="text-decoration-none">
                                        <div className="p-3 border rounded-3 text-center bg-white hover-card transition-all h-100">
                                            <FaStore className="text-info mb-2" size={28} />
                                            <div className="text-muted small fw-bold">Providers</div>
                                            <div className="fs-4 fw-bold text-dark">{stats?.users?.provider || 0}</div>
                                        </div>
                                    </Link>
                                </Col>
                                <Col xs={6}>
                                    <Link to="/dashboard/super-admin/customers" className="text-decoration-none">
                                        <div className="p-3 border rounded-3 text-center bg-white hover-card transition-all h-100">
                                            <FaUser className="text-warning mb-2" size={28} />
                                            <div className="text-muted small fw-bold">Customers</div>
                                            <div className="fs-4 fw-bold text-dark">{stats?.users?.customer || 0}</div>
                                        </div>
                                    </Link>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100 rounded-3">
                        <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0 text-dark">Recent Orders</h5>
                            <Button variant="light" size="sm" className="text-primary fw-bold" as={Link} to="/dashboard/super-admin/orders">View All</Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <Table hover className="align-middle mb-0 text-nowrap">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-4 py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Order ID</th>
                                            <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Customer</th>
                                            <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Amount</th>
                                            <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Status</th>
                                            <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats?.recentOrders?.length > 0 ? (
                                            stats.recentOrders.map(order => (
                                                <tr key={order._id}>
                                                    <td className="ps-4 py-3">
                                                        <span className="fw-bold text-dark text-sm">#{order._id.substring(0, 8)}</span>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2" style={{ width: 30, height: 30 }}>
                                                                <FaUser size={12} className="text-secondary" />
                                                            </div>
                                                            <span className="text-dark text-sm fw-bold">{order.user?.name || 'Guest'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className="fw-bold text-success text-sm">${order.totalPrice}</span>
                                                    </td>
                                                    <td className="py-3">
                                                        <Badge bg={
                                                            order.orderStatus === 'Delivered' ? 'success' :
                                                                order.orderStatus === 'Processing' ? 'info' :
                                                                    order.orderStatus === 'Shipped' ? 'primary' : 'warning'
                                                        } className="px-3 py-2 rounded-pill fw-normal text-xs">
                                                            {order.orderStatus}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className="text-secondary text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="5" className="text-center py-4 text-muted small">No recent orders found</td></tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>
                {`
                .hover-card:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.1); }
                .transition-all { transition: all 0.3s ease; }
                .nav-pills-custom .nav-link { color: #6c757d; background: transparent; }
                .nav-pills-custom .nav-link.active { background: #4e73df; color: white; border-radius: 50rem; }
                `}
            </style>
        </Container>
    );
};

export default SystemOverview;
