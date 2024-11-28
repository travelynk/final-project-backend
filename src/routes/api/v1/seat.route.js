import * as SeatController from '../../../controllers/seat.controllers.js';

export default (router) => {
    router.get('/seats/:flightId', SeatController.getSeatsByFlightID);
}