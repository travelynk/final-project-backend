import * as AirlineController from '../../../controllers/airline.controller.js';
import * as imageHandler from '../../../middlewares/multer.js';
import { isAdmin } from '../../../middlewares/auth.js';

export default (router) => {
    const prefix = '/airlines';

    router.get(prefix + '/', AirlineController.getAirlines);
    router.get(prefix + '/:id', AirlineController.getAirline);
    router.post(prefix + '/', isAdmin, imageHandler.uploadImage().single('image'), imageHandler.handleUploadError, AirlineController.storeAirline);
    router.patch(prefix + '/:id', isAdmin, AirlineController.updateAirline);
    router.patch(prefix + '/image/:id', isAdmin, imageHandler.uploadImage().single('image'), imageHandler.handleUploadError, AirlineController.updateImageAirline);
    router.delete(prefix + '/:id', isAdmin, AirlineController.destroyAirline);
};