import * as NotificationController from '../../../controllers/notification.controller.js';
import authMiddleware from '../../../middlewares/auth.js';

export default (router) => {
    const prefix = '/notifications';

    router.get(prefix + '/', authMiddleware, NotificationController.getNotifications);
    router.post(prefix + '/', NotificationController.createNotification);
    router.patch(prefix + '/:id', authMiddleware, NotificationController.updateNotificationReadStatus);
    router.patch(prefix + '/:id/soft-delete', authMiddleware, NotificationController.deleteNotification);
};