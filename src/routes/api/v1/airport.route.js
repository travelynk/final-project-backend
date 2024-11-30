import * as AirportController from '../../../controllers/airport.controller.js';

export default (router) => {
    const prefix = '/airports';

    router.get(prefix + '/', AirportController.getAirports);
    router.get(prefix + '/:id', AirportController.getAirport);
    router.post(prefix + '/', AirportController.storeAirport);
    router.put(prefix + '/:id', AirportController.updateAirport);
    router.delete(prefix + '/:id', AirportController.destroyAirport);
};