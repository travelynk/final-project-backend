import prisma from "../configs/database.js";
import { Error400, Error404 } from "../utils/customError.js";

// Create a new notification
export const createNotification = async (userId, type, title, message) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId: userId || null,  
                type,
                title,
                message,
                isRead: false,
                isDeleted: false,
                createdAt: new Date(),
            },
        });

        return notification;
    } catch (error) {
        throw new Error400('Gagal membuat notifikasi');
    }
};

// Get all notifications for a user
export const getNotificationsByUserId = async (userId) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                AND: [
                    { isDeleted: false },
                    {
                        OR: [
                            { userId }, 
                            { userId: null }     
                        ]
                    }
                ]
            },
            orderBy: { createdAt: 'desc' },
        });

        return notifications;
    } catch (error) {
        throw new Error400(`Gagal mengambil data notifikasi: ${error.message}`);
    }
};

// Update notification read status
export const updateNotificationReadStatus = async (notificationId, userId) => {
    try {
        const existingNotification = await prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!existingNotification) {
            throw new Error404('Notifikasi tidak ditemukan.');
        }
        
        const notification = await prisma.notification.update({
            where: { id: notificationId, userId },
            data: { isRead: true },
        });

        return { notification, message: 'Status notifikasi berhasil diperbarui.' };
    } catch (error) {
        if (error instanceof Error404) {
            throw error;
        } else {
            throw new Error400('Gagal memperbarui status notifikasi.');
        }
    }
};

// Soft-delete a notification (Update notification delete status) 
export const deleteNotification = async (notificationId, userId) => {
    try {
        const existingNotification = await prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!existingNotification) {
            throw new Error404('Notifikasi tidak ditemukan.');
        }
        
        const notification = await prisma.notification.update({
            where: { id: notificationId, userId },
            data: { isDeleted: true },
        });

        return { notification, message: 'Notifikasi berhasil dihapus.' };
    } catch (error) {
        if (error instanceof Error404) {
            throw error;
        } else {
            throw new Error400('Gagal menghapus notifikasi.');
        }
    }
};