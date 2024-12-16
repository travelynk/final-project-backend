import * as response from '../utils/response.js';
import * as NotificationService from '../services/notification.service.js';
import { notification } from '../validations/notification.validator.js';
import { Error400, Error404 } from '../utils/customError.js';

// Create a new notification
export const createNotification = async (req, res, next) => {
    try {
        const { type, title, message } = req.body;

        // Validate input using Joi
        const { error } = notification.validate({ type, title, message });
        if (error) {
            throw new Error400(`${error.details[0].message}`);
        }

        // Use `userId` if provided, otherwise default to the logged-in user's ID
        const  userId = req.user?.role === 'buyer' ? req.user?.id : null;

        // Call the service with the targetUserId (null for general notifications)
        const result = await NotificationService.createNotification(
            userId,
            type,
            title,
            message
        );

        response.res200("Notifikasi berhasil dibuat", result, res);
    } catch (error) {
        next(error);
    }
};

// Get all notifications for a user
export const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const notifications = await NotificationService.getNotificationsByUserId(userId);
        
        if (!notifications.length) {
            throw new Error404('Tidak ada notifikasi yang ditemukan untuk pengguna ini.');
        }

        response.res200('Berhasil mendapatkan notifikasi.', notifications, res);
    } catch (error) {
        next(error);
    }
};

// Update notification read status
export const updateNotificationReadStatus = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const userId = req.user.id;

        const result = await NotificationService.updateNotificationReadStatus(parseInt(id), userId);

        response.res200('Status notifikasi berhasil diperbarui.', result.notification, res);
    } catch (error) {
        next(error);
    }
};

// Update notification delete status
export const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const userId = req.user.id;

        const result = await NotificationService.deleteNotification(parseInt(id), userId);

        response.res200('Notifikasi berhasil dihapus.', result.notification, res);
    } catch (error) {
        next(error);
    }
};
