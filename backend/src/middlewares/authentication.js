const catchAsyncError = require("../middlewares/catchAsyncErrors");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/User");
const Role = require("../models/Role"); // Import Role model

exports.isauthenticate = catchAsyncError(async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new ErrorHandler("Please Register or Login First", 401));
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);

    // Fetch full role object including permissions if user has a role
    // Fetch full role object including permissions if user has a role
    if (req.user && req.user.role) {
        let rolePermissions = [];
        const roleObj = await Role.findOne({ name: req.user.role });
        if (roleObj) {
            req.user.roleObj = roleObj;
            rolePermissions = roleObj.permissions || [];
        }

        // Merge User specific permissions with Role permissions
        // User permissions can add to role permissions
        const userSpecificPermissions = req.user.permissions || [];
        const combinedPermissions = [...new Set([...rolePermissions, ...userSpecificPermissions])];

        req.user.permissions = combinedPermissions;
    }

    next();

});
// check user role
exports.isAuthorizedRoles = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`This ${req.user.role} is not allow to access this resource.`, 403));
        }
        next();
    }
}

// Check for specific permission
exports.hasPermission = (requiredPermission) => {
    return (req, res, next) => {
        // Super Admin always has access
        if (req.user.role === 'super_admin') {
            return next();
        }

        const userPermissions = req.user.permissions || [];

        if (!userPermissions.includes(requiredPermission)) {
            return next(new ErrorHandler(`Permission Denied: Requires ${requiredPermission}`, 403));
        }
        next();
    }
}