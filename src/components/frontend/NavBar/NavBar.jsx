import React from 'react';
import { Navbar, Nav, NavDropdown, Image } from 'react-bootstrap';
import logo from '../../../logo.svg';

function NavBar() {
  return (
    <Navbar className="px-2" bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="/" className="d-flex align-items-center fs-3 fw-bold text-decoration-none">
            <Image src={logo} alt="Logo" width={75} className="d-inline-block App-logo" />
            {' Matrix'}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
                <Nav.Link href="/product">Product</Nav.Link>
                <Nav.Link href="/about">About</Nav.Link>
                <Nav.Link href="/services">Services</Nav.Link>
                <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                    <NavDropdown.Item href="/action1">Action 1</NavDropdown.Item>
                    <NavDropdown.Item href="/action2">Action 2</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="/action3">Action 3</NavDropdown.Item>
                </NavDropdown>
                <Nav.Link href="/contact">Contact</Nav.Link>
            </Nav>
        </Navbar.Collapse>
    </Navbar>
  )
}

export default NavBar
