import * as FlightController from '../../../controllers/flight.controller.js';

export default (router) => {
    const prefix = '/flights';

    router.get(prefix + '/search', FlightController.getAvailableFlight);
    router.get(prefix + '/', FlightController.getFlights);
    router.get(prefix + '/:id', FlightController.getFlight);
    router.post(prefix + '/', FlightController.storeFlight);
    router.put(prefix + '/:id', FlightController.updateFlight);
    router.delete(prefix + '/:id', FlightController.destroyFlight);
};