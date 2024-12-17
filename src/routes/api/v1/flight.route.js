import * as FlightController from '../../../controllers/flight.controller.js';
import { isAdmin } from '../../../middlewares/auth.js';

export default (router) => {
    const prefix = '/flights';

    router.get(prefix + '/search', FlightController.getAvailableFlight);
    router.get(prefix + '/', isAdmin, FlightController.getFlights);
    router.get(prefix + '/:id', FlightController.getFlight);
    router.post(prefix + '/', isAdmin, FlightController.storeFlight);
    router.put(prefix + '/:id', isAdmin, FlightController.updateFlight);
    router.delete(prefix + '/:id', isAdmin, FlightController.destroyFlight);
};