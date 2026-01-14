const Notification = require('../models/Notifications');

// Get all notifications for the logged-in user
exports.getNotifications = async (userId) => {
    const notifications = await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .limit(50);

    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    return { notifications, unreadCount };
};

// Mark a single notification as read
exports.markAsRead = async (id, userId) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: id, recipient: userId },
        { isRead: true },
        { new: true }
    );
    return notification;
};

// Mark all notifications as read
exports.markAllAsRead = async (userId) => {
    await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
    );
};

// Create Notification
exports.createNotification = async (recipientId, message, type = 'info', link = null) => {
    return await Notification.create({
        recipient: recipientId,
        message,
        type,
        link
    });
};
