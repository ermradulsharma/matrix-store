const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const searchService = require("../services/searchService");
const ErrorHandler = require("../utils/errorHandler");

exports.globalSearch = catchAsyncErrors(async (req, res, next) => {
    const { q } = req.query;

    if (!q) {
        return next(new ErrorHandler("Query parameter is required", 400));
    }

    const results = await searchService.globalSearch(q);

    res.status(200).json({
        success: true,
        results
    });
});

