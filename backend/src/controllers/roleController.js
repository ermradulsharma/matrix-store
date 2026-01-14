const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const roleService = require('../services/roleService');

// Get all roles with permissions
exports.getAllRoles = catchAsyncErrors(async (req, res, next) => {
    const roles = await roleService.getAllRoles();
    res.status(200).json({
        success: true,
        roles
    });
});

// Update permissions for a specific role
exports.updateRolePermissions = catchAsyncErrors(async (req, res, next) => {
    const role = await roleService.updatePermissions(req.params.id, req.body.permissions);
    res.status(200).json({
        success: true,
        message: 'Role permissions updated successfully',
        role
    });
});

// Admin can create a new custom role
exports.createRole = catchAsyncErrors(async (req, res, next) => {
    const role = await roleService.createRole(req.body);
    res.status(201).json({
        success: true,
        role
    });
});

// Delete role
exports.deleteRole = catchAsyncErrors(async (req, res, next) => {
    await roleService.deleteRole(req.params.id);
    res.status(200).json({
        success: true,
        message: "Role Deleted Successfully",
    });
});

