import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetchNotifications();
            if (res.data.success) {
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.unreadCount);
            }
        } catch (error) {
            console.error("Failed to load notifications", error);
        }
    }, [user]);

    useEffect(() => {
        loadNotifications();

        // Poll for notifications every 60 seconds
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
    }, [loadNotifications]);

    const markRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification read", error);
        }
    };

    const markAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all notifications read", error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, refreshNotifications: loadNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
