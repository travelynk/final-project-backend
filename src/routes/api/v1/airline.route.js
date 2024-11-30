import * as airlineController from '../../../controllers/airline.controller.js';
import { imageHandler } from '../../../middlewares/multer.js';

export default (router) => {
    const prefix = '/airlines';

    router.get(prefix + '/', airlineController.getAirlines);
    router.get(prefix + '/:id', airlineController.getAirline);
    router.post(prefix + '/', imageHandler, airlineController.storeAirline);
    router.put(prefix + '/:id', imageHandler, airlineController.updateAirline);
    router.delete(prefix + '/:id', airlineController.destroyAirline);
};