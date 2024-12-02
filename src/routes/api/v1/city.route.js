import * as CityController from '../../../controllers/city.controller.js';

export default (router) => {
    const prefix = '/cities';

    router.get(prefix + '/', CityController.getCities);
    router.get(prefix + '/:code', CityController.getCity);
    router.post(prefix + '/', CityController.storeCity);
    router.put(prefix + '/:code', CityController.updateCity);
    router.delete(prefix + '/:code', CityController.destroyCity);
}