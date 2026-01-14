const Requirement = require("../models/Requirement");
const Provider = require("../models/Provider");
const ErrorHandler = require("../utils/errorHandler");

// Create Requirement
exports.createRequirement = async (user, data) => {
    const { title, description, assignedTo, items, deadline, priority } = data;

    const provider = await Provider.findById(assignedTo);
    if (!provider) {
        throw new ErrorHandler("Provider not found", 404);
    }

    if (user.role === 'manager' && provider.manager.toString() !== user.id) {
        throw new ErrorHandler("You can only assign requirements to your providers", 403);
    }

    const requirement = await Requirement.create({
        title,
        description,
        createdBy: user.id,
        assignedTo,
        items,
        deadline,
        priority: priority || 'medium',
        status: 'pending',
        approvalStatus: 'pending_approval',
        isSentToProvider: false
    });

    provider.totalOrders += 1;
    await provider.save();

    return requirement;
};

// Update Requirement
exports.updateRequirement = async (id, data, user) => {
    let requirement = await Requirement.findById(id);
    if (!requirement) {
        throw new ErrorHandler("Requirement not found", 404);
    }

    // Optional: Add logic to restrict manager from editing if approved
    // if (user.role === 'manager' && requirement.approvalStatus === 'approved') ...

    return await Requirement.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    });
};

// Approve Requirement (Admin)
exports.approveRequirement = async (id, userId, data) => {
    const requirement = await Requirement.findById(id);
    if (!requirement) {
        throw new ErrorHandler("Requirement not found", 404);
    }

    if (requirement.approvalStatus === 'approved') {
        throw new ErrorHandler("Requirement is already approved", 400);
    }

    if (data.items) requirement.items = data.items;
    if (data.adminNote) requirement.adminNote = data.adminNote;

    requirement.approvalStatus = 'approved';
    requirement.approvedBy = userId;
    requirement.approvedAt = Date.now();

    await requirement.save();
    return requirement;
};

// Send to Provider
exports.sendToProvider = async (id) => {
    const requirement = await Requirement.findById(id);
    if (!requirement) {
        throw new ErrorHandler("Requirement not found", 404);
    }

    if (requirement.approvalStatus !== 'approved') {
        throw new ErrorHandler("Requirement must be approved by Admin first", 400);
    }

    if (requirement.isSentToProvider) {
        throw new ErrorHandler("Requirement already sent to provider", 400);
    }

    requirement.isSentToProvider = true;
    requirement.status = 'pending';
    await requirement.save();
    return requirement;
};

// Provider Update
exports.providerUpdate = async (id, userId, data) => {
    const requirement = await Requirement.findById(id);
    if (!requirement) {
        throw new ErrorHandler("Requirement not found", 404);
    }

    const provider = await Provider.findOne({ user: userId });
    if (!provider || requirement.assignedTo.toString() !== provider._id.toString()) {
        throw new ErrorHandler("Access denied", 403);
    }

    if (!requirement.isSentToProvider) {
        throw new ErrorHandler("Requirement not yet received", 400);
    }

    if (data.items) requirement.items = data.items;
    await requirement.save();
    return requirement;
};

// Get All
exports.getAllRequirements = async (user) => {
    let query = {};

    if (user.role === 'provider') {
        const provider = await Provider.findOne({ user: user.id });
        if (!provider) {
            throw new ErrorHandler("Provider profile not found", 404);
        }
        query.assignedTo = provider._id;
        query.isSentToProvider = true;
    } else if (user.role === 'manager') {
        query.createdBy = user.id;
    }

    return await Requirement.find(query)
        .populate('createdBy', 'first_name last_name email')
        .populate({
            path: 'assignedTo',
            populate: {
                path: 'user',
                select: 'first_name last_name email'
            }
        })
        .populate('approvedBy', 'first_name last_name')
        .sort('-createdAt');
};

// Get Single
exports.getRequirementById = async (id) => {
    const requirement = await Requirement.findById(id)
        .populate('createdBy', 'first_name last_name email')
        .populate({
            path: 'assignedTo',
            populate: {
                path: 'user',
                select: 'first_name last_name email'
            }
        })
        .populate('approvedBy', 'first_name last_name')
        .populate('notes.author', 'first_name last_name');

    if (!requirement) {
        throw new ErrorHandler("Requirement not found", 404);
    }

    return requirement;
};

// Accept
exports.acceptRequirement = async (id, userId) => {
    const requirement = await Requirement.findById(id);
    if (!requirement) {
        throw new ErrorHandler("Requirement not found", 404);
    }

    const provider = await Provider.findOne({ user: userId });
    if (!provider || requirement.assignedTo.toString() !== provider._id.toString()) {
        throw new ErrorHandler("Access denied", 403);
    }

    if (!requirement.isSentToProvider || requirement.status !== 'pending') {
        throw new ErrorHandler("Requirement cannot be accepted in current status", 400);
    }

    requirement.status = 'in_progress';
    requirement.acceptedAt = Date.now();
    await requirement.save();
    return requirement;
};

// Fulfill
exports.fulfillRequirement = async (id, userId) => {
    const requirement = await Requirement.findById(id);
    if (!requirement) {
        throw new ErrorHandler("Requirement not found", 404);
    }

    const provider = await Provider.findOne({ user: userId });
    if (!provider || requirement.assignedTo.toString() !== provider._id.toString()) {
        throw new ErrorHandler("Access denied", 403);
    }

    if (requirement.status !== 'in_progress') {
        throw new ErrorHandler("Requirement must be in progress first", 400);
    }

    requirement.status = 'fulfilled';
    requirement.fulfilledAt = Date.now();
    await requirement.save();

    provider.completedOrders += 1;
    await provider.save();

    return requirement;
};

// Reject
exports.rejectRequirement = async (id, userId, reason) => {
    const requirement = await Requirement.findById(id);
    if (!requirement) {
        throw new ErrorHandler("Requirement not found", 404);
    }

    const provider = await Provider.findOne({ user: userId });
    if (!provider || requirement.assignedTo.toString() !== provider._id.toString()) {
        throw new ErrorHandler("Access denied", 403);
    }

    if (requirement.status !== 'pending') {
        throw new ErrorHandler("Only pending requirements can be rejected", 400);
    }

    requirement.status = 'closed';
    requirement.closedAt = Date.now();
    requirement.rejectionReason = reason;
    await requirement.save();
    return requirement;
};

// Add Note
exports.addNote = async (id, userId, message) => {
    const requirement = await Requirement.findById(id);
    if (!requirement) {
        throw new ErrorHandler("Requirement not found", 404);
    }

    requirement.notes.push({
        author: userId,
        message
    });

    await requirement.save();
    return requirement;
};
