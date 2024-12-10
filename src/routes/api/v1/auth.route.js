import * as AuthController from '../../../controllers/auth.controller.js';

export default (router) => {
    const prefix = '/auth';
  
    router.post(prefix + '/login', AuthController.login);
    router.post(prefix + '/register',  AuthController.register);
    router.post(prefix + '/verify-otp',  AuthController.verifyOtp);
    router.post(prefix + '/send-otp',  AuthController.sendOtp);
    router.post(prefix + '/reset-password',  AuthController.resetPassword);
    router.post(prefix + '/reset-password/send-email', AuthController.sendResetPasswordEmail);
    router.get(prefix + '/google/callback', AuthController.googleOauthCallback);
    router.get(prefix + '/google', AuthController.redirectGoogleOauth);
};