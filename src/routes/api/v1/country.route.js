import * as CountryController from '../../../controllers/country.controller.js';
import { authMiddleware, isAdmin } from '../../../middlewares/auth.js';

export default (router) => {
    const prefix = '/countries';

    router.get(prefix + '/', CountryController.getCountries);
    router.get(prefix + '/:code', CountryController.getCountry);
    router.post(prefix + '/', authMiddleware, isAdmin, CountryController.storeCountry);
    router.put(prefix + '/:code', authMiddleware, isAdmin, CountryController.updateCountry);
    router.delete(prefix + '/:code', authMiddleware, isAdmin, CountryController.destroyCountry);
}