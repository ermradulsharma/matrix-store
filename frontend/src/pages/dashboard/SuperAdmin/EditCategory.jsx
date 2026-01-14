import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCategoryDetails, updateCategory } from '../../../services/api';
import { FaSave, FaArrowLeft, FaCloudUploadAlt } from 'react-icons/fa';

import { toast } from 'react-toastify';

const EditCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
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
            toast.error('Failed to load category details');
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
                setFormData({ ...formData, image: file });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const myForm = new FormData();
        myForm.set("title", formData.title);
        myForm.set("description", formData.description);
        if (formData.image instanceof File) {
            myForm.set("image", formData.image);
        }

        try {
            const res = await updateCategory(id, myForm);
            if (res.success) {
                toast.success("Category updated successfully");
                setTimeout(() => navigate(-1), 1500);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update category');
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
            <Button variant="light" className="mb-4 text-primary fw-bold" onClick={() => navigate(-1)}>
                <FaArrowLeft className="me-2" /> Back to Categories
            </Button>

            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white py-3 border-bottom-0">
                            <h4 className="fw-bold text-dark mb-0">Edit Category</h4>
                        </Card.Header>
                        <Card.Body className="p-4">


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
