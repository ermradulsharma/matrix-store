import React, { useContext } from 'react';
import { Navbar, Nav, Container, Badge, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Cart3, Heart, Person, BoxSeam } from 'react-bootstrap-icons';
import { CartContext } from '../../../context/CartContext';
import { WishlistContext } from '../../../context/WishlistContext';
import { AuthContext } from '../../../context/AuthContext';
import '../../../styles/components/NavBar.css';

function NavBar() {
    const { cartCount } = useContext(CartContext);
    const { wishlistCount } = useContext(WishlistContext);
    const { isAuthenticated, user } = useContext(AuthContext);

    return (
        <Navbar expand="lg" className="modern-navbar" sticky="top">
            <Container>
                <Navbar.Brand as={Link} to="/" className="brand-logo">
                    <BoxSeam size={28} className="brand-icon" />
                    <span className="brand-text">Matrix Store</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="navbar-nav" />

                <Navbar.Collapse id="navbar-nav">
                    <Nav className="mx-auto nav-links">
                        <Nav.Link as={Link} to="/" className="nav-item-custom">
                            Home
                        </Nav.Link>
                        <Nav.Link as={Link} to="/shop" className="nav-item-custom">
                            Shop
                        </Nav.Link>
                        <Nav.Link as={Link} to="/about" className="nav-item-custom">
                            About
                        </Nav.Link>
                        <Nav.Link as={Link} to="/services" className="nav-item-custom">
                            Services
                        </Nav.Link>
                        <Nav.Link as={Link} to="/contact" className="nav-item-custom">
                            Contact
                        </Nav.Link>
                    </Nav>

                    <Nav className="nav-icons">
                        {/* Wishlist */}
                        <Nav.Link as={Link} to="/wishlist" className="icon-link">
                            <div className="icon-wrapper">
                                <Heart size={22} />
                                {wishlistCount > 0 && (
                                    <Badge bg="danger" pill className="icon-badge">
                                        {wishlistCount}
                                    </Badge>
                                )}
                            </div>
                        </Nav.Link>

                        {/* Cart */}
                        <Nav.Link as={Link} to="/cart" className="icon-link">
                            <div className="icon-wrapper">
                                <Cart3 size={22} />
                                {cartCount > 0 && (
                                    <Badge bg="primary" pill className="icon-badge">
                                        {cartCount}
                                    </Badge>
                                )}
                            </div>
                        </Nav.Link>

                        {/* User */}
                        {isAuthenticated ? (
                            <NavDropdown
                                title={
                                    <div className="user-dropdown-toggle">
                                        <Person size={22} />
                                        <span className="d-none d-lg-inline ms-2">{user?.name || 'User'}</span>
                                    </div>
                                }
                                id="user-dropdown"
                                align="end"
                                className="user-dropdown"
                            >
                                <NavDropdown.Item as={Link} to="/profile">
                                    <Person className="me-2" /> My Profile
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/wishlist">
                                    <Heart className="me-2" /> Wishlist
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/cart">
                                    <Cart3 className="me-2" /> My Cart
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item as={Link} to="/login">
                                    Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Nav.Link as={Link} to="/login" className="login-btn">
                                <Person size={20} className="me-1" />
                                <span>Login</span>
                            </Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavBar;
