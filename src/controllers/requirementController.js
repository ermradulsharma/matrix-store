const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncErrors");
const Requirement = require("../models/Requirement");
const Provider = require("../models/Provider");

// Create requirement (Manager/Admin only)
exports.createRequirement = catchAsyncError(async (req, res, next) => {
    const { title, description, assignedTo, productDetails, deadline, priority } = req.body;

    // Verify provider exists
    const provider = await Provider.findById(assignedTo);
    if (!provider) {
        return next(new ErrorHandler("Provider not found", 404));
    }

    // Check if manager can assign to this provider
    if (req.user.role === 'manager' && provider.manager.toString() !== req.user.id) {
        return next(new ErrorHandler("You can only assign requirements to your providers", 403));
    }

    const requirement = await Requirement.create({
        title,
        description,
        createdBy: req.user.id,
        assignedTo,
        productDetails,
        deadline,
        priority: priority || 'medium'
    });

    // Update provider's total orders
    provider.totalOrders += 1;
    await provider.save();

    res.status(201).json({
        success: true,
        requirement
    });
});

// Get all requirements (role-based filtering)
exports.getAllRequirements = catchAsyncError(async (req, res, next) => {
    let query = {};

    if (req.user.role === 'provider') {
        // Providers see only their assigned requirements
        const provider = await Provider.findOne({ user: req.user.id });
        if (!provider) {
            return next(new ErrorHandler("Provider profile not found", 404));
        }
        query.assignedTo = provider._id;
    } else if (req.user.role === 'manager') {
        // Managers see requirements they created
        query.createdBy = req.user.id;
    }
    // Admins and super_admins see all

    const requirements = await Requirement.find(query)
        .populate('createdBy', 'first_name last_name email')
        .populate({
            path: 'assignedTo',
            populate: {
                path: 'user',
                select: 'first_name last_name email'
            }
        })
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: requirements.length,
        requirements
    });
});

// Get single requirement
exports.getRequirement = catchAsyncError(async (req, res, next) => {
    const requirement = await Requirement.findById(req.params.id)
        .populate('createdBy', 'first_name last_name email')
        .populate({
            path: 'assignedTo',
            populate: {
                path: 'user',
                select: 'first_name last_name email'
            }
        })
        .populate('notes.author', 'first_name last_name');

    if (!requirement) {
        return next(new ErrorHandler("Requirement not found", 404));
    }

    res.status(200).json({
        success: true,
        requirement
    });
});

// Provider accepts requirement
exports.acceptRequirement = catchAsyncError(async (req, res, next) => {
    const requirement = await Requirement.findById(req.params.id);

    if (!requirement) {
        return next(new ErrorHandler("Requirement not found", 404));
    }

    // Verify provider owns this requirement
    const provider = await Provider.findOne({ user: req.user.id });
    if (!provider || requirement.assignedTo.toString() !== provider._id.toString()) {
        return next(new ErrorHandler("Access denied", 403));
    }

    if (requirement.status !== 'pending') {
        return next(new ErrorHandler("Requirement cannot be accepted in current status", 400));
    }

    requirement.status = 'accepted';
    requirement.acceptedAt = Date.now();
    await requirement.save();

    res.status(200).json({
        success: true,
        message: "Requirement accepted successfully",
        requirement
    });
});

// Provider marks requirement as fulfilled
exports.fulfillRequirement = catchAsyncError(async (req, res, next) => {
    const requirement = await Requirement.findById(req.params.id);

    if (!requirement) {
        return next(new ErrorHandler("Requirement not found", 404));
    }

    const provider = await Provider.findOne({ user: req.user.id });
    if (!provider || requirement.assignedTo.toString() !== provider._id.toString()) {
        return next(new ErrorHandler("Access denied", 403));
    }

    if (requirement.status !== 'accepted' && requirement.status !== 'in_progress') {
        return next(new ErrorHandler("Requirement must be accepted first", 400));
    }

    requirement.status = 'fulfilled';
    requirement.fulfilledAt = Date.now();
    await requirement.save();

    // Update provider's completed orders
    provider.completedOrders += 1;
    await provider.save();

    res.status(200).json({
        success: true,
        message: "Requirement marked as fulfilled",
        requirement
    });
});

// Provider rejects requirement
exports.rejectRequirement = catchAsyncError(async (req, res, next) => {
    const { reason } = req.body;
    const requirement = await Requirement.findById(req.params.id);

    if (!requirement) {
        return next(new ErrorHandler("Requirement not found", 404));
    }

    const provider = await Provider.findOne({ user: req.user.id });
    if (!provider || requirement.assignedTo.toString() !== provider._id.toString()) {
        return next(new ErrorHandler("Access denied", 403));
    }

    if (requirement.status !== 'pending') {
        return next(new ErrorHandler("Only pending requirements can be rejected", 400));
    }

    requirement.status = 'rejected';
    requirement.rejectedAt = Date.now();
    requirement.rejectionReason = reason;
    await requirement.save();

    res.status(200).json({
        success: true,
        message: "Requirement rejected",
        requirement
    });
});

// Add note to requirement
exports.addNote = catchAsyncError(async (req, res, next) => {
    const { message } = req.body;
    const requirement = await Requirement.findById(req.params.id);

    if (!requirement) {
        return next(new ErrorHandler("Requirement not found", 404));
    }

    requirement.notes.push({
        author: req.user.id,
        message
    });

    await requirement.save();

    res.status(200).json({
        success: true,
        requirement
    });
});
