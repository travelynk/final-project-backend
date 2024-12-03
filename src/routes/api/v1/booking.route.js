import * as BookingController from '../../../controllers/booking.controller.js';

export default (router) => {
    const prefix = '/bookings';

    router.get(prefix + '/filter', BookingController.getBookingsByDate);
    router.get(prefix + '/', BookingController.getBookings);
    router.get(prefix + '/:id', BookingController.getBooking);
    router.post(prefix + '/', BookingController.storeBooking);
    router.patch(prefix + '/:id', BookingController.updateStatusBooking);
}