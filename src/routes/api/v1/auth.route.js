import * as AuthController from '../../../controllers/auth.controller.js';

export default (router) => {
    router.post('/register', AuthController.register);
    router.post('/login', AuthController.login);
};