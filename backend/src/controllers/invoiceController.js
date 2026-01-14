const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const invoiceService = require("../services/invoiceService");

// Create invoice (Provider only)
exports.createInvoice = catchAsyncErrors(async (req, res, next) => {
    const invoice = await invoiceService.createInvoice(req.user.id, req.body);
    res.status(201).json({
        success: true,
        invoice
    });
});

// Get all invoices (role-based filtering)
exports.getAllInvoices = catchAsyncErrors(async (req, res, next) => {
    const invoices = await invoiceService.getAllInvoices(req.user);
    res.status(200).json({
        success: true,
        count: invoices.length,
        invoices
    });
});

// Get single invoice
exports.getInvoice = catchAsyncErrors(async (req, res, next) => {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    res.status(200).json({
        success: true,
        invoice
    });
});

// Submit invoice (Provider)
exports.submitInvoice = catchAsyncErrors(async (req, res, next) => {
    const invoice = await invoiceService.submitInvoice(req.params.id, req.user.id);
    res.status(200).json({
        success: true,
        message: "Invoice submitted successfully",
        invoice
    });
});

// Approve invoice (Manager/Admin)
exports.approveInvoice = catchAsyncErrors(async (req, res, next) => {
    const invoice = await invoiceService.approveInvoice(req.params.id, req.user);
    res.status(200).json({
        success: true,
        message: "Invoice approved successfully",
        invoice
    });
});

// Reject invoice (Manager/Admin)
exports.rejectInvoice = catchAsyncErrors(async (req, res, next) => {
    const invoice = await invoiceService.rejectInvoice(req.params.id, req.user, req.body.reason);
    res.status(200).json({
        success: true,
        message: "Invoice rejected",
        invoice
    });
});

// Mark invoice as paid (Admin only)
exports.markAsPaid = catchAsyncErrors(async (req, res, next) => {
    const invoice = await invoiceService.markAsPaid(req.params.id, req.body);
    res.status(200).json({
        success: true,
        message: "Invoice marked as paid",
        invoice
    });
});

