import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { updateUserPermissions } from '../../../services/api';
import { toast } from 'react-toastify';
import { FaSave, FaTimes } from 'react-icons/fa';

// Import PERMISSIONS matching backend
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

const permissionGroups = {
    'User Management': [PERMISSIONS.USER_CREATE, PERMISSIONS.USER_READ, PERMISSIONS.USER_UPDATE, PERMISSIONS.USER_DELETE],
    'Product Management': [PERMISSIONS.PRODUCT_CREATE, PERMISSIONS.PRODUCT_READ, PERMISSIONS.PRODUCT_UPDATE, PERMISSIONS.PRODUCT_DELETE],
    'Category Management': [PERMISSIONS.CATEGORY_CREATE, PERMISSIONS.CATEGORY_READ, PERMISSIONS.CATEGORY_UPDATE, PERMISSIONS.CATEGORY_DELETE],
    'Order Management': [PERMISSIONS.ORDER_READ, PERMISSIONS.ORDER_UPDATE, PERMISSIONS.ORDER_DELETE],
    'Provider Management': [PERMISSIONS.PROVIDER_CREATE, PERMISSIONS.PROVIDER_READ, PERMISSIONS.PROVIDER_UPDATE, PERMISSIONS.PROVIDER_DELETE],
    'System': [PERMISSIONS.REPORT_VIEW, PERMISSIONS.ROLE_MANAGE, PERMISSIONS.SETTINGS_MANAGE]
};

const UserPermissionsModal = ({ show, onHide, user, onUpdateSuccess }) => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setPermissions(user.permissions || []);
        }
    }, [user]);

    const handlePermissionToggle = (permission) => {
        if (permissions.includes(permission)) {
            setPermissions(permissions.filter(p => p !== permission));
        } else {
            setPermissions([...permissions, permission]);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateUserPermissions(user._id, permissions);
            toast.success("User permissions updated");
            onUpdateSuccess();
            onHide();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update user permissions");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Manage Permissions for {user?.first_name} {user?.last_name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant="info" className="mb-3">
                    <small>These permissions are in addition to the user's base Role permissions. Granting a permission here overrides any Role restrictions.</small>
                </Alert>

                {Object.entries(permissionGroups).map(([group, perms]) => (
                    <div key={group} className="mb-4">
                        <h6 className="text-muted border-bottom pb-2 mb-2">{group}</h6>
                        <div className="d-flex flex-wrap gap-3">
                            {perms.map(p => (
                                <Form.Check
                                    key={p}
                                    type="checkbox"
                                    id={`user-perm-${p}`}
                                    label={p.split('_').join(' ').toUpperCase()}
                                    checked={permissions.includes(p)}
                                    onChange={() => handlePermissionToggle(p)}
                                />
                            ))}
                        </div>
                    </div>
                ))}

            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}><FaTimes className="me-1" /> Close</Button>
                <Button variant="primary" onClick={handleSave} disabled={loading}>
                    {loading ? <Spinner size="sm" animation="border" /> : <><FaSave className="me-1" /> Save Changes</>}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserPermissionsModal;
