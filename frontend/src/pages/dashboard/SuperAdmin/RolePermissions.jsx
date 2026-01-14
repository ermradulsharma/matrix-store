import React, { useState, useEffect } from 'react';
import { Button, Spinner, Card } from 'react-bootstrap';
import { fetchRoles, updateRolePermissions } from '../../../services/api';
import { toast } from 'react-toastify';
import { FaSave } from 'react-icons/fa';

// Import local copy of permission strings matching backend
const PERMISSIONS = {
    // User
    USER_CREATE: 'user_create', USER_READ: 'user_read', USER_UPDATE: 'user_update', USER_DELETE: 'user_delete',
    // Product
    PRODUCT_CREATE: 'product_create', PRODUCT_READ: 'product_read', PRODUCT_UPDATE: 'product_update', PRODUCT_DELETE: 'product_delete',
    // Category
    CATEGORY_CREATE: 'category_create', CATEGORY_READ: 'category_read', CATEGORY_UPDATE: 'category_update', CATEGORY_DELETE: 'category_delete',
    // Order
    ORDER_READ: 'order_read', ORDER_UPDATE: 'order_update', ORDER_DELETE: 'order_delete',
    // Provider
    PROVIDER_CREATE: 'provider_create', PROVIDER_READ: 'provider_read', PROVIDER_UPDATE: 'provider_update', PROVIDER_DELETE: 'provider_delete',
    // Reports
    REPORT_VIEW: 'report_view',
    // System
    ROLE_MANAGE: 'role_manage', SETTINGS_MANAGE: 'settings_manage'
};

const RolePermissions = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        try {
            const res = await fetchRoles();
            if (res.data.success) {
                setRoles(res.data.roles);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load roles");
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionToggle = (roleId, permission) => {
        setRoles(prevRoles => prevRoles.map(role => {
            if (role._id === roleId) {
                const currentPerms = role.permissions || [];
                let newPerms;
                if (currentPerms.includes(permission)) {
                    newPerms = currentPerms.filter(p => p !== permission);
                } else {
                    newPerms = [...currentPerms, permission];
                }
                return { ...role, permissions: newPerms, isModified: true };
            }
            return role;
        }));
    };

    const handleSave = async (role) => {
        setUpdating(role._id);
        try {
            await updateRolePermissions(role._id, role.permissions);
            toast.success(`Permissions updated for ${role.name}`);
            setRoles(prev => prev.map(r => r._id === role._id ? { ...r, isModified: false } : r));
        } catch (error) {
            console.error(error);
            toast.error("Failed to update permissions");
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    const permissionGroups = {
        'User Management': [PERMISSIONS.USER_CREATE, PERMISSIONS.USER_READ, PERMISSIONS.USER_UPDATE, PERMISSIONS.USER_DELETE],
        'Product Management': [PERMISSIONS.PRODUCT_CREATE, PERMISSIONS.PRODUCT_READ, PERMISSIONS.PRODUCT_UPDATE, PERMISSIONS.PRODUCT_DELETE],
        'Category Management': [PERMISSIONS.CATEGORY_CREATE, PERMISSIONS.CATEGORY_READ, PERMISSIONS.CATEGORY_UPDATE, PERMISSIONS.CATEGORY_DELETE],
        'Order Management': [PERMISSIONS.ORDER_READ, PERMISSIONS.ORDER_UPDATE, PERMISSIONS.ORDER_DELETE],
        'Provider Management': [PERMISSIONS.PROVIDER_CREATE, PERMISSIONS.PROVIDER_READ, PERMISSIONS.PROVIDER_UPDATE, PERMISSIONS.PROVIDER_DELETE],
        'System': [PERMISSIONS.REPORT_VIEW, PERMISSIONS.ROLE_MANAGE, PERMISSIONS.SETTINGS_MANAGE]
    };

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4">Role Permissions Management</h2>

            {roles.map(role => (
                <Card key={role._id} className="mb-4 shadow-sm">
                    <Card.Header className="d-flex justify-content-between align-items-center bg-white">
                        <h5 className="mb-0 text-capitalize">{role.name.replace('_', ' ')}</h5>
                        {role.isModified && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleSave(role)}
                                disabled={updating === role._id}
                            >
                                {updating === role._id ? <Spinner size="sm" animation="border" /> : <><FaSave /> Save Changes</>}
                            </Button>
                        )}
                    </Card.Header>
                    <Card.Body>
                        <div className="row">
                            {Object.entries(permissionGroups).map(([group, perms]) => (
                                <div key={group} className="col-md-4 mb-4">
                                    <h6 className="text-muted border-bottom pb-2 mb-3">{group}</h6>
                                    {perms.map(p => (
                                        <div key={p} className="form-check form-switch mb-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`${role._id}-${p}`}
                                                checked={role.permissions?.includes(p)}
                                                onChange={() => handlePermissionToggle(role._id, p)}
                                                disabled={role.name === 'super_admin'} // Super Admin always has full access
                                            />
                                            <label className="form-check-label small" htmlFor={`${role._id}-${p}`}>
                                                {p.split('_').join(' ').toUpperCase()}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
};

export default RolePermissions;
