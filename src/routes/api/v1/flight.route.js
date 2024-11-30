import * as flightController from '../../../controllers/flight.controller.js';

export default (router) => {
    const prefix = '/flights';

    router.get(prefix + '/search', flightController.getAvailableFlight);
    router.get(prefix + '/', flightController.getFlights);
    router.get(prefix + '/:id', flightController.getFlight);
    router.post(prefix + '/', flightController.storeFlight);
    router.put(prefix + '/:id', flightController.updateFlight);
    router.delete(prefix + '/:id', flightController.destroyFlight);
};