import * as airlineController from '../../../controllers/airline.controller.js';

export default (router) => {
    const prefix = '/airlines';

    router.get(prefix + '/', airlineController.getAirlines);
    router.get(prefix + '/:id', airlineController.getAirline);
    router.post(prefix + '/', airlineController.storeAirline);
    router.put(prefix + '/:id', airlineController.updateAirline);
    router.delete(prefix + '/:id', airlineController.destroyAirline);
};