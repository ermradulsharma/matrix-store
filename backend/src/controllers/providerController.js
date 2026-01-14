const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const providerService = require("../services/providerService");

// Create Provider (Manager/Admin only)
exports.createProvider = catchAsyncErrors(async (req, res, next) => {
    const provider = await providerService.createProvider(req.user, req.body);
    res.status(201).json({
        success: true,
        provider
    });
});

// Get all providers (filtered by manager for managers)
exports.getAllProviders = catchAsyncErrors(async (req, res, next) => {
    const providers = await providerService.getAllProviders(req.user);
    res.status(200).json({
        success: true,
        count: providers.length,
        providers
    });
});

// Get single provider
exports.getProvider = catchAsyncErrors(async (req, res, next) => {
    const provider = await providerService.getProviderById(req.params.id, req.user);
    res.status(200).json({
        success: true,
        provider
    });
});

// Update provider
exports.updateProvider = catchAsyncErrors(async (req, res, next) => {
    const provider = await providerService.updateProvider(req.params.id, req.body, req.user);
    res.status(200).json({
        success: true,
        provider
    });
});

// Toggle provider status
exports.toggleProviderStatus = catchAsyncErrors(async (req, res, next) => {
    const result = await providerService.toggleStatus(req.params.id, req.user);
    res.status(200).json({
        success: true,
        message: `Provider ${result.status === 'active' ? 'activated' : 'deactivated'} successfully`,
        status: result.status
    });
});

// Delete provider
exports.deleteProvider = catchAsyncErrors(async (req, res, next) => {
    await providerService.deleteProvider(req.params.id, req.user);
    res.status(200).json({
        success: true,
        message: "Provider and associated user account deleted successfully"
    });
});

// Get provider performance metrics
exports.getProviderPerformance = catchAsyncErrors(async (req, res, next) => {
    const performance = await providerService.getPerformance(req.params.id);
    res.status(200).json({
        success: true,
        performance
    });
});

