import * as airportController from '../../../controllers/airport.controller.js';

export default (router) => {
    const prefix = '/airports';

    router.get(prefix + '/', airportController.getAirports);
    router.get(prefix + '/:id', airportController.getAirport);
    router.post(prefix + '/', airportController.storeAirport);
    router.put(prefix + '/:id', airportController.updateAirport);
    router.delete(prefix + '/:id', airportController.destroyAirport);
};