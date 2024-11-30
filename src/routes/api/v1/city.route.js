import * as cityController from '../../../controllers/city.controller.js';

export default (router) => {
    const prefix = '/cities';

    router.get(prefix + '/', cityController.getCities);
    router.get(prefix + '/:code', cityController.getCity);
    router.post(prefix + '/', cityController.storeCity);
    router.put(prefix + '/:code', cityController.updateCity);
    router.delete(prefix + '/:code', cityController.destroyCity);
}