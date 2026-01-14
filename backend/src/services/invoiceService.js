const Invoice = require("../models/Invoice");
const Provider = require("../models/Provider");
const Requirement = require("../models/Requirement");
const ErrorHandler = require("../utils/errorHandler");

// Create Invoice
exports.createInvoice = async (userId, data) => {
    const { requirementId, items, tax, notes, attachments } = data;

    // Get provider profile
    const provider = await Provider.findOne({ user: userId });
    if (!provider) {
        throw new ErrorHandler("Provider profile not found", 404);
    }

    // Verify requirement if provided
    if (requirementId) {
        const requirement = await Requirement.findById(requirementId);
        if (!requirement) {
            throw new ErrorHandler("Requirement not found", 404);
        }
        if (requirement.assignedTo.toString() !== provider._id.toString()) {
            throw new ErrorHandler("This requirement is not assigned to you", 403);
        }
        if (requirement.status !== 'fulfilled') {
            throw new ErrorHandler("Requirement must be marked as fulfilled before generating an invoice", 400);
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

    return await Invoice.create({
        provider: provider._id,
        requirement: requirementId,
        items: processedItems,
        subtotal,
        tax: taxAmount,
        totalAmount,
        notes,
        attachments
    });
};

// Get All Invoices
exports.getAllInvoices = async (user) => {
    let query = {};

    if (user.role === 'provider') {
        const provider = await Provider.findOne({ user: user.id });
        if (!provider) {
            throw new ErrorHandler("Provider profile not found", 404);
        }
        query.provider = provider._id;
    } else if (user.role === 'manager') {
        const providers = await Provider.find({ manager: user.id });
        const providerIds = providers.map(p => p._id);
        query.provider = { $in: providerIds };
    }

    return await Invoice.find(query)
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
};

// Get Invoice Details
exports.getInvoiceById = async (id) => {
    const invoice = await Invoice.findById(id)
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
        throw new ErrorHandler("Invoice not found", 404);
    }

    return invoice;
};

// Submit Invoice (Provider)
exports.submitInvoice = async (id, userId) => {
    const invoice = await Invoice.findById(id);
    if (!invoice) {
        throw new ErrorHandler("Invoice not found", 404);
    }

    const provider = await Provider.findOne({ user: userId });
    if (!provider || invoice.provider.toString() !== provider._id.toString()) {
        throw new ErrorHandler("Access denied", 403);
    }

    if (invoice.status !== 'draft') {
        throw new ErrorHandler("Only draft invoices can be submitted", 400);
    }

    invoice.status = 'submitted';
    invoice.submittedAt = Date.now();
    await invoice.save();
    return invoice;
};

// Approve Invoice (Manager/Admin)
exports.approveInvoice = async (id, user) => {
    const invoice = await Invoice.findById(id).populate('provider');
    if (!invoice) {
        throw new ErrorHandler("Invoice not found", 404);
    }

    if (user.role === 'manager') {
        if (invoice.provider.manager.toString() !== user.id) {
            throw new ErrorHandler("You can only approve invoices from your providers", 403);
        }
    }

    if (invoice.status !== 'submitted') {
        throw new ErrorHandler("Only submitted invoices can be approved", 400);
    }

    invoice.status = 'approved';
    invoice.approvedBy = user.id;
    invoice.approvedAt = Date.now();
    await invoice.save();
    return invoice;
};

// Reject Invoice (Manager/Admin)
exports.rejectInvoice = async (id, user, reason) => {
    const invoice = await Invoice.findById(id).populate('provider');
    if (!invoice) {
        throw new ErrorHandler("Invoice not found", 404);
    }

    if (user.role === 'manager') {
        if (invoice.provider.manager.toString() !== user.id) {
            throw new ErrorHandler("You can only reject invoices from your providers", 403);
        }
    }

    if (invoice.status !== 'submitted') {
        throw new ErrorHandler("Only submitted invoices can be rejected", 400);
    }

    invoice.status = 'rejected';
    invoice.rejectedBy = user.id;
    invoice.rejectedAt = Date.now();
    invoice.rejectionReason = reason;
    await invoice.save();
    return invoice;
};

// Mark as Paid (Admin/Super Admin)
exports.markAsPaid = async (id, data) => {
    const { paymentMethod, paymentReference } = data;
    const invoice = await Invoice.findById(id);

    if (!invoice) {
        throw new ErrorHandler("Invoice not found", 404);
    }

    if (invoice.status !== 'approved') {
        throw new ErrorHandler("Only approved invoices can be marked as paid", 400);
    }

    invoice.status = 'paid';
    invoice.paidAt = Date.now();
    invoice.paymentMethod = paymentMethod;
    invoice.paymentReference = paymentReference;
    await invoice.save();
    return invoice;
};
