const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncErrors");
const Category = require("../models/Category");
const { default: slugify } = require("slugify");

exports.createCategory = catchAsyncError(async (req, res, next) => {
    const { title, description, image } = req.body;
    if (!title) {
        return next(new ErrorHandler("Category title is required", 400));
    }
    const slug = slugify(title, { lower: true, strict: true });
    const category = await Category.create({ title, description, slug, image });
    res.status(201).json({
        success: true,
        message: "Category created successfully",
        category,
    });
});

exports.getAllCategory = catchAsyncError(async (req, res, next) => {
    const categories = await Category.find();
    res.status(200).json({
        success: true,
        count: categories.length,
        categories,
    });
});

exports.getCategoryDetails = catchAsyncError(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new ErrorHandler("Category Not Found", 404));
    }
    res.status(200).json({
        success: true,
        category,
        message: "Category Details",
    });
});

exports.updateCategory = catchAsyncError(async (req, res, next) => {
    let category = await Category.findById(req.params.id);
    if (!category) {
        return next(new ErrorHandler("Category Not Found", 404));
    }
    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        category,
        message: "Category update successfully",
    });
});

exports.deleteCategory = catchAsyncError(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new ErrorHandler("Category Not Found", 404));
    }
    await Category.deleteOne({ _id: req.params.id });
    res.status(200).json({
        success: true,
        message: "Category deleted successfully",
    });
});

exports.toggleCategoryStatus = catchAsyncError(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new ErrorHandler("Category Not Found", 404));
    }

    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    category.status = newStatus;
    await category.save();

    res.status(200).json({
        success: true,
        message: `Category ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
        status: newStatus
    });
});