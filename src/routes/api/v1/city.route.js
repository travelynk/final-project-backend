import * as CityController from '../../../controllers/city.controller.js';
import { authMiddleware, isAdmin } from '../../../middlewares/auth.js';

export default (router) => {
    const prefix = '/cities';

    router.get(prefix + '/', CityController.getCities);
    router.get(prefix + '/:code', CityController.getCity);
    router.post(prefix + '/', authMiddleware, isAdmin, CityController.storeCity);
    router.put(prefix + '/:code', authMiddleware, isAdmin, CityController.updateCity);
    router.delete(prefix + '/:code', authMiddleware, isAdmin, CityController.destroyCity);
}