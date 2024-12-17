import * as CountryController from '../../../controllers/country.controller.js';
import { isAdmin } from '../../../middlewares/auth.js';

export default (router) => {
    const prefix = '/countries';

    router.get(prefix + '/', CountryController.getCountries);
    router.get(prefix + '/:code', CountryController.getCountry);
    router.post(prefix + '/', isAdmin, CountryController.storeCountry);
    router.put(prefix + '/:code', isAdmin, CountryController.updateCountry);
    router.delete(prefix + '/:code', isAdmin, CountryController.destroyCountry);
}