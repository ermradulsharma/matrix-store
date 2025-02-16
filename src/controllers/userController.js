const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncErrors");
const User = require("../models/User"); // It should be 'User' instead of 'user'
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// User Registration
exports.userRegistration = catchAsyncError(async (req, res, next) => {
    const { first_name, last_name, email, password, confirm_password, mobile_no, image, server_address, role } = req.body;

    if (password !== confirm_password) {
        return next(new ErrorHandler("Password and Confirm Password do not match", 400));
    }
    const name = first_name + ' ' + last_name;

    let username = first_name.toLowerCase().replace(/[^a-z0-9]/g, ''); // Basic username formatting
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
    
    const newUser = await User.create({
        server_address: server_address || "unknown",
        first_name,
        last_name,
        email,
        password,
        name,
        username,
        mobile_no,
        image,
        role: role || "user"
    });

    sendToken(newUser, 201, res);
});

// User Login
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email) {
        return next(new ErrorHandler("Please Enter Email", 401));
    }
    if (!password) {
        return next(new ErrorHandler("Please Enter Password", 401));
    }

    // Use 'User' instead of 'user' for finding the user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid credentials", 401));
    }

    const isPasswordMatched = await user.comparePassword(password); // Use 'await' here
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Password Entered", 401));
    }

    sendToken(user, 200, res); // Use 'user' here to send the token
});

// Logout User
exports.logout = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });
    res.status(200).json({
        success: true,
        message: "User Logged out Successfully"
    })
});

// Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler("User Not Found", 404));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    const message = `Your Password Reset URL is: \n\n ${resetPasswordUrl} \n\n If you have not requested this email, please ignore this.`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Reset`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

// Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    // Creating Token Hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() }, });
    if (!user) {
        return next(new ErrorHandler("Reset Password Token is invaild or has been expired", 404));
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Confirmed Password Not Matched", 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, res);
});

// change Password
exports.changePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old Password is incorrect. Please enter the correct password.", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Confirmed Password doesn't match.", 400));
    }

    if (req.body.newPassword === req.body.oldPassword) {
        return next(new ErrorHandler("Please enter a different password from the old password.", 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
});

// User Profile
exports.userProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user,
    })
});

// Update Profile Own and other user when its role is admin
exports.updateProfile = catchAsyncError(async (req, res, next) => {
    let id;

    if ('id' in req.params) {
        id = req.params.id;
    } else {
        id = req.user.id;
    }
    const { first_name, last_name, mobile } = req.body;

    const name = `${first_name} ${last_name}`; // Concatenate first_name and last_name

    const updatedFields = {
        first_name,
        last_name,
        mobile,
        name,
    };

    const user = await User.findByIdAndUpdate(id, updatedFields, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    if (!user) {
        console.log('User not found.');
        return res.status(404).json({ success: false, message: 'User not found.' });
    }
    console.log('Updated User:', user);

    res.status(200).json({
        success: true,
        user,
    });

});

// For Admin

// Update User Profile same as update profile function
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {
    console.log("use this function");

});

// get All Users List
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find({ role: 'user' });
    res.status(200).json({
        success: true,
        users,
    });
});

// Delete User Profile
exports.deleteUserProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`User Not Found With this id :- ${req.params.id}`))
    }
    await User.deleteOne({ _id: req.params.id }); // Delete the user
    res.status(200).json({
        success: true,
        message: "User Delete Successfully",
    })
});