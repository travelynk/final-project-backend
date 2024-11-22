import * as AuthController from '../../../controllers/auth.controller.js';

export default (router) => {
    router.post('/login', AuthController.login);
}