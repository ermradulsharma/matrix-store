const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncErrors");
const User = require("../models/User");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// User Registration
exports.userRegistration = catchAsyncError(async (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    password,
    confirm_password,
    mobile_no,
    image,
    server_address,
    role,
  } = req.body;

  if (password !== confirm_password) {
    return next(
      new ErrorHandler("Password and Confirm Password do not match", 400)
    );
  }
  const name = first_name + " " + last_name;

  let username = first_name.toLowerCase().replace(/[^a-z0-9]/g, ""); // Basic username formatting
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
    role: role || "user",
  });

  sendToken(newUser, 201, res);
});

// User Login
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  console.log("Login attempt:", { email, password });

  // Checking if user has given password and email both
  if (!email || !password) {
    console.log("Missing email or password");
    return next(new ErrorHandler("Please Enter Email and Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    console.log("User not found for email:", email);
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  console.log("Password match result:", isPasswordMatched);

  if (!isPasswordMatched) {
    console.log("Password mismatch");
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});

// Logout User
exports.logout = catchAsyncError(async (req, res, next) => {
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
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User Not Found", 404));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;
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
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invaild or has been expired",
        404
      )
    );
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
    return next(
      new ErrorHandler(
        "Old Password is incorrect. Please enter the correct password.",
        400
      )
    );
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Confirmed Password doesn't match.", 400));
  }

  if (req.body.newPassword === req.body.oldPassword) {
    return next(
      new ErrorHandler(
        "Please enter a different password from the old password.",
        400
      )
    );
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

// User Profile
exports.userProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  res.status(200).json({
    success: true,
    user,
  });
});

// Update Profile Own and other user when its role is admin
exports.updateProfile = catchAsyncError(async (req, res, next) => {
  let id;

  if ("id" in req.params) {
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
    console.log("User not found.");
    return res.status(404).json({ success: false, message: "User not found." });
  }
  console.log("Updated User:", user);

  res.status(200).json({
    success: true,
    user,
  });
});

// For Admin

// Update User Profile (Admin/Super Admin) - Can update all fields including password
exports.updateUserAdmin = catchAsyncError(async (req, res, next) => {
  const { first_name, last_name, email, mobile_no, password } = req.body;

  const user = await User.findById(req.params.id).select("+password");

  if (!user) {
    return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 404));
  }

  // Update simple fields
  if (first_name) user.first_name = first_name;
  if (last_name) user.last_name = last_name;
  if (email) user.email = email;
  if (mobile_no) user.mobile_no = mobile_no;

  // Update name virtual/field if needed (though virtual usually auto-updates, but we stored it)
  user.name = `${user.first_name} ${user.last_name}`;

  // Update password if provided
  if (password && password.trim() !== "") {
    user.password = password; // Pre-save hook will hash it
  }

  await user.save();

  res.status(200).json({
    success: true,
    user,
  });
});

// Create User -- Admin/Super Admin
exports.createUser = catchAsyncError(async (req, res, next) => {
  const { first_name, last_name, email, password, role, mobile_no, managedBy } = req.body;

  // Check hierarchy permissions
  const requesterRole = req.user.role;
  const allowedRolesForAdmin = ["manager", "provider", "customer"];
  const allowedRolesForManager = ["provider", "customer"];

  if (requesterRole === "admin" && !allowedRolesForAdmin.includes(role)) {
    return next(
      new ErrorHandler(
        "Admin can only create Manager, Provider, or Customer",
        403
      )
    );
  }
  if (requesterRole === "manager" && !allowedRolesForManager.includes(role)) {
    return next(
      new ErrorHandler("Manager can only create Provider or Customer", 403)
    );
  }

  // Determine Manager
  let managerId = req.user._id;

  // If requester is Admin/SuperAdmin and managedBy is provided, use it
  if ((requesterRole === 'admin' || requesterRole === 'super_admin') && managedBy) {
    // Validate that the assigned manager exists and is actually a Manager (optional but good)
    const assignedManager = await User.findById(managedBy);
    if (!assignedManager) {
      return next(new ErrorHandler("Assigned Manager not found", 404));
    }
    // If creating a provider, the manager should essentially be a manager role
    if (role === 'provider' && assignedManager.role !== 'manager' && assignedManager.role !== 'admin' && assignedManager.role !== 'super_admin') {
      // Providing flexibility: Admin can assign provider to themselves or another admin too, but usually it's a manager.
      // adhering to strictness might be annoying, lets just check existence for now.
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

  const user = await User.create({
    first_name,
    last_name,
    name,
    username,
    email,
    password,
    role,
    mobile_no,
    managedBy: managerId, // Track who manages this user
    image: {
      public_id: "default_id",
      url: "https://example.com/default-avatar.png",
    },
  });

  res.status(201).json({
    success: true,
    user,
  });
});

// Get Single User Details -- Admin/Super Admin
exports.getSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Get All Users (with Hierarchy and Filtering)
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  let filter = {};
  const role = req.user.role;
  const queryRole = req.query.role; // Allow filtering by query param

  if (role === "super_admin") {
    // Super Admin sees everyone, or filtered list if requested
    if (queryRole) {
      filter = { role: queryRole };
    } else {
      filter = {};
    }
  } else if (role === "admin") {
    // Admin sees Users they directly manage (Managers, Providers, Customers)
    // Admin sees Users they directly manage AND users managed by their Managers
    const allowedRoles = ["manager", "provider", "customer"];

    // Find all managers directly managed by this admin
    const myManagers = await User.find({ managedBy: req.user.id, role: 'manager' });
    const managerIds = myManagers.map(m => m._id);
    // Include the admin's own ID
    managerIds.push(req.user.id);

    filter = {
      role: queryRole && allowedRoles.includes(queryRole) ? queryRole : { $in: allowedRoles },
      managedBy: { $in: managerIds }
    };
  } else if (role === "manager") {
    // Manager sees Users they directly manage (Providers, Customers)
    const allowedRoles = ["provider", "customer"];
    filter = {
      role: queryRole && allowedRoles.includes(queryRole) ? queryRole : { $in: allowedRoles },
      managedBy: req.user.id
    };
  } else {
    return next(new ErrorHandler("Not authorized to view users", 403));
  }

  const users = await User.find(filter).populate('managedBy', 'name first_name last_name email');

  res.status(200).json({
    success: true,
    users,
  });
});

// Update User Role -- Super Admin Only
exports.updateUserRole = catchAsyncError(async (req, res, next) => {
  const newRole = req.body.role;
  const userToUpdate = await User.findById(req.params.id);

  if (!userToUpdate) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 404)
    );
  }

  // Only Super Admin can promote/demote to/from Admin/Super Admin
  if (req.user.role !== "super_admin") {
    return next(
      new ErrorHandler("Only Super Admin can change user roles", 403)
    );
  }

  userToUpdate.role = newRole;
  await userToUpdate.save();

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
  });
});

// Delete User Profile
exports.deleteUserProfile = catchAsyncError(async (req, res, next) => {
  const userToDelete = await User.findById(req.params.id);
  if (!userToDelete) {
    return next(
      new ErrorHandler(`User Not Found With this id :- ${req.params.id}`, 404)
    );
  }

  // Hierarchy Check
  const requesterRole = req.user.role;

  // Prevent deleting someone with higher or equal rank (unless Super Admin)
  const roleRank = {
    super_admin: 4,
    admin: 3,
    manager: 2,
    provider: 1,
    customer: 0,
  };

  if (requesterRole !== "super_admin") {
    if (roleRank[userToDelete.role] >= roleRank[requesterRole]) {
      return next(
        new ErrorHandler(
          "You cannot delete a user with equal or higher role",
          403
        )
      );
    }
  }

  await User.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
