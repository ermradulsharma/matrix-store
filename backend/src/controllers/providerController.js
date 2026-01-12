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
        productCategories,
        manager: req.user.id
    });

    res.status(201).json({
        success: true,
        provider
    });
});

// Get all providers (filtered by manager for managers)
exports.getAllProviders = catchAsyncError(async (req, res, next) => {
    let query = {};

    // Managers can only see their assigned providers
    if (req.user.role === 'manager') {
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

// Deactivate provider
exports.deactivateProvider = catchAsyncError(async (req, res, next) => {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
        return next(new ErrorHandler("Provider not found", 404));
    }

    // Check access rights
    if (req.user.role === 'manager' && provider.manager.toString() !== req.user.id) {
        return next(new ErrorHandler("Access denied", 403));
    }

    provider.status = 'inactive';
    await provider.save();

    // Also deactivate the user account
    await User.findByIdAndUpdate(provider.user, { isActive: false });

    res.status(200).json({
        success: true,
        message: "Provider deactivated successfully"
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
