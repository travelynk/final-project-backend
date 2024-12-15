import * as SeatController from '../../../controllers/seat.controllers.js';

export default (router) => {
    const prefix = '/seats';

    router.get(prefix + '/:flightId', SeatController.getSeatsByFlightID);
}