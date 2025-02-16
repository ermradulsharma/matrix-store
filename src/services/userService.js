// services/userService.js
const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const crypto = require("crypto");

// User Registration
exports.registerUser = async (data) => {
    const { first_name, last_name, email, password, confirm_password, mobile_no, image, server_address, role } = data;

    if (password !== confirm_password) {
        throw new ErrorHandler("Password and Confirm Password do not match", 400);
    }

    const name = `${first_name} ${last_name}`;
    let username = first_name.toLowerCase().replace(/[^a-z0-9]/g, '');
    let isUnique = false;
    let counter = 0;

    while (!isUnique) {
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            isUnique = true;
        } else {
            counter++;
            username = `${first_name.toLowerCase()}${counter}`;
        }
    }

    return await User.create({
        server_address: server_address || "unknown",
        first_name,
        last_name,
        email,
        password,
        name,
        username,
        mobile_no,
        image,
        role: role || "user",
    });
};

// User Login
exports.loginUser = async (email, password) => {
    if (!email || !password) {
        throw new ErrorHandler("Email and Password are required", 401);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
        throw new ErrorHandler("Invalid credentials", 401);
    }

    return user;
};

// Forgot Password
exports.forgotPassword = async (email, req) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new ErrorHandler("User Not Found", 404);
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    return { resetPasswordUrl, user };
};

// Reset Password
exports.resetPassword = async (token, password, confirmPassword) => {
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) {
        throw new ErrorHandler("Reset Password Token is invalid or has expired", 404);
    }

    if (password !== confirmPassword) {
        throw new ErrorHandler("Password and Confirm Password do not match", 400);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return user;
};

// Change Password
exports.changePassword = async (userId, oldPassword, newPassword, confirmPassword) => {
    const user = await User.findById(userId).select("+password");
    if (!user) {
        throw new ErrorHandler("User not found", 404);
    }

    const isPasswordMatched = await user.comparePassword(oldPassword);
    if (!isPasswordMatched) {
        throw new ErrorHandler("Old Password is incorrect", 400);
    }

    if (newPassword !== confirmPassword) {
        throw new ErrorHandler("Password and Confirm Password do not match", 400);
    }

    if (newPassword === oldPassword) {
        throw new ErrorHandler("New Password must be different from the old password", 400);
    }

    user.password = newPassword;
    await user.save();

    return user;
};

// Update Profile
exports.updateProfile = async (id, updatedFields) => {
    const user = await User.findByIdAndUpdate(id, updatedFields, {
        new: true,
        runValidators: true,
    });
    if (!user) {
        throw new ErrorHandler("User not found", 404);
    }
    return user;
};

// Get All Users
exports.getAllUsers = async () => {
    return await User.find({ role: 'user' });
};

// Delete User
exports.deleteUser = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        throw new ErrorHandler(`User Not Found with this ID: ${id}`, 404);
    }
    await user.remove();
};
