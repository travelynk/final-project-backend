import * as CityController from '../../../controllers/city.controller.js';
import { isAdmin } from '../../../middlewares/auth.js';

export default (router) => {
    const prefix = '/cities';

    router.get(prefix + '/', CityController.getCities);
    router.get(prefix + '/:code', CityController.getCity);
    router.post(prefix + '/', isAdmin, CityController.storeCity);
    router.put(prefix + '/:code', isAdmin, CityController.updateCity);
    router.delete(prefix + '/:code', isAdmin, CityController.destroyCity);
}