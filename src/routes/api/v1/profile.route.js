import * as ProfileController from '../../../controllers/profile.controller.js';

export default (router) => {
    const prefix = '/profiles';

    router.get(prefix + '/', ProfileController.getProfile);
    router.patch(prefix + '/', ProfileController.updateProfile);
}