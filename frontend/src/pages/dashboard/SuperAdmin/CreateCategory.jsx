import React, { useState } from 'react';
import { Form, Button, Card, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createCategory } from '../../../services/api';
import { FaSave, FaArrowLeft, FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

import { toast } from 'react-toastify';

const CreateCategory = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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

        if (!formData.image) {
            toast.error('Please select an image');
            setLoading(false);
            return;
        }

        try {
            const res = await createCategory(formData);
            if (res.success) {
                toast.success("Category created successfully!");
                setTimeout(() => navigate(-1), 1500);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid>
            <Card className="border-0 rounded-3 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom">
                    <h4 className="fw-bold text-dark mb-0">Create New Category</h4>
                    <Button variant="danger" className='d-flex align-items-center gap-1 justify-content-center' onClick={() => navigate(-1)}><FaArrowLeft /> Back </Button>
                </Card.Header>
                <Card.Body className="p-4">


                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={12} className="mb-3">
                                <Form.Group>
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
                            </Col>

                            <Col md={12} className="mb-3">
                                <Form.Group>
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
                            </Col>

                            <Col md={12} className="mb-4">
                                <Form.Group>
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
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" className='d-flex align-items-center gap-1 justify-content-center' onClick={() => navigate(-1)}>
                                <FaTimes className="me-1" /> Cancel
                            </Button>
                            <Button variant="primary" type="submit" className='d-flex align-items-center gap-1 justify-content-center' disabled={loading}>
                                {loading ? <Spinner as="span" animation="border" size="sm" /> : <><FaSave className="me-2" /> Create Category</>}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CreateCategory;
