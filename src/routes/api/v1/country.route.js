import * as CountryController from '../../../controllers/country.controller.js';

export default (router) => {
    const prefix = '/countries';

    router.get(prefix + '/', CountryController.getCountries);
    router.get(prefix + '/:code', CountryController.getCountry);
    router.post(prefix + '/', CountryController.storeCountry);
    router.put(prefix + '/:code', CountryController.updateCountry);
    router.delete(prefix + '/:code', CountryController.destroyCountry);
}