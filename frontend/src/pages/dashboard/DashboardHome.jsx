import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SystemOverview from './SuperAdmin/SystemOverview';
import ManagerDashboard from './Manager/ManagerDashboard';
import ProviderDashboard from './Provider/ProviderDashboard';

const DashboardHome = () => {
    const { user } = useAuth();

    if (user?.role === 'super_admin' || user?.role === 'admin') {
        return <SystemOverview />;
    } else if (user?.role === 'manager') {
        return <ManagerDashboard />;
    } else if (user?.role === 'provider') {
        return <ProviderDashboard />;
    }

    return <div className="p-5 text-center">Unauthorized Access</div>;
};

export default DashboardHome;
