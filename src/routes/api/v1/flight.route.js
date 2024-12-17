import * as FlightController from '../../../controllers/flight.controller.js';
import { authMiddleware, isAdmin } from '../../../middlewares/auth.js';

export default (router) => {
    const prefix = '/flights';

    router.get(prefix + '/search', FlightController.getAvailableFlight);
    router.get(prefix + '/', authMiddleware, isAdmin, FlightController.getFlights);
    router.get(prefix + '/:id', authMiddleware, FlightController.getFlight);
    router.post(prefix + '/', authMiddleware, isAdmin, FlightController.storeFlight);
    router.put(prefix + '/:id', authMiddleware, isAdmin, FlightController.updateFlight);
    router.delete(prefix + '/:id', authMiddleware, isAdmin, FlightController.destroyFlight);
};