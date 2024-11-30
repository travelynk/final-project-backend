import * as AirlineController from '../../../controllers/airline.controller.js';
import { imageHandler } from '../../../middlewares/multer.js';

export default (router) => {
    const prefix = '/airlines';

    router.get(prefix + '/', AirlineController.getAirlines);
    router.get(prefix + '/:id', AirlineController.getAirline);
    router.post(prefix + '/', imageHandler, AirlineController.storeAirline);
    router.put(prefix + '/:id', imageHandler, AirlineController.updateAirline);
    router.delete(prefix + '/:id', AirlineController.destroyAirline);
};