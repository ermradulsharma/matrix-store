import React from 'react';
import { useAuth } from '../../context/AuthContext';

import SystemOverview from './SuperAdmin/SystemOverview';

const DashboardHome = () => {
    const { user } = useAuth();

    if (user?.role === 'super_admin') {
        return <SystemOverview />;
    }

    return (
        <div className="container-fluid">
            <h2 className="mb-4">Welcome back, {user?.first_name}!</h2>
            <div className="row">
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title text-muted">Role</h5>
                            <p className="card-text h3 text-capitalize">{user?.role?.replace('_', ' ')}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title text-muted">Status</h5>
                            <p className="card-text h3 text-success">Active</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
