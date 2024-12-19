import * as BookingController from '../../../controllers/booking.controller.js';
import { authMiddleware } from '../../../middlewares/auth.js';

export default (router) => {
    const prefix = '/bookings';

    router.get(prefix + '/ticket', BookingController.getTicket);
    router.post(prefix + '/scan', BookingController.scanQrcode);
    router.get(prefix + '/filter', authMiddleware, BookingController.getBookingsByDate);
    router.get(prefix + '/', authMiddleware, BookingController.getBookings);
    router.get(prefix + '/:id', authMiddleware, BookingController.getBooking);
    router.post(prefix + '/', authMiddleware, BookingController.storeBooking);
    router.patch(prefix + '/:id', authMiddleware, BookingController.updateStatusBooking);

}