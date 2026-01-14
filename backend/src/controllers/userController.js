const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const userService = require("../services/userService");
const sendToken = require("../utils/jwtToken");

// User Registration
exports.userRegistration = catchAsyncErrors(async (req, res, next) => {
  const newUser = await userService.registerUser(req.body, req.file);
  sendToken(newUser, 201, res);
});

// User Login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const user = await userService.loginUser(req.body.email, req.body.password);
  sendToken(user, 200, res);
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "User Logged out Successfully",
  });
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const emailSentTo = await userService.forgotPassword(req.body.email, req.protocol, req.get("host"));
  res.status(200).json({
    success: true,
    message: `Email sent to ${emailSentTo} successfully`,
  });
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await userService.resetPassword(req.params.token, req.body.password, req.body.confirmPassword);
  sendToken(user, 200, res);
});

// Change Password
exports.changePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await userService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword, req.body.confirmPassword);
  sendToken(user, 200, res);
});

// User Profile
exports.userProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await userService.getUserProfile(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

// Update Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await userService.updateProfile(req.user.id, req.body, req.file);
  res.status(200).json({
    success: true,
    user,
  });
});

// Update User Profile (Admin/Super Admin)
exports.updateUserAdmin = catchAsyncErrors(async (req, res, next) => {
  const user = await userService.updateUserByAdmin(req.params.id, req.body, req.file);
  res.status(200).json({
    success: true,
    user,
  });
});

// Create User -- Admin/Super Admin
exports.createUser = catchAsyncErrors(async (req, res, next) => {
  const user = await userService.createUserByAdmin(req.user, req.body, req.file);
  res.status(201).json({
    success: true,
    user,
  });
});

// Get Single User Details -- Admin/Super Admin
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({
    success: true,
    user,
  });
});

// Get All Users (with Hierarchy and Filtering)
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await userService.getAllUsers(req.user, req.query.role);
  res.status(200).json({
    success: true,
    users,
  });
});

// Update User Role -- Super Admin Only
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  await userService.updateUserRole(req.user, req.params.id, req.body.role);
  res.status(200).json({
    success: true,
    message: "User role updated successfully",
  });
});

// Delete User Profile
exports.deleteUserProfile = catchAsyncErrors(async (req, res, next) => {
  await userService.deleteUser(req.user, req.params.id);
  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});

// Update User Permissions (Super Admin Only)
exports.updateUserPermissions = catchAsyncErrors(async (req, res, next) => {
  const user = await userService.updatePermissions(req.params.id, req.body.permissions);
  res.status(200).json({
    success: true,
    message: "User permissions updated successfully",
    user
  });
});

