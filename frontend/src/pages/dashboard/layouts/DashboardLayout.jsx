import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';

import DashboardFooter from '../components/DashboardFooter';

const DashboardLayout = () => {
    const [collapsed, setCollapsed] = React.useState(false);

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
            <Sidebar collapsed={collapsed} />
            <div className="flex-grow-1 d-flex flex-column" style={{ height: '100%', overflow: 'hidden' }}>
                <div className="flex-shrink-0">
                    <DashboardHeader toggleSidebar={toggleSidebar} collapsed={collapsed} />
                </div>
                <div className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa', overflowY: 'auto' }}>
                    <Outlet />
                </div>
                <div className="flex-shrink-0">
                    <DashboardFooter />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
