const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const requirementService = require("../services/requirementService");

// Create requirement (Manager/Admin only)
exports.createRequirement = catchAsyncErrors(async (req, res, next) => {
    const requirement = await requirementService.createRequirement(req.user, req.body);
    res.status(201).json({
        success: true,
        requirement
    });
});

// Update Requirement (Admin/Manager)
exports.updateRequirement = catchAsyncErrors(async (req, res, next) => {
    const requirement = await requirementService.updateRequirement(req.params.id, req.body, req.user);
    res.status(200).json({
        success: true,
        requirement
    });
});

// Approve Requirement (Admin Only)
exports.approveRequirement = catchAsyncErrors(async (req, res, next) => {
    const requirement = await requirementService.approveRequirement(req.params.id, req.user.id, req.body);
    res.status(200).json({
        success: true,
        message: "Requirement approved successfully",
        requirement
    });
});

// Send to Provider (Manager/Admin)
exports.sendToProvider = catchAsyncErrors(async (req, res, next) => {
    const requirement = await requirementService.sendToProvider(req.params.id);
    res.status(200).json({
        success: true,
        message: "Requirement sent to provider successfully",
        requirement
    });
});

// Provider Updates List
exports.providerUpdateRequirement = catchAsyncErrors(async (req, res, next) => {
    const requirement = await requirementService.providerUpdate(req.params.id, req.user.id, req.body);
    res.status(200).json({
        success: true,
        requirement
    });
});

// Get all requirements (role-based filtering)
exports.getAllRequirements = catchAsyncErrors(async (req, res, next) => {
    const requirements = await requirementService.getAllRequirements(req.user);
    res.status(200).json({
        success: true,
        count: requirements.length,
        requirements
    });
});

// Get single requirement
exports.getRequirement = catchAsyncErrors(async (req, res, next) => {
    const requirement = await requirementService.getRequirementById(req.params.id);
    res.status(200).json({
        success: true,
        requirement
    });
});

// Provider accepts requirement
exports.acceptRequirement = catchAsyncErrors(async (req, res, next) => {
    const requirement = await requirementService.acceptRequirement(req.params.id, req.user.id);
    res.status(200).json({
        success: true,
        message: "Requirement accepted successfully",
        requirement
    });
});

// Provider marks requirement as fulfilled
exports.fulfillRequirement = catchAsyncErrors(async (req, res, next) => {
    const requirement = await requirementService.fulfillRequirement(req.params.id, req.user.id);
    res.status(200).json({
        success: true,
        message: "Requirement marked as fulfilled",
        requirement
    });
});

// Provider rejects requirement
exports.rejectRequirement = catchAsyncErrors(async (req, res, next) => {
    const requirement = await requirementService.rejectRequirement(req.params.id, req.user.id, req.body.reason);
    res.status(200).json({
        success: true,
        message: "Requirement rejected/closed",
        requirement
    });
});

// Add note to requirement
exports.addNote = catchAsyncErrors(async (req, res, next) => {
    const requirement = await requirementService.addNote(req.params.id, req.user.id, req.body.message);
    res.status(200).json({
        success: true,
        requirement
    });
});

