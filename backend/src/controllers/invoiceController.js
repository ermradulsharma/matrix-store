const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncErrors");
const Invoice = require("../models/Invoice");
const Provider = require("../models/Provider");
const Requirement = require("../models/Requirement");

// Create invoice (Provider only)
exports.createInvoice = catchAsyncError(async (req, res, next) => {
    const { requirementId, items, tax, notes, attachments } = req.body;

    // Get provider profile
    const provider = await Provider.findOne({ user: req.user.id });
    if (!provider) {
        return next(new ErrorHandler("Provider profile not found", 404));
    }

    // Verify requirement if provided
    if (requirementId) {
        const requirement = await Requirement.findById(requirementId);
        if (!requirement) {
            return next(new ErrorHandler("Requirement not found", 404));
        }
        if (requirement.assignedTo.toString() !== provider._id.toString()) {
            return next(new ErrorHandler("This requirement is not assigned to you", 403));
        }
        // Ensure requirement matches workflow
        if (requirement.status !== 'fulfilled') {
            return next(new ErrorHandler("Requirement must be marked as fulfilled before generating an invoice", 400));
        }
    }

    // Calculate totals
    let subtotal = 0;
    const processedItems = items.map(item => {
        const totalPrice = item.quantity * item.unitPrice;
        subtotal += totalPrice;
        return {
            ...item,
            totalPrice
        };
    });

    const taxAmount = tax || 0;
    const totalAmount = subtotal + taxAmount;

    const invoice = await Invoice.create({
        provider: provider._id,
        requirement: requirementId,
        items: processedItems,
        subtotal,
        tax: taxAmount,
        totalAmount,
        notes,
        attachments
    });

    res.status(201).json({
        success: true,
        invoice
    });
});

// Get all invoices (role-based filtering)
exports.getAllInvoices = catchAsyncError(async (req, res, next) => {
    let query = {};

    if (req.user.role === 'provider') {
        const provider = await Provider.findOne({ user: req.user.id });
        if (!provider) {
            return next(new ErrorHandler("Provider profile not found", 404));
        }
        query.provider = provider._id;
    } else if (req.user.role === 'manager') {
        // Managers see invoices from their providers
        const providers = await Provider.find({ manager: req.user.id });
        const providerIds = providers.map(p => p._id);
        query.provider = { $in: providerIds };
    }

    const invoices = await Invoice.find(query)
        .populate({
            path: 'provider',
            populate: {
                path: 'user',
                select: 'first_name last_name email'
            }
        })
        .populate('requirement', 'title status')
        .populate('approvedBy', 'first_name last_name')
        .populate('rejectedBy', 'first_name last_name')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: invoices.length,
        invoices
    });
});

// Get single invoice
exports.getInvoice = catchAsyncError(async (req, res, next) => {
    const invoice = await Invoice.findById(req.params.id)
        .populate({
            path: 'provider',
            populate: {
                path: 'user manager',
                select: 'first_name last_name email'
            }
        })
        .populate('requirement')
        .populate('approvedBy rejectedBy', 'first_name last_name');

    if (!invoice) {
        return next(new ErrorHandler("Invoice not found", 404));
    }

    res.status(200).json({
        success: true,
        invoice
    });
});

// Submit invoice (Provider)
exports.submitInvoice = catchAsyncError(async (req, res, next) => {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
        return next(new ErrorHandler("Invoice not found", 404));
    }

    const provider = await Provider.findOne({ user: req.user.id });
    if (!provider || invoice.provider.toString() !== provider._id.toString()) {
        return next(new ErrorHandler("Access denied", 403));
    }

    if (invoice.status !== 'draft') {
        return next(new ErrorHandler("Only draft invoices can be submitted", 400));
    }

    invoice.status = 'submitted';
    invoice.submittedAt = Date.now();
    await invoice.save();

    res.status(200).json({
        success: true,
        message: "Invoice submitted successfully",
        invoice
    });
});

// Approve invoice (Manager/Admin)
exports.approveInvoice = catchAsyncError(async (req, res, next) => {
    const invoice = await Invoice.findById(req.params.id).populate('provider');

    if (!invoice) {
        return next(new ErrorHandler("Invoice not found", 404));
    }

    // Check if manager can approve this invoice
    if (req.user.role === 'manager') {
        if (invoice.provider.manager.toString() !== req.user.id) {
            return next(new ErrorHandler("You can only approve invoices from your providers", 403));
        }
    }

    if (invoice.status !== 'submitted') {
        return next(new ErrorHandler("Only submitted invoices can be approved", 400));
    }

    invoice.status = 'approved';
    invoice.approvedBy = req.user.id;
    invoice.approvedAt = Date.now();
    await invoice.save();

    res.status(200).json({
        success: true,
        message: "Invoice approved successfully",
        invoice
    });
});

// Reject invoice (Manager/Admin)
exports.rejectInvoice = catchAsyncError(async (req, res, next) => {
    const { reason } = req.body;
    const invoice = await Invoice.findById(req.params.id).populate('provider');

    if (!invoice) {
        return next(new ErrorHandler("Invoice not found", 404));
    }

    if (req.user.role === 'manager') {
        if (invoice.provider.manager.toString() !== req.user.id) {
            return next(new ErrorHandler("You can only reject invoices from your providers", 403));
        }
    }

    if (invoice.status !== 'submitted') {
        return next(new ErrorHandler("Only submitted invoices can be rejected", 400));
    }

    invoice.status = 'rejected';
    invoice.rejectedBy = req.user.id;
    invoice.rejectedAt = Date.now();
    invoice.rejectionReason = reason;
    await invoice.save();

    res.status(200).json({
        success: true,
        message: "Invoice rejected",
        invoice
    });
});

// Mark invoice as paid (Admin only)
exports.markAsPaid = catchAsyncError(async (req, res, next) => {
    const { paymentMethod, paymentReference } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
        return next(new ErrorHandler("Invoice not found", 404));
    }

    if (invoice.status !== 'approved') {
        return next(new ErrorHandler("Only approved invoices can be marked as paid", 400));
    }

    invoice.status = 'paid';
    invoice.paidAt = Date.now();
    invoice.paymentMethod = paymentMethod;
    invoice.paymentReference = paymentReference;
    await invoice.save();

    res.status(200).json({
        success: true,
        message: "Invoice marked as paid",
        invoice
    });
});
