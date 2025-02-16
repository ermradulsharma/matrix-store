import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import './App.css';
import NavBar from './components/frontend/NavBar/NavBar';
import Home from './pages/frontend/Home';
import Product from './pages/frontend/Product';
import About from './pages/frontend/About';
import Services from './pages/frontend/Services';
import Contact from './pages/frontend/Contact';
import Footer from './components/frontend/Footer/Footer';
import ProductDetails from './components/frontend/ProductDetails/ProductDetails';

function App() {
    return (
        <Router>
            <Container fluid className="px-0">
                <NavBar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/product" element={<Product />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/contact" element={<Contact />} />
                </Routes>
                <Footer />
            </Container>
        </Router>
    );
}

export default App;
