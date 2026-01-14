const Role = require('../models/Role');
const ErrorHandler = require('../utils/errorHandler');

// Get all roles
exports.getAllRoles = async () => {
    return await Role.find();
};

// Update permissions
exports.updatePermissions = async (id, permissions) => {
    if (!permissions || !Array.isArray(permissions)) {
        throw new ErrorHandler('Permissions must be an array', 400);
    }

    const role = await Role.findById(id);
    if (!role) {
        throw new ErrorHandler('Role not found', 404);
    }

    role.permissions = permissions;
    await role.save();
    return role;
};

// Create Role
exports.createRole = async (data) => {
    const { name, description, permissions } = data;

    const role = await Role.create({
        name,
        description,
        permissions,
        type: 'admin' // defaulting to admin type for custom roles
    });
    return role;
};

// Delete Role
exports.deleteRole = async (id) => {
    const role = await Role.findById(id);
    if (!role) {
        throw new ErrorHandler("Role not found", 404);
    }

    const systemRoles = ['super_admin', 'admin', 'manager', 'provider', 'user', 'customer'];
    if (systemRoles.includes(role.name)) {
        throw new ErrorHandler("Cannot delete system roles", 400);
    }

    await role.deleteOne();
};
