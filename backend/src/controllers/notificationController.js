const Notification = require('../models/Notifications');

// Get all notifications for the logged-in user
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications

        const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });

        res.status(200).json({ success: true, notifications, unreadCount });
    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Mark a single notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.status(200).json({ success: true, notification });
    } catch (error) {
        console.error("Mark Read Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        console.error("Mark All Read Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Internal Helper: Create Notification
exports.createNotification = async (recipientId, message, type = 'info', link = null) => {
    try {
        await Notification.create({
            recipient: recipientId,
            message,
            type,
            link
        });
    } catch (error) {
        console.error("Create Notification Error:", error);
    }
};
