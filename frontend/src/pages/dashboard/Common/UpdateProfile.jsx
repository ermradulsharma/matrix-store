import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner, Container, Row, Col, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../../../services/api';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const UpdateProfile = () => {
    const [user, setUser] = useState({
        first_name: "",
        last_name: "",
        email: "",
        mobile_no: "",
    });
    const [image, setImage] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("/profile.png");

    const { first_name, last_name, email, mobile_no } = user;

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Assuming authUser is available from a context or prop.
    // For this example, we'll simulate it or fetch it if not provided.
    // If authUser is not passed, the initial load will fetch it.
    const [authUser, setAuthUser] = useState(null);

    useEffect(() => {
        const fetchAuthUser = async () => {
            setLoading(true);
            try {
                const res = await getUserProfile(); // Fetch user profile to populate initial state
                setAuthUser(res.user);
            } catch (error) {
                toast.error("Failed to load user data.");
            } finally {
                setLoading(false);
            }
        };

        if (!authUser) {
            fetchAuthUser();
        }
    }, [authUser]); // Depend on authUser to avoid re-fetching if already set

    useEffect(() => {
        if (authUser) {
            setUser({
                first_name: authUser.first_name || "",
                last_name: authUser.last_name || "",
                email: authUser.email || "",
                mobile_no: authUser.mobile_no || "",
            });
            if (authUser.image && authUser.image.url) {
                setAvatarPreview(authUser.image.url);
            }
        }
    }, [authUser]);

    const handleChange = (e) => {
        if (e.target.name === "image") {
            const file = e.target.files[0];
            setImage(file);
            setAvatarPreview(URL.createObjectURL(file));
        } else {
            setUser({ ...user, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const myForm = new FormData();
            myForm.set("first_name", first_name);
            myForm.set("last_name", last_name);
            myForm.set("email", email);
            myForm.set("mobile_no", mobile_no);
            if (image) {
                myForm.set("image", image);
            }

            const res = await updateUserProfile(myForm);
            if (res.success) {
                toast.success("Profile updated successfully");
                // Optional: update context user if name changed
                setTimeout(() => navigate(0), 1000); // Reload to reflect changes if context doesn't auto-update
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <Container fluid>
            <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
                    <h4>Update Profile</h4>
                    <Button variant="danger" className="d-flex align-items-center gap-1" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> Back
                    </Button>
                </Card.Header>
                <Card.Body className="p-4">


                    <Form onSubmit={handleSubmit}>
                        <div className='d-flex justify-content-center mb-4'>
                            <div style={{ position: "relative", display: "inline-block" }}>
                                <Image
                                    src={avatarPreview}
                                    alt="Avatar Preview"
                                    className="rounded-circle"
                                    width="120"
                                    height="120"
                                    style={{ objectFit: "cover", border: "3px solid #ddd" }}
                                />
                                <Form.Label htmlFor="image-upload" style={{ position: "absolute", bottom: 5, right: 5, cursor: "pointer", background: "white", borderRadius: "50%", padding: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}>
                                    <i className='bi bi-camera-fill text-primary'></i>
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    id="image-upload"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleChange}
                                    style={{ display: "none" }}
                                />
                            </div>
                        </div>

                        <Row>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="first_name"
                                        value={first_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="last_name"
                                        value={last_name}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={email}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mobile Number</Form.Label>
                            <Form.Control
                                type="tel"
                                name="mobile_no"
                                value={mobile_no}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" className="d-flex align-items-center gap-1" onClick={() => navigate(-1)}>
                                <FaTimes className="me-1" /> Cancel
                            </Button>
                            <Button variant="primary" type="submit" className="d-flex align-items-center gap-1">
                                <FaSave className="me-1" /> Save Changes
                            </Button>
                        </div>
                    </Form>
                </Card.Body >
            </Card >
        </Container >
    );
};

export default UpdateProfile;
