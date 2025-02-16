const catchAsyncError = require("../middlewares/catchAsyncErrors");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const user = require("../models/User");
exports.isauthenticate = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;
    // console.log(token);
    if (!token) {
        return next(new ErrorHandler("Please Register or Login First", 401));
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await user.findById(decodedData.id);
    next();

});
// check user role
exports.isAuthorizedRoles = (...roles) => {
    return (req, res, next) => {
        console.log(req.user.role);
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`This ${req.user.role} is not allow to access this resource.`, 403));
        }
        next();
    }
}