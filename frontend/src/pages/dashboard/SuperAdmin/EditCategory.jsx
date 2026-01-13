import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCategoryDetails, updateCategory } from '../../../services/api';
import { FaSave, FaArrowLeft, FaCloudUploadAlt } from 'react-icons/fa';

const EditCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: ''
    });

    useEffect(() => {
        loadCategory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadCategory = async () => {
        try {
            const data = await fetchCategoryDetails(id);
            setFormData({
                title: data.title,
                description: data.description || '',
                image: '' // Don't preload existing image into upload field
            });
            // Show existing image in preview
            if (data.image?.url) {
                setImagePreview(data.image.url);
            }
        } catch (err) {
            setError('Failed to load category details');
        } finally {
            setLoading(false);
        }
    };

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
        setSubmitting(true);
        setError('');

        // Prepare data - valid even if image is not updated (backend should handle it)
        const updateData = {
            title: formData.title,
            description: formData.description
        };
        if (formData.image) {
            updateData.image = formData.image;
        }

        try {
            const res = await updateCategory(id, updateData);
            if (res.success) {
                navigate('../..'); // Go back to list (up two levels because of 'edit/:id')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update category');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <Spinner animation="border" variant="primary" />
        </div>
    );

    return (
        <Container fluid className="p-4">
            <Button variant="light" className="mb-4 text-primary fw-bold" onClick={() => navigate('../..')}>
                <FaArrowLeft className="me-2" /> Back to Categories
            </Button>

            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white py-3 border-bottom-0">
                            <h4 className="fw-bold text-dark mb-0">Edit Category</h4>
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
                                                Leave empty to keep existing image.
                                            </Form.Text>
                                        </div>
                                    </div>
                                </Form.Group>

                                <div className="d-grid">
                                    <Button variant="primary" type="submit" disabled={submitting} size="lg">
                                        {submitting ? <Spinner as="span" animation="border" size="sm" /> : <><FaSave className="me-2" /> Update Category</>}
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

export default EditCategory;
