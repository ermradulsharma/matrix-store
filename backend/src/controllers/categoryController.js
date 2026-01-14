const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const categoryService = require("../services/categoryService");

// Create Category
exports.createCategory = catchAsyncErrors(async (req, res, next) => {
    const category = await categoryService.createCategory(req.body, req.file);
    res.status(201).json({
        success: true,
        message: "Category created successfully",
        category,
    });
});

// Get All Categories
exports.getAllCategory = catchAsyncErrors(async (req, res, next) => {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({
        success: true,
        count: categories.length,
        categories,
    });
});

// Get Category Details
exports.getCategoryDetails = catchAsyncErrors(async (req, res, next) => {
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(200).json({
        success: true,
        category,
        message: "Category Details",
    });
});

// Update Category
exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
    const category = await categoryService.updateCategory(req.params.id, req.body, req.file);
    res.status(200).json({
        success: true,
        category,
        message: "Category update successfully",
    });
});

// Delete Category
exports.deleteCategory = catchAsyncErrors(async (req, res, next) => {
    await categoryService.deleteCategory(req.params.id);
    res.status(200).json({
        success: true,
        message: "Category deleted successfully",
    });
});

// Toggle Status
exports.toggleCategoryStatus = catchAsyncErrors(async (req, res, next) => {
    const category = await categoryService.toggleStatus(req.params.id);
    res.status(200).json({
        success: true,
        message: `Category ${category.status === 'active' ? 'activated' : 'deactivated'} successfully`,
        status: category.status
    });
});
