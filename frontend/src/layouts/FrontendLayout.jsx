import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/frontend/NavBar/NavBar';
import Footer from '../components/frontend/Footer/Footer';

const FrontendLayout = () => (
    <>
        <NavBar />
        <Outlet />
        <Footer />
    </>
);

export default FrontendLayout;
