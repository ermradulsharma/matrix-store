const Provider = require("../models/Provider");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");

// Create Provider
exports.createProvider = async (reqUser, data) => {
    const { userId, companyName, businessRegistration, contactPerson, bankDetails, productCategories } = data;

    // Check if user exists and has provider role
    const user = await User.findById(userId);
    if (!user) {
        throw new ErrorHandler("User not found", 404);
    }

    if (user.role !== 'provider') {
        throw new ErrorHandler("User must have provider role", 400);
    }

    // Check if provider already exists
    const existingProvider = await Provider.findOne({ user: userId });
    if (existingProvider) {
        throw new ErrorHandler("Provider profile already exists for this user", 400);
    }

    // Determine the Manager for this Provider
    await user.populate('managedBy');
    let assignedManagerId = user.managedBy?._id;

    if (!user.managedBy && reqUser.role === 'manager') {
        assignedManagerId = reqUser.id;
    }

    if (!assignedManagerId) {
        throw new ErrorHandler("This user is not linked to a Manager. Please update the User account to be managed by a Manager first.", 400);
    }

    const managerUser = await User.findById(assignedManagerId);
    if (!managerUser || managerUser.role !== 'manager') {
        throw new ErrorHandler("The assigned superior must have the 'manager' role. Providers cannot be managed directly by Admins.", 403);
    }

    const provider = await Provider.create({
        user: userId,
        companyName,
        businessRegistration,
        contactPerson,
        bankDetails,
        productCategories,
        manager: assignedManagerId
    });

    return provider;
};

// Get All Providers
exports.getAllProviders = async (reqUser) => {
    let query = {};

    if (reqUser.role === 'admin') {
        const myManagers = await User.find({ managedBy: reqUser.id });
        const allowedManagerIds = myManagers.map(u => u._id);
        allowedManagerIds.push(reqUser.id);
        query.manager = { $in: allowedManagerIds };
    } else if (reqUser.role === 'manager') {
        query.manager = reqUser.id;
    }

    return await Provider.find(query)
        .populate('user', 'first_name last_name email mobile_no')
        .populate('manager', 'first_name last_name email');
};

// Get Single Provider
exports.getProviderById = async (id, reqUser) => {
    const provider = await Provider.findById(id)
        .populate('user', 'first_name last_name email mobile_no isActive')
        .populate('manager', 'first_name last_name email');

    if (!provider) {
        throw new ErrorHandler("Provider not found", 404);
    }

    if (reqUser.role === 'manager' && provider.manager.toString() !== reqUser.id) {
        throw new ErrorHandler("Access denied", 403);
    }

    return provider;
};

// Update Provider
exports.updateProvider = async (id, data, reqUser) => {
    let provider = await Provider.findById(id);

    if (!provider) {
        throw new ErrorHandler("Provider not found", 404);
    }

    if (reqUser.role === 'manager' && provider.manager.toString() !== reqUser.id) {
        throw new ErrorHandler("Access denied", 403);
    }

    provider = await Provider.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    });

    return provider;
};

// Toggle Status
exports.toggleStatus = async (id, reqUser) => {
    const provider = await Provider.findById(id);

    if (!provider) {
        throw new ErrorHandler("Provider not found", 404);
    }

    if (reqUser.role === 'manager' && provider.manager.toString() !== reqUser.id) {
        throw new ErrorHandler("Access denied", 403);
    }

    const newStatus = provider.status === 'active' ? 'inactive' : 'active';
    provider.status = newStatus;
    await provider.save();

    await User.findByIdAndUpdate(provider.user, { isActive: newStatus === 'active' });

    return { status: newStatus };
};

// Delete Provider
exports.deleteProvider = async (id, reqUser) => {
    const provider = await Provider.findById(id);

    if (!provider) {
        throw new ErrorHandler("Provider not found", 404);
    }

    if (reqUser.role === 'manager' && provider.manager.toString() !== reqUser.id) {
        throw new ErrorHandler("Access denied", 403);
    }

    const userId = provider.user;

    // Note: Use deleteOne or findByIdAndDelete instead of remove() as it's deprecated in newer mongoose
    await Provider.deleteOne({ _id: id });

    if (userId) {
        await User.findByIdAndDelete(userId);
    }
};

// Get Performance
exports.getPerformance = async (id) => {
    const provider = await Provider.findById(id);

    if (!provider) {
        throw new ErrorHandler("Provider not found", 404);
    }

    const completionRate = provider.totalOrders > 0
        ? (provider.completedOrders / provider.totalOrders * 100).toFixed(2)
        : 0;

    return {
        totalOrders: provider.totalOrders,
        completedOrders: provider.completedOrders,
        completionRate: `${completionRate}%`,
        rating: provider.rating
    };
};
