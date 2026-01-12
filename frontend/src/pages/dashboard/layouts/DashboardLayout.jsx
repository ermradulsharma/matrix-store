import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';

const DashboardLayout = () => {
    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            <Sidebar />
            <div className="flex-grow-1 d-flex flex-column">
                <DashboardHeader />
                <div className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa' }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
