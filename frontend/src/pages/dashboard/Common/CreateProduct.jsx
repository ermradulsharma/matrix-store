import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Spinner, Row, Col, Container } from 'react-bootstrap';
import { createProduct, fetchCategories } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';

import { toast } from 'react-toastify';

const CreateProduct = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Determine dashboard prefix based on role for redirect
    const getDashboardPrefix = () => {
        if (user?.role === 'super_admin') return '/products';
        if (user?.role === 'admin') return '/admin/products';
        if (user?.role === 'manager') return '/manager/products';
        if (user?.role === 'provider') return '/provider/products';
        return '/dashboard';
    };

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        category: '',
        description: '',
        brand: '',
        model: '',
        weight: '',
        status: 'active',
        approvalStatus: 'approved',
        sku: '',
        barcode: '',
        location: '',
        images: [{ public_id: 'manual_' + Date.now(), url: '' }],

        // Nested Objects
        dimensions: { width: '', height: '', depth: '' },
        stockLimits: { minStock: 10, maxStock: 500 },
        supplier: { name: '', contact: '', email: '', address: '' }
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await fetchCategories();
            setCategories(res);
        } catch (err) {
            console.error("Failed to load categories", err);
            toast.error("Failed to load categories. Please try again.");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handler for nested objects (e.g. dimensions.width)
    const handleNestedChange = (parent, field, value) => {
        setFormData({
            ...formData,
            [parent]: {
                ...formData[parent],
                [field]: value
            }
        });
    };

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImages = [...formData.images];
                newImages[index] = {
                    ...newImages[index],
                    url: reader.result, // for preview
                    file: file // for upload
                };
                setFormData({ ...formData, images: newImages });
            };
            reader.readAsDataURL(file);
        }
    };

    const addImageField = () => {
        setFormData({
            ...formData,
            images: [...formData.images, { public_id: 'manual_' + Date.now(), url: '' }]
        });
    };

    const removeImageField = (index) => {
        if (formData.images.length > 1) {
            const newImages = formData.images.filter((_, i) => i !== index);
            setFormData({ ...formData, images: newImages });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const myForm = new FormData();
        myForm.set("name", formData.name);
        myForm.set("price", formData.price);
        myForm.set("stock", formData.stock);
        myForm.set("category", formData.category);
        myForm.set("description", formData.description);
        myForm.set("brand", formData.brand);
        myForm.set("model", formData.model);
        myForm.set("weight", formData.weight);
        myForm.set("status", formData.status);
        myForm.set("approvalStatus", formData.approvalStatus);
        myForm.set("sku", formData.sku);
        myForm.set("barcode", formData.barcode);
        myForm.set("location", formData.location);

        // Stringify nested objects
        myForm.set("dimensions", JSON.stringify(formData.dimensions));
        myForm.set("stockLimits", JSON.stringify(formData.stockLimits));
        myForm.set("supplier", JSON.stringify(formData.supplier));

        // Append images
        // We need to differentiate between existing URL images (not possible to re-upload via File object)
        // and NEW File objects.
        // For Create Product, typically all are new Files eventually.
        // But our `images` state holds objects with `url`. 
        // We need to store the actual FILE object in the state to send it.
        // The current `handleImageChange` stores `url` (base64) for preview, but we can store `file` too.
        // Refactoring handleImageChange to store File object is needed, or we rely on the input ref?
        // Better to store File in state.

        // Assuming we updated handleImageChange to store file:
        // Let's iterate formData.images and append real files.
        formData.images.forEach((img) => {
            if (img.file) {
                myForm.append("images", img.file);
            }
        });

        try {
            const res = await createProduct(myForm);
            if (res.success) {
                toast.success("Product created successfully!");
                setTimeout(() => navigate(getDashboardPrefix()), 1500);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create product");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <Container fluid>
            <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Add New Product</h4>
                    <Button variant="danger" className="d-flex align-items-center gap-1" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> Back
                    </Button>
                </Card.Header>
                <Card.Body className="p-4">


                    <Form onSubmit={handleSubmit}>
                        {/* SECTION 1: Basic Details */}
                        <h5 className="mb-3 text-primary border-bottom pb-2">Basic Details</h5>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Product Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. Wireless Headphones"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Category *</Form.Label>
                                    <Form.Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">-- Select Category --</option>
                                        {categories.map((cat, idx) => (
                                            <option key={idx} value={cat.name || cat.title || cat}>
                                                {cat.name || cat.title || cat}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Brand</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Model</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Approval Status</Form.Label>
                                    <Form.Select name="approvalStatus" value={formData.approvalStatus} onChange={handleChange}>
                                        <option value="draft">Draft</option>
                                        <option value="pending_approval">Pending Approval</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* SECTION 2: Pricing & Inventory */}
                        <h5 className="mt-4 mb-3 text-primary border-bottom pb-2">Pricing & Inventory</h5>
                        <Row>
                            <Col md={3} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Price ($) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Initial Stock *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Min Stock Level</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.stockLimits.minStock}
                                        onChange={(e) => handleNestedChange('stockLimits', 'minStock', e.target.value)}
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Max Stock Level</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.stockLimits.maxStock}
                                        onChange={(e) => handleNestedChange('stockLimits', 'maxStock', e.target.value)}
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4} className="mb-3">
                                <Form.Group>
                                    <Form.Label>SKU (Stock Keeping Unit)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleChange}
                                        placeholder="e.g. ELEC-WH-001"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Barcode (ISBN/UPC)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="barcode"
                                        value={formData.barcode}
                                        onChange={handleChange}
                                        placeholder="e.g. 123456789"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Warehouse Location</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="e.g. Aisle 3, Shelf B"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* SECTION 3: Specifications */}
                        <h5 className="mt-4 mb-3 text-primary border-bottom pb-2">Specifications</h5>
                        <Row>
                            <Col md={3} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Weight (kg)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Width (cm)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.dimensions.width}
                                        onChange={(e) => handleNestedChange('dimensions', 'width', e.target.value)}
                                        step="0.01"
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Height (cm)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.dimensions.height}
                                        onChange={(e) => handleNestedChange('dimensions', 'height', e.target.value)}
                                        step="0.01"
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Depth (cm)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.dimensions.depth}
                                        onChange={(e) => handleNestedChange('dimensions', 'depth', e.target.value)}
                                        step="0.01"
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* SECTION 4: Supplier Information */}
                        <h5 className="mt-4 mb-3 text-primary border-bottom pb-2">Supplier Information (Optional)</h5>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Supplier Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.supplier.name}
                                        onChange={(e) => handleNestedChange('supplier', 'name', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Contact Person</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.supplier.contact}
                                        onChange={(e) => handleNestedChange('supplier', 'contact', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={formData.supplier.email}
                                        onChange={(e) => handleNestedChange('supplier', 'email', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.supplier.address}
                                        onChange={(e) => handleNestedChange('supplier', 'address', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* SECTION 5: Description & Media */}
                        <h5 className="mt-4 mb-3 text-primary border-bottom pb-2">Description & Media</h5>
                        <div className="mb-3">
                            <Form.Group>
                                <Form.Label>Product Description *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={5}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </div>

                        <div className="mb-4">
                            <Form.Label>Product Images</Form.Label>
                            {formData.images.map((img, index) => (
                                <div key={index} className="d-flex mb-2 flex-column">
                                    <div className="d-flex gap-2 mb-2">
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(index, e)}
                                            required={img.url === ''}
                                        />
                                        {formData.images.length > 1 && (
                                            <Button
                                                variant="outline-danger"
                                                onClick={() => removeImageField(index)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        )}
                                    </div>
                                    {img.url && (
                                        <div className="mb-2">
                                            <img
                                                src={img.url}
                                                alt={`Preview ${index}`}
                                                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <Button variant="outline-primary" size="sm" onClick={addImageField}>
                                <FaPlus className="me-1" /> Add Another Image
                            </Button>
                            <Form.Text className="text-muted d-block mt-2">
                                Upload product images (Max 5MB per image).
                            </Form.Text>
                        </div>

                        <div className="d-flex justify-content-end pt-3 border-top">
                            <Button variant="secondary" className="me-2" onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? <Spinner as="span" animation="border" size="sm" /> : <><FaBoxOpen className="me-2" /> Create Product</>}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CreateProduct;
