const ErrorHandler = require("../utils/errorHandler");

// Role hierarchy definition
const roleHierarchy = {
    super_admin: 5,
    admin: 4,
    manager: 3,
    provider: 2,
    customer: 1
};

// Check if user can manage another role
exports.canManageRole = (userRole, targetRole) => {
    return roleHierarchy[userRole] > roleHierarchy[targetRole];
};

// Check if user has specific permission
exports.hasPermission = (user, permission) => {
    if (user.role === 'super_admin') return true;
    return user.permissions && user.permissions.includes(permission);
};

// Middleware to check if user can manage target user
exports.canManageUser = async (req, res, next) => {
    try {
        const User = require("../models/User");
        const targetUser = await User.findById(req.params.id || req.body.userId);

        if (!targetUser) {
            return next(new ErrorHandler("Target user not found", 404));
        }

        if (!exports.canManageRole(req.user.role, targetUser.role)) {
            return next(new ErrorHandler("You don't have permission to manage this user", 403));
        }

        req.targetUser = targetUser;
        next();
    } catch (error) {
        next(error);
    }
};

// Middleware to check role hierarchy for creation
exports.canCreateRole = (allowedToCreate) => {
    return (req, res, next) => {
        const targetRole = req.body.role || 'customer';

        if (!exports.canManageRole(req.user.role, targetRole)) {
            return next(new ErrorHandler(`You cannot create users with role: ${targetRole}`, 403));
        }

        if (allowedToCreate && !allowedToCreate.includes(targetRole)) {
            return next(new ErrorHandler(`You are not allowed to create this role`, 403));
        }

        next();
    };
};

// Check if user is in management hierarchy
exports.isInHierarchy = async (managerId, subordinateId) => {
    const User = require("../models/User");
    let currentUser = await User.findById(subordinateId);

    while (currentUser && currentUser.managedBy) {
        if (currentUser.managedBy.toString() === managerId.toString()) {
            return true;
        }
        currentUser = await User.findById(currentUser.managedBy);
    }

    return false;
};

// Middleware to ensure user can only access their hierarchy
exports.ensureHierarchyAccess = async (req, res, next) => {
    try {
        const targetUserId = req.params.id || req.body.userId;

        if (req.user.role === 'super_admin') {
            return next();
        }

        const hasAccess = await exports.isInHierarchy(req.user.id, targetUserId);

        if (!hasAccess && req.user.id !== targetUserId) {
            return next(new ErrorHandler("Access denied: User not in your management hierarchy", 403));
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = exports;
