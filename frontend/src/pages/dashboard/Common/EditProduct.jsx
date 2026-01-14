import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Spinner, Row, Col } from 'react-bootstrap';
import { fetchProductById, updateProduct, fetchCategories } from '../../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTrash, FaPlus } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';

import { toast } from 'react-toastify';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

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
        images: [{ public_id: 'manual', url: '' }],

        // Nested Objects
        dimensions: { width: '', height: '', depth: '' },
        stockLimits: { minStock: 10, maxStock: 500 },
        supplier: { name: '', contact: '', email: '', address: '' }
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [paramRes, catRes] = await Promise.all([
                    fetchProductById(id),
                    fetchCategories()
                ]);

                // Populate form
                if (paramRes) {
                    setFormData({
                        name: paramRes.name || '',
                        price: paramRes.price || '',
                        stock: paramRes.stock || '',
                        category: paramRes.category || '',
                        description: paramRes.description || '',
                        brand: paramRes.brand || '',
                        model: paramRes.model || '',
                        weight: paramRes.weight || '',
                        status: paramRes.status || 'active',
                        images: paramRes.images && paramRes.images.length > 0
                            ? paramRes.images.map(img => ({ public_id: img.public_id || 'manual', url: img.url || img }))
                            : [{ public_id: 'manual', url: '' }],

                        // Populate nested objects safely
                        dimensions: {
                            width: paramRes.dimensions?.width || '',
                            height: paramRes.dimensions?.height || '',
                            depth: paramRes.dimensions?.depth || ''
                        },
                        stockLimits: {
                            minStock: paramRes.stockLimits?.minStock || 10,
                            maxStock: paramRes.stockLimits?.maxStock || 500
                        },
                        supplier: {
                            name: paramRes.supplier?.name || '',
                            contact: paramRes.supplier?.contact || '',
                            email: paramRes.supplier?.email || '',
                            address: paramRes.supplier?.address || ''
                        }
                    });
                }
                setCategories(catRes);
            } catch (err) {
                console.error("Failed to load product data", err);
                toast.error("Failed to load product details.");
            } finally {
                setInitialLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
                    url: reader.result, // preview
                    file: file // upload
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

        // Stringify nested objects
        myForm.set("dimensions", JSON.stringify(formData.dimensions));
        myForm.set("stockLimits", JSON.stringify(formData.stockLimits));
        myForm.set("supplier", JSON.stringify(formData.supplier));

        // Handle Images
        // If we have existing images (objects with public_id != 'manual_...'), we might want to keep them.
        // But Multer only handles NEW files.
        // If we want to DELETE existing images that are removed from UI, we need a separate field e.g. 'imagesToDelete' or 'retainedImages'.
        // For simplicity in this local upload migration:
        // 1. New files are appended.
        // 2. Existing images are kept unless we implement a comprehensive 'retainedImages' logic.
        // Let's implement a 'retainedImages' field which is a stringified array of public_ids/urls to KEEP.
        // But backend `updateProduct` currently just appends new files to existing.
        // It doesn't handle deletion or filtering based on retained list yet.
        // For now, let's just send new files. Deletion of old files is a separate feature or needs backend logic update.
        // I'll stick to sending new files.

        formData.images.forEach((img) => {
            if (img.file) {
                myForm.append("images", img.file);
            }
        });

        try {
            const res = await updateProduct(id, myForm);
            if (res.success) {
                toast.success("Product updated successfully!");
                setTimeout(() => navigate(getDashboardPrefix()), 1500);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update product");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex align-items-center mb-4">
                <Button variant="link" className="text-decoration-none me-2 p-0" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </Button>
                <h2 className="mb-0">Edit Product</h2>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <Card className="shadow-sm border-0">
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
                                            <Form.Label>Stock Quantity *</Form.Label>
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
                                        Upload new images to append. Existing images are kept.
                                    </Form.Text>
                                </div>

                                <div className="d-flex justify-content-end pt-3 border-top">
                                    <Button variant="secondary" className="me-2" onClick={() => navigate(-1)}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit" disabled={loading}>
                                        {loading ? <Spinner as="span" animation="border" size="sm" /> : <><FaSave className="me-2" /> Save Changes</>}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;
