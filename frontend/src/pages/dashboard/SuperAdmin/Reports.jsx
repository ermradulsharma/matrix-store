import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Table, Spinner, Badge } from 'react-bootstrap';
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
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Analytics & Reports</h2>
                <div className="d-flex gap-2">
                    <Form.Select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        style={{ width: '150px' }}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </Form.Select>
                    <Button variant="outline-primary" onClick={downloadReport}>
                        <FaDownload className="me-2" /> Export PDF
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-center p-5"><Spinner animation="border" /></div>
            ) : (
                <>
                    {/* Revenue Chart */}
                    <Row className="mb-4">
                        <Col md={12}>
                            <Card className="shadow-sm">
                                <Card.Header className="bg-white py-3">
                                    <h5 className="mb-0">Revenue Overview</h5>
                                </Card.Header>
                                <Card.Body>
                                    <div style={{ height: 350, width: '100%' }}>
                                        <ResponsiveContainer>
                                            <LineChart data={data?.trend || []}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="value" stroke="#8884d8" name="Revenue ($)" strokeWidth={2} />
                                                <Line type="monotone" dataKey="count" stroke="#82ca9d" name="Orders" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        {/* Top Products */}
                        <Col md={8} className="mb-4">
                            <Card className="shadow-sm h-100">
                                <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0"><FaTrophy className="text-warning me-2" />Top Selling Products</h5>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <Table hover responsive className="mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Product</th>
                                                <th>Units Sold</th>
                                                <th>Revenue</th>
                                                <th>Owner</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data?.topProducts?.map((product, idx) => (
                                                <tr key={idx}>
                                                    <td>{product.name}</td>
                                                    <td><Badge bg="info">{product.quantity}</Badge></td>
                                                    <td>${product.revenue}</td>
                                                    <td>
                                                        {product.owner ? (
                                                            <small className="text-muted">
                                                                {product.owner.name} <br />
                                                                <span className="text-capitalize badge bg-light text-dark">{product.owner.role}</span>
                                                            </small>
                                                        ) : 'Unknown'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!data?.topProducts || data.topProducts.length === 0) && (
                                                <tr><td colSpan="4" className="text-center">No data availble</td></tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Sales by Owner Role */}
                        <Col md={4} className="mb-4">
                            <Card className="shadow-sm h-100">
                                <Card.Header className="bg-white py-3">
                                    <h5 className="mb-0"><FaUserTie className="me-2" />Sales by Owner Role</h5>
                                </Card.Header>
                                <Card.Body>
                                    <div style={{ height: 300, width: '100%' }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie
                                                    data={data?.salesByRole || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {(data?.salesByRole || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => `$${value}`} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="text-center text-muted small mt-2">
                                        Revenue contribution by product owner type
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default Reports;
