import * as AirlineController from '../../../controllers/airline.controller.js';
import * as imageHandler from '../../../middlewares/multer.js';

export default (router) => {
    const prefix = '/airlines';

    router.get(prefix + '/', AirlineController.getAirlines);
    router.get(prefix + '/:id', AirlineController.getAirline);
    router.post(prefix + '/', imageHandler.uploadImage().single('image'), imageHandler.handleUploadError, AirlineController.storeAirline);
    router.patch(prefix + '/:id', AirlineController.updateAirline);
    router.patch(prefix + '/image/:id', imageHandler.uploadImage().single('image'), imageHandler.handleUploadError, AirlineController.updateImageAirline);
    router.delete(prefix + '/:id', AirlineController.destroyAirline);
};