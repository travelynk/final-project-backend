import * as AuthController from '../../../controllers/auth.controller.js';

export default (router) => {
    router.post('/login', AuthController.login);
    router.post('/register',  AuthController.register);
    router.post('/verify-otp',  AuthController.verifyOtp);
    router.post('/send-otp',  AuthController.sendOtp);
}