import * as AirportController from '../../../controllers/airport.controller.js';
import { isAdmin } from '../../../middlewares/auth.js';

export default (router) => {
    const prefix = '/airports';

    router.get(prefix + '/', AirportController.getAirports);
    router.get(prefix + '/:id', AirportController.getAirport);
    router.post(prefix + '/', isAdmin, AirportController.storeAirport);
    router.put(prefix + '/:id', isAdmin, AirportController.updateAirport);
    router.delete(prefix + '/:id', isAdmin, AirportController.destroyAirport);
};