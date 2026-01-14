const Role = require('../models/Role');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Get all roles with permissions
exports.getAllRoles = catchAsyncErrors(async (req, res, next) => {
    const roles = await Role.find();

    res.status(200).json({
        success: true,
        roles
    });
});

// Update permissions for a specific role
exports.updateRolePermissions = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!permissions || !Array.isArray(permissions)) {
        return next(new ErrorHandler('Permissions must be an array', 400));
    }

    const role = await Role.findById(id);

    if (!role) {
        return next(new ErrorHandler('Role not found', 404));
    }

    // Update permissions
    role.permissions = permissions;
    await role.save();

    res.status(200).json({
        success: true,
        message: 'Role permissions updated successfully',
        role
    });
});

// Admin can create a new custom role (Optional, but good for future)
exports.createRole = catchAsyncErrors(async (req, res, next) => {
    const { name, description, permissions } = req.body;

    const role = await Role.create({
        name,
        description,
        permissions,
        type: 'admin' // defaulting to admin type for custom roles for now
    });

    res.status(201).json({
        success: true,
        role
    });
});

exports.deleteRole = catchAsyncErrors(async (req, res, next) => {
    const role = await Role.findById(req.params.id);

    if (!role) {
        return next(new ErrorHandler("Role not found", 404));
    }

    // Prevent deleting core system roles
    const systemRoles = ['super_admin', 'admin', 'manager', 'provider', 'user', 'customer'];
    if (systemRoles.includes(role.name)) {
        return next(new ErrorHandler("Cannot delete system roles", 400));
    }

    await role.deleteOne();

    res.status(200).json({
        success: true,
        message: "Role Deleted Successfully",
    });
});
