const notificationService = require('../services/notificationService');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

// Get all notifications for the logged-in user
exports.getNotifications = catchAsyncErrors(async (req, res, next) => {
    const data = await notificationService.getNotifications(req.user.id);
    res.status(200).json({ success: true, ...data });
});

// Mark a single notification as read
exports.markAsRead = catchAsyncErrors(async (req, res, next) => {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);

    if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
    }

    res.status(200).json({ success: true, notification });
});

// Mark all notifications as read
exports.markAllAsRead = catchAsyncErrors(async (req, res, next) => {
    await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({ success: true, message: "All notifications marked as read" });
});

// Internal Helper: Create Notification
exports.createNotification = async (recipientId, message, type = 'info', link = null) => {
    return await notificationService.createNotification(recipientId, message, type, link);
};

