import React, { useState } from 'react';
import { Form, Button, Card, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createCategory } from '../../../services/api';
import { FaSave, FaArrowLeft, FaCloudUploadAlt } from 'react-icons/fa';

const CreateCategory = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.image) {
            setError('Please select an image');
            setLoading(false);
            return;
        }

        try {
            const res = await createCategory(formData);
            if (res.success) {
                navigate('..'); // Go back to list
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="p-4">
            <Button variant="light" className="mb-4 text-primary fw-bold" onClick={() => navigate('..')}>
                <FaArrowLeft className="me-2" /> Back to Categories
            </Button>

            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white py-3 border-bottom-0">
                            <h4 className="fw-bold text-dark mb-0">Create New Category</h4>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. Electronics"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Optional description..."
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Category Image</Form.Label>
                                    <div className="d-flex align-items-center">
                                        <div className="me-3 border rounded d-flex align-items-center justify-content-center bg-light"
                                            style={{ width: '100px', height: '100px', overflow: 'hidden' }}>
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <FaCloudUploadAlt size={30} className="text-muted" />
                                            )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                            <Form.Text className="text-muted">
                                                Recommended size: 500x500px. Max 2MB.
                                            </Form.Text>
                                        </div>
                                    </div>
                                </Form.Group>

                                <div className="d-grid">
                                    <Button variant="primary" type="submit" disabled={loading} size="lg">
                                        {loading ? <Spinner as="span" animation="border" size="sm" /> : <><FaSave className="me-2" /> Create Category</>}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateCategory;
