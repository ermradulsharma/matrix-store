const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const addressService = require("../services/addressService");

// Create Address
exports.createAddress = catchAsyncErrors(async (req, res, next) => {
    const address = await addressService.createAddress(req.user.id, req.body);
    res.status(201).json({
        success: true,
        address
    });
});

// Get User Addresses
exports.myAddresses = catchAsyncErrors(async (req, res, next) => {
    const addresses = await addressService.getUserAddresses(req.user.id);
    res.status(200).json({
        success: true,
        addresses
    });
});

// Get Single Address
exports.getSingleAddress = catchAsyncErrors(async (req, res, next) => {
    const address = await addressService.getAddressById(req.params.id, req.user.id);
    res.status(200).json({
        success: true,
        address
    });
});

// Update Address
exports.updateAddress = catchAsyncErrors(async (req, res, next) => {
    const address = await addressService.updateAddress(req.params.id, req.user.id, req.body);
    res.status(200).json({
        success: true,
        address
    });
});

// Delete Address
exports.deleteAddress = catchAsyncErrors(async (req, res, next) => {
    await addressService.deleteAddress(req.params.id, req.user.id);
    res.status(200).json({
        success: true,
        message: "Address Deleted Successfully"
    });
});
