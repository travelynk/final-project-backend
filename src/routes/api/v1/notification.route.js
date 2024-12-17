import * as NotificationController from '../../../controllers/notification.controller.js';

export default (router) => {
    const prefix = '/notifications';

    router.post(prefix + '/', NotificationController.createNotification);
    router.get(prefix + '/', NotificationController.getNotifications);
    router.patch(prefix + '/:id', NotificationController.updateNotificationReadStatus);
    router.patch(prefix + '/:id/soft-delete', NotificationController.deleteNotification);
};
