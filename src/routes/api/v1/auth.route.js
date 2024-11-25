import * as AuthController from '../../../controllers/auth.controller.js';

// export default (router) => {
//     router.post('/login', AuthController.login);
// }

export default (router) => {
    router.post('/auth/login', AuthController.login);
    router.post('/auth/register', AuthController.register);
    router.post('/auth/reset-password',  AuthController.resetPassword);
    router.post('/auth/send-email', AuthController.sendResetPasswordEmail); // Route untuk kirim OTP
};