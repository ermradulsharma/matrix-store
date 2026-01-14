const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// Helper for image processing
const processImage = (file) => {
    if (file) {
        return {
            public_id: file.filename,
            url: `/uploads/${file.filename}`
        };
    }
    return undefined; // Or handle default logic in service
};

// Register User
exports.registerUser = async (data, file) => {
    const {
        first_name,
        last_name,
        email,
        password,
        confirm_password,
        mobile_no,
        server_address,
        role,
    } = data;

    if (password !== confirm_password) {
        throw new ErrorHandler("Password and Confirm Password do not match", 400);
    }
    const name = first_name + " " + last_name;

    let username = first_name.toLowerCase().replace(/[^a-z0-9]/g, "");
    let isUnique = false;
    let counter = 0;

    while (!isUnique) {
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            isUnique = true;
        } else {
            counter += 1;
            username = `${first_name.toLowerCase()}${counter}`;
        }
    }

    let avatar = {
        public_id: "default_avatar",
        url: "https://example.com/default-avatar.png"
    };

    if (file) {
        avatar = processImage(file);
    }

    const newUser = await User.create({
        server_address: server_address || "unknown",
        first_name,
        last_name,
        email,
        password, // Pre-save hook hashes this
        name,
        username,
        mobile_no,
        image: avatar,
        role: role || "user",
    });

    return newUser;
};

// Login User
exports.loginUser = async (email, password) => {
    if (!email || !password) {
        throw new ErrorHandler("Please Enter Email and Password", 400);
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ErrorHandler("Invalid email or password", 401);
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        throw new ErrorHandler("Invalid email or password", 401);
    }

    return user;
};

// Forgot Password
exports.forgotPassword = async (email, protocol, host) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new ErrorHandler("User Not Found", 404);
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${protocol}://${host}/api/v1/password/reset/${resetToken}`;
    const message = `Your Password Reset URL is: \n\n ${resetPasswordUrl} \n\n If you have not requested this email, please ignore this.`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Reset`,
            message,
        });
        return user.email;
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ErrorHandler(error.message, 500);
    }
};

// Reset Password
exports.resetPassword = async (token, password, confirmPassword) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        throw new ErrorHandler("Reset Password Token is invaild or has been expired", 404);
    }

    if (password !== confirmPassword) {
        throw new ErrorHandler("Confirmed Password Not Matched", 400);
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
        throw new ErrorHandler("User not found.", 404);
    }

    const isPasswordMatched = await user.comparePassword(oldPassword);
    if (!isPasswordMatched) {
        throw new ErrorHandler("Old Password is incorrect. Please enter the correct password.", 400);
    }

    if (newPassword !== confirmPassword) {
        throw new ErrorHandler("Confirmed Password doesn't match.", 400);
    }

    if (newPassword === oldPassword) {
        throw new ErrorHandler("Please enter a different password from the old password.", 400);
    }

    user.password = newPassword;
    await user.save();

    return user;
};

// User Profile
exports.getUserProfile = async (userId) => {
    return await User.findById(userId);
};

// Update Profile
exports.updateProfile = async (userId, data, file) => {
    const newUserData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        mobile_no: data.mobile_no,
    };

    if (file) {
        newUserData.image = processImage(file);
    }

    return await User.findByIdAndUpdate(userId, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
};

// Update User (Admin)
exports.updateUserByAdmin = async (id, data, file) => {
    const { first_name, last_name, email, mobile_no, password } = data;
    const user = await User.findById(id).select("+password");

    if (!user) {
        throw new ErrorHandler(`User does not exist with Id: ${id}`, 404);
    }

    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (email) user.email = email;
    if (mobile_no) user.mobile_no = mobile_no;

    if (file) {
        user.image = processImage(file);
    }

    user.name = `${user.first_name} ${user.last_name}`;

    if (password && password.trim() !== "") {
        user.password = password;
    }

    await user.save();
    return user;
};

// Create User (Admin)
exports.createUserByAdmin = async (requester, data, file) => {
    const { first_name, last_name, email, password, role, mobile_no, managedBy } = data;

    const requesterRole = requester.role;
    const allowedRolesForAdmin = ["manager", "provider", "customer"];
    const allowedRolesForManager = ["provider", "customer"];

    if (requesterRole === "admin" && !allowedRolesForAdmin.includes(role)) {
        throw new ErrorHandler("Admin can only create Manager, Provider, or Customer", 403);
    }
    if (requesterRole === "manager" && !allowedRolesForManager.includes(role)) {
        throw new ErrorHandler("Manager can only create Provider or Customer", 403);
    }

    let managerId = requester._id;

    if ((requesterRole === 'admin' || requesterRole === 'super_admin') && managedBy) {
        const assignedManager = await User.findById(managedBy);
        if (!assignedManager) {
            throw new ErrorHandler("Assigned Manager not found", 404);
        }
        managerId = managedBy;
    }

    const name = `${first_name} ${last_name}`;
    let username = first_name.toLowerCase().replace(/[^a-z0-9]/g, "");
    let isUnique = false;
    let counter = 0;

    while (!isUnique) {
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            isUnique = true;
        } else {
            counter += 1;
            username = `${first_name.toLowerCase()}${counter}`;
        }
    }

    let image = {
        public_id: "default_id",
        url: "https://example.com/default-avatar.png",
    };
    if (file) {
        image = processImage(file);
    }

    const user = await User.create({
        first_name,
        last_name,
        name,
        email,
        password,
        username,
        role,
        mobile_no,
        managedBy: managerId,
        image
    });

    return user;
};

// Get Single User (Admin)
exports.getUserById = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        throw new ErrorHandler(`User does not exist with Id: ${id}`, 404);
    }
    return user;
};

// Get All Users (Admin)
exports.getAllUsers = async (requester, queryRole) => {
    let filter = {};
    const role = requester.role;

    if (role === "super_admin") {
        if (queryRole) {
            filter = { role: queryRole };
        }
    } else if (role === "admin") {
        const allowedRoles = ["manager", "provider", "customer"];
        const myManagers = await User.find({ managedBy: requester.id, role: 'manager' });
        const managerIds = myManagers.map(m => m._id);
        managerIds.push(requester.id);

        filter = {
            role: queryRole && allowedRoles.includes(queryRole) ? queryRole : { $in: allowedRoles },
            managedBy: { $in: managerIds }
        };
    } else if (role === "manager") {
        const allowedRoles = ["provider", "customer"];
        filter = {
            role: queryRole && allowedRoles.includes(queryRole) ? queryRole : { $in: allowedRoles },
            managedBy: requester.id
        };
    } else {
        throw new ErrorHandler("Not authorized to view users", 403);
    }

    return await User.find(filter).populate('managedBy', 'name first_name last_name email');
};

// Update User Role (Super Admin)
exports.updateUserRole = async (requester, userId, role) => {
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
        throw new ErrorHandler(`User does not exist with Id: ${userId}`, 404);
    }

    if (requester.role !== "super_admin") {
        throw new ErrorHandler("Only Super Admin can change user roles", 403);
    }

    userToUpdate.role = role;
    await userToUpdate.save();
};

// Delete User (Admin)
exports.deleteUser = async (requester, userId) => {
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
        throw new ErrorHandler(`User Not Found With this id :- ${userId}`, 404);
    }

    const requesterRole = requester.role;
    const roleRank = {
        super_admin: 4,
        admin: 3,
        manager: 2,
        provider: 1,
        customer: 0,
    };

    if (requesterRole !== "super_admin") {
        if (roleRank[userToDelete.role] >= roleRank[requesterRole]) {
            throw new ErrorHandler("You cannot delete a user with equal or higher role", 403);
        }
    }

    await User.deleteOne({ _id: userId });
};

// Update Permissions
exports.updatePermissions = async (id, permissions) => {
    if (!permissions || !Array.isArray(permissions)) {
        throw new ErrorHandler("Permissions must be an array", 400);
    }

    const user = await User.findById(id);
    if (!user) {
        throw new ErrorHandler("User not found", 404);
    }

    user.permissions = permissions;
    await user.save();
    return user;
};
