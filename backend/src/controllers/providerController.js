const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncErrors");
const Provider = require("../models/Provider");
const User = require("../models/User");

// Create Provider (Manager/Admin only)
exports.createProvider = catchAsyncError(async (req, res, next) => {
    const { userId, companyName, businessRegistration, contactPerson, bankDetails, productCategories } = req.body;

    // Check if user exists and has provider role
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (user.role !== 'provider') {
        return next(new ErrorHandler("User must have provider role", 400));
    }

    // Check if provider already exists
    const existingProvider = await Provider.findOne({ user: userId });
    if (existingProvider) {
        return next(new ErrorHandler("Provider profile already exists for this user", 400));
    }

    const provider = await Provider.create({
        user: userId,
        companyName,
        businessRegistration,
        contactPerson,
        bankDetails,
        productCategories
    });

    // Determine the Manager for this Provider
    // Strict Hierarchy: Admin -> Manager -> Provider
    // The Provider must be managed by a User with role 'manager'.

    // We already fetched user, but let's populate managedBy to check role
    await user.populate('managedBy');

    let assignedManagerId = user.managedBy?._id;

    // If user has a manager, verify legitimate role
    if (user.managedBy) {
        if (user.managedBy.role !== 'manager') {
            // If the user is managed by an Admin, this violates strict hierarchy for Provider profiles
            // UNLESS the Admin is acting as a pseudo-manager, but User requested strictness.
            // We will check: if the logged in user is a Manager, they can claim it?
            // But usually User.managedBy is the source of truth.
        }
    } else {
        // If user has NO manager
        if (req.user.role === 'manager') {
            assignedManagerId = req.user.id;
        }
    }

    if (!assignedManagerId) {
        return next(new ErrorHandler("This user is not linked to a Manager. Please update the User account to be managed by a Manager first.", 400));
    }

    // Safety check on the ID (if we used the populated object above, we have the ID)
    // If we derived it from req.user.id, we know it exists.

    // One final check: if the assigned manager is NOT a manager role (e.g. it is Admin)
    const managerUser = await User.findById(assignedManagerId);
    if (managerUser.role !== 'manager') {
        return next(new ErrorHandler("The assigned superior must have the 'manager' role. Providers cannot be managed directly by Admins.", 403));
    }

    provider.manager = assignedManagerId;
    await provider.save();

    res.status(201).json({
        success: true,
        provider
    });
});

// Get all providers (filtered by manager for managers)
exports.getAllProviders = catchAsyncError(async (req, res, next) => {
    let query = {};

    // Managers and Admins filtering
    if (req.user.role === 'admin') {
        // Admin sees providers managed by themselves OR by their direct managers
        const myManagers = await User.find({ managedBy: req.user.id });
        const allowedManagerIds = myManagers.map(u => u._id);
        allowedManagerIds.push(req.user.id);

        query.manager = { $in: allowedManagerIds };
    } else if (req.user.role === 'manager') {
        query.manager = req.user.id;
    }

    const providers = await Provider.find(query)
        .populate('user', 'first_name last_name email mobile_no')
        .populate('manager', 'first_name last_name email');

    res.status(200).json({
        success: true,
        count: providers.length,
        providers
    });
});

// Get single provider
exports.getProvider = catchAsyncError(async (req, res, next) => {
    const provider = await Provider.findById(req.params.id)
        .populate('user', 'first_name last_name email mobile_no isActive')
        .populate('manager', 'first_name last_name email');

    if (!provider) {
        return next(new ErrorHandler("Provider not found", 404));
    }

    // Check access rights
    if (req.user.role === 'manager' && provider.manager.toString() !== req.user.id) {
        return next(new ErrorHandler("Access denied", 403));
    }

    res.status(200).json({
        success: true,
        provider
    });
});

// Update provider
exports.updateProvider = catchAsyncError(async (req, res, next) => {
    let provider = await Provider.findById(req.params.id);

    if (!provider) {
        return next(new ErrorHandler("Provider not found", 404));
    }

    // Check access rights
    if (req.user.role === 'manager' && provider.manager.toString() !== req.user.id) {
        return next(new ErrorHandler("Access denied", 403));
    }

    provider = await Provider.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        provider
    });
});

// Toggle provider status
exports.toggleProviderStatus = catchAsyncError(async (req, res, next) => {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
        return next(new ErrorHandler("Provider not found", 404));
    }

    // Check access rights
    if (req.user.role === 'manager' && provider.manager.toString() !== req.user.id) {
        return next(new ErrorHandler("Access denied", 403));
    }

    // Toggle status
    const newStatus = provider.status === 'active' ? 'inactive' : 'active';
    provider.status = newStatus;
    await provider.save();

    // Also toggle the user account status
    await User.findByIdAndUpdate(provider.user, { isActive: newStatus === 'active' });

    res.status(200).json({
        success: true,
        message: `Provider ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
        status: newStatus
    });
});

// Delete provider
exports.deleteProvider = catchAsyncError(async (req, res, next) => {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
        return next(new ErrorHandler("Provider not found", 404));
    }

    // Check access rights
    if (req.user.role === 'manager' && provider.manager.toString() !== req.user.id) {
        return next(new ErrorHandler("Access denied", 403));
    }

    // Delete the provider profile
    await provider.remove();

    // Delete the associated user account
    if (provider.user) {
        await User.findByIdAndDelete(provider.user);
    }

    res.status(200).json({
        success: true,
        message: "Provider and associated user account deleted successfully"
    });
});

// Get provider performance metrics
exports.getProviderPerformance = catchAsyncError(async (req, res, next) => {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
        return next(new ErrorHandler("Provider not found", 404));
    }

    const completionRate = provider.totalOrders > 0
        ? (provider.completedOrders / provider.totalOrders * 100).toFixed(2)
        : 0;

    res.status(200).json({
        success: true,
        performance: {
            totalOrders: provider.totalOrders,
            completedOrders: provider.completedOrders,
            completionRate: `${completionRate}%`,
            rating: provider.rating
        }
    });
});
