import * as ProfileController from '../../../controllers/profile.controller.js';

export default (router) => {
    router.get('/profile', ProfileController.getProfile);
    router.patch('/profile', ProfileController.updateProfile);
}