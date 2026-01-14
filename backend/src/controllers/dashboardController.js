const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const dashboardService = require("../services/dashboardService");

// Get SuperAdmin / Hierarchical Stats
exports.getSuperAdminStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await dashboardService.getSuperAdminStats(req.user, req.query);
  res.status(200).json({
    success: true,
    stats,
  });
});

// Get Advanced Trends and Rankings
exports.getAdvancedStats = catchAsyncErrors(async (req, res, next) => {
  const data = await dashboardService.getAdvancedStats(req.query);
  res.status(200).json({
    success: true,
    ...data
  });
});

