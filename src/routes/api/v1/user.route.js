import * as UserController from '../../../controllers/user.controller.js';

export default (router) => {
    const prefix = '/users';

    router.get(prefix + '/', UserController.getUsers);
    router.get(prefix + '/:id', UserController.getUser);
    router.patch(prefix + '/:id', UserController.updateRoleUser);
}