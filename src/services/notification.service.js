import prisma from "../configs/database.js";
import { Error404 } from "../utils/customError.js";

// Create a new notification
export const createNotification = async (userId, type, title, message) => {
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
};

// Get all notifications for a user
export const getNotificationsByUserId = async (userId) => {
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
};

// Update notification read status
export const updateNotificationReadStatus = async (notificationId) => {
    const existingNotification = await prisma.notification.findUnique({
        where: { id: notificationId },
    });

    if (!existingNotification) {
        throw new Error404('Notifikasi tidak ditemukan.');
    }
    
    const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
    });

    return { notification, message: 'Status notifikasi berhasil diperbarui.' };
};

// Soft-delete a notification (Update notification delete status) 
export const deleteNotification = async (notificationId) => {
    const existingNotification = await prisma.notification.findUnique({
        where: { id: notificationId },
    });
    
    if (!existingNotification) {
        throw new Error404('Notifikasi tidak ditemukan.');
    }
    
    let notification;

    notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { isDeleted: true },
    });

    
    return { notification, message: 'Notifikasi berhasil dihapus.' };
};