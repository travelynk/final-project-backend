import * as UserController from '../../../controllers/user.controller.js';
import { isAdmin } from '../../../middlewares/auth.js';

export default (router) => {
    const prefix = '/users';

    router.get(prefix + '/', isAdmin, UserController.getUsers);
    router.get(prefix + '/:id', isAdmin, UserController.getUser);
    router.patch(prefix + '/:id', isAdmin, UserController.updateRoleUser);
}