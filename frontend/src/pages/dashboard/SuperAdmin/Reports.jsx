import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Table, Spinner, Badge, Container } from 'react-bootstrap';
import { fetchAdvancedStats } from '../../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaDownload, FaTrophy, FaUserTie } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
    const [period, setPeriod] = useState('monthly');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAdvancedStats(period);
            if (res.data.success) {
                setData(res.data);
            }
        } catch (error) {
            console.error("Error loading reports:", error);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const downloadReport = () => {
        const doc = new jsPDF();
        doc.text(`Sales & Performance Report (${period.toUpperCase()})`, 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);

        // Revenue Trend Table
        if (data?.trend) {
            autoTable(doc, {
                startY: 30,
                head: [['Period', 'Revenue', 'Orders']],
                body: data.trend.map(t => [t.name, `$${t.value}`, t.count])
            });
        }

        // Top Products
        if (data?.topProducts) {
            doc.text("Top Selling Products", 14, doc.lastAutoTable.finalY + 15);
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 20,
                head: [['Product', 'Sold', 'Revenue', 'Owner']],
                body: data.topProducts.map(p => [
                    p.name,
                    p.quantity,
                    `$${p.revenue}`,
                    p.owner?.name || 'Unknown'
                ])
            });
        }

        doc.save(`report-${period}-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Analytics & Reports</h2>
                    <p className="text-muted mb-0">Deep dive into your store's performance metrics.</p>
                </div>
                <div className="d-flex gap-2 p-1 bg-white rounded shadow-sm border">
                    <Form.Select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="border-0 shadow-none bg-light fw-bold text-dark"
                        style={{ width: '150px' }}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </Form.Select>
                    <Button variant="primary" className="d-flex align-items-center gap-2" onClick={downloadReport}>
                        <FaDownload size={14} /> Export PDF
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
            ) : (
                <>
                    {/* Revenue Chart */}
                    <Row className="mb-4">
                        <Col md={12}>
                            <Card className="border-0 shadow-sm rounded-3">
                                <Card.Header className="bg-white py-3 border-bottom">
                                    <h5 className="fw-bold mb-0 text-dark">Revenue Overview</h5>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <div style={{ height: 350, width: '100%' }}>
                                        <ResponsiveContainer>
                                            <LineChart data={data?.trend || []}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e6f0" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#858796', fontSize: 12 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#858796', fontSize: 12 }} />
                                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                <Legend />
                                                <Line type="monotone" dataKey="value" stroke="#4e73df" name="Revenue ($)" strokeWidth={3} dot={{ r: 4, fill: '#4e73df' }} />
                                                <Line type="monotone" dataKey="count" stroke="#1cc88a" name="Orders" strokeWidth={3} dot={{ r: 4, fill: '#1cc88a' }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row className="g-4">
                        {/* Top Products */}
                        <Col lg={8}>
                            <Card className="border-0 shadow-sm rounded-3 h-100">
                                <Card.Header className="bg-white py-3 border-bottom d-flex align-items-center">
                                    <FaTrophy className="text-warning me-2" size={18} />
                                    <h5 className="fw-bold mb-0 text-dark">Top Selling Products</h5>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <Table responsive hover className="mb-0 align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="ps-4 py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Product</th>
                                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Units Sold</th>
                                                <th className="py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Revenue</th>
                                                <th className="pe-4 py-3 text-uppercase text-secondary text-xs font-weight-bolder opacity-7 border-0">Owner</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data?.topProducts?.map((product, idx) => (
                                                <tr key={idx}>
                                                    <td className="ps-4 py-3 fw-bold text-dark text-sm">{product.name}</td>
                                                    <td className="py-3">
                                                        <Badge bg="info" className="rounded-pill px-3">{product.quantity} Sold</Badge>
                                                    </td>
                                                    <td className="py-3 text-success fw-bold text-sm">
                                                        ${product.revenue.toLocaleString()}
                                                    </td>
                                                    <td className="pe-4 py-3">
                                                        {product.owner ? (
                                                            <div className="d-flex flex-column">
                                                                <span className="text-dark text-sm fw-bold">{product.owner.name}</span>
                                                                <span className="text-muted text-xs text-capitalize">{product.owner.role}</span>
                                                            </div>
                                                        ) : <span className="text-muted text-sm fst-italic">Unknown</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!data?.topProducts || data.topProducts.length === 0) && (
                                                <tr><td colSpan="4" className="text-center py-5 text-muted small">No data available</td></tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Sales by Owner Role */}
                        <Col lg={4}>
                            <Card className="border-0 shadow-sm rounded-3 h-100">
                                <Card.Header className="bg-white py-3 border-bottom">
                                    <h5 className="fw-bold mb-0 text-dark"><FaUserTie className="me-2 text-primary" />Sales by Owner Role</h5>
                                </Card.Header>
                                <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center">
                                    <div style={{ height: 300, width: '100%' }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie
                                                    data={data?.salesByRole || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    paddingAngle={5}
                                                >
                                                    {(data?.salesByRole || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => `$${value}`} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="text-center text-muted text-xs mt-3">
                                        Revenue contribution by product owner type
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
};

export default Reports;
