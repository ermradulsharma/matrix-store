import React, { useContext, useState } from 'react';
import { Container, Form, Button, Card, Row, Col, ProgressBar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { sendOtp, verifyOtp } from '../../services/api';
import { toast } from 'react-toastify';

const Register = () => {
    const { register, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');

    const [formData, setFormData] = useState({
        mobile_no: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: '',
        // Address fields
        house_no: '',
        street_name: '',
        address_line_1: '',
        address_line_2: '',
        district: '',
        state: '',
        country: '',
        pincode: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ================= STEP 1: MOBILE & OTP =================
    const handleSendOtp = async () => {
        if (!formData.mobile_no || formData.mobile_no.length !== 10) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }
        setLoading(true);
        try {
            await sendOtp(formData.mobile_no);
            setOtpSent(true);
            toast.info('OTP sent: 1234'); // Visualization for the user
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.error('Please enter the OTP');
            return;
        }
        setLoading(true);
        try {
            await verifyOtp(formData.mobile_no, otp);
            setStep(2);
            setOtpSent(false); // Reset for clean state if needed later
            toast.success("Mobile Verified!");
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // ================= STEP 2: USER DETAILS =================
    const handleStep2Submit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.first_name || !formData.email || !formData.password || !formData.confirm_password) {
            toast.error('Please fill in all required fields');
            return;
        }
        if (formData.password !== formData.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }
        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        setStep(3);
    };

    // ================= STEP 3: ADDRESS & SUBMIT =================
    const fetchCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // OpenStreetMap Nominatim API
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    if (data.address) {
                        const addr = data.address;
                        setFormData((prev) => ({
                            ...prev,
                            // Map OSM fields to our fields best effort
                            house_no: addr.house_number || '',
                            street_name: addr.road || '',
                            address_line_1: addr.suburb || addr.neighbourhood || '',
                            address_line_2: addr.city_district || '',
                            district: addr.city || addr.town || addr.county || '',
                            state: addr.state || '',
                            country: addr.country || '',
                            pincode: addr.postcode || ''
                        }));
                        toast.success("Location Fetched!");
                    }
                } catch (err) {
                    console.error('Error fetching address:', err);
                    toast.error('Failed to fetch address details');
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                console.error('Geolocation error:', err);
                toast.error('Unable to retrieve your location');
                setLoading(false);
            }
        );
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();

        // Final validation if needed
        if (!formData.district || !formData.state || !formData.pincode) {
            toast.error('Please complete the address details');
            return;
        }

        const result = await register(formData);
        if (result.success) {
            toast.success("Registration Successful!");
            navigate('/profile');
        }
    };

    // ================= RENDER HELPERS =================
    const renderStep1 = () => (
        <Form>
            <Form.Group className="mb-3">
                <Form.Label>Mobile Number</Form.Label>
                <Form.Control type="tel" placeholder="Enter 10-digit mobile number" name="mobile_no" value={formData.mobile_no} onChange={handleChange} maxLength="10" disabled={otpSent} />
            </Form.Group>

            {otpSent && (
                <Form.Group className="mb-3">
                    <Form.Label>Enter OTP</Form.Label>
                    <Form.Control type="text" placeholder="Enter OTP (Use 1234)" value={otp} onChange={(e) => setOtp(e.target.value)} />
                </Form.Group>
            )}

            {!otpSent ? (
                <Button variant="primary" onClick={handleSendOtp} disabled={loading} className="w-100">
                    {loading ? 'Sending...' : 'Send OTP'}
                </Button>
            ) : (
                <Button variant="success" onClick={handleVerifyOtp} disabled={loading} className="w-100">
                    {loading ? 'Verifying...' : 'Verify & Next'}
                </Button>
            )}
        </Form>
    );

    const renderStep2 = () => (
        <Form onSubmit={handleStep2Submit}>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required minLength="8" />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} required />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">Next: Shipping Address</Button>
        </Form>
    );

    const renderStep3 = () => (
        <Form onSubmit={handleFinalSubmit}>
            <div className="d-flex justify-content-end mb-3">
                <Button variant="outline-primary" size="sm" onClick={fetchCurrentLocation} disabled={loading}>
                    <i className="bi bi-geo-alt"></i> {loading ? 'Locating...' : 'Use Current Location'}
                </Button>
            </div>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>House No.</Form.Label>
                        <Form.Control type="text" name="house_no" value={formData.house_no} onChange={handleChange} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Street Name</Form.Label>
                        <Form.Control type="text" name="street_name" value={formData.street_name} onChange={handleChange} />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Address Line 1</Form.Label>
                <Form.Control type="text" name="address_line_1" value={formData.address_line_1} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Address Line 2</Form.Label>
                <Form.Control type="text" name="address_line_2" value={formData.address_line_2} onChange={handleChange} />
            </Form.Group>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>District/City</Form.Label>
                        <Form.Control type="text" name="district" value={formData.district} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>State</Form.Label>
                        <Form.Control type="text" name="state" value={formData.state} onChange={handleChange} required />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Country</Form.Label>
                        <Form.Control type="text" name="country" value={formData.country} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Pin Code</Form.Label>
                        <Form.Control type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />
                    </Form.Group>
                </Col>
            </Row>

            <div className="d-grid gap-2">
                <Button variant="primary" type="submit" disabled={authLoading}>
                    {authLoading ? 'Registering...' : 'Complete Registration'}
                </Button>
                <Button variant="secondary" onClick={() => setStep(2)}>
                    Back
                </Button>
            </div>
        </Form>
    );

    return (
        <Container className="my-5" style={{ maxWidth: '700px' }}>
            <Card className="shadow-sm">
                <Card.Body>
                    <h2 className="text-center mb-4">Register in 3 Steps</h2>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <ProgressBar>
                            <ProgressBar key={1} now={33.3} label="Mobile" variant={step >= 1 ? "success" : "secondary"} animated={step === 1} />
                            <ProgressBar key={2} now={33.3} label="Details" variant={step >= 2 ? "success" : "secondary"} animated={step === 2} />
                            <ProgressBar key={3} now={33.4} label="Address" variant={step >= 3 ? "success" : "secondary"} animated={step === 3} />
                        </ProgressBar>
                    </div>

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    <div className="text-center mt-3">
                        <span>Already have an account? </span>
                        <Link to="/login">Login here</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Register;
