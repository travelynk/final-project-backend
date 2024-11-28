import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import { login, register, sendOtp, verifyOtp, resetPassword, sendResetPasswordEmail } from '../../controllers/auth.controller.js';
import { Error400, Error404 } from '../../utils/customError.js';
import * as response from '../../utils/response.js';
import * as AuthValidation from '../../validations/auth.validation.js';
import * as AuthService from '../../services/auth.service.js';

jest.mock('../../utils/response.js');
jest.mock('../../services/auth.service.js');

describe('Auth Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            query: {},
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return 200 on successful login', async () => {
            req.body = { email: 'test@example.com', password: 'password' };

            jest.spyOn(AuthValidation.login, 'validate').mockReturnValue({ error: null, value: req.body });
            AuthService.login.mockResolvedValue('mock-token');

            await login(req, res);

            expect(response.res200).toHaveBeenCalledWith('Login Success', 'mock-token', res);
        });

        it('should return 401 for invalid credentials', async () => {
            req.body = { email: 'test@example.com', password: 'password' };

            jest.spyOn(AuthValidation.login, 'validate').mockReturnValue({ error: null, value: req.body });
            AuthService.login.mockResolvedValue(null);

            await login(req, res);

            expect(response.res401).toHaveBeenCalledWith('Invalid email or password', res);
        });

        it('should return 401 for unverified account', async () => {
            req.body = { email: 'test@example.com', password: 'password' };
            jest.spyOn(AuthValidation.login, 'validate').mockReturnValue({ error: null, value: req.body });
            AuthService.login.mockResolvedValue({ error: 'Account is not verified' });

            await login(req, res);

            expect(response.res401).toHaveBeenCalledWith(
                'Account is not verified. Please check your email for verification.',
                res
            );
        });

        it('should return 400 for validation error', async () => {
            jest.spyOn(AuthValidation.login, 'validate').mockReturnValue({
                error: { details: [{ message: 'Validation error' }] },
            });

            await login(req, res, next);

            expect(response.res400).toHaveBeenCalledWith('Validation error', res);
        });

        it('should return 500 for internal server error', async () => {
            jest.spyOn(AuthValidation.login, 'validate').mockImplementation(() => {
                throw new Error('Internal Error');
            });

            await login(req, res, next);
            expect(next).toHaveBeenCalledWith(new Error('Internal Error'));
        });
    });

    describe('register', () => {
        it('should return 200 when registration succeeds', async () => {
            jest.spyOn(AuthValidation.register, 'validate').mockReturnValue({ error: null, value: req.body });

            const mockResult = 'Registration successful';
            AuthService.register.mockResolvedValue(mockResult);

            await register(req, res, next);

            expect(AuthValidation.register.validate).toHaveBeenCalledWith(req.body);
            expect(AuthService.register).toHaveBeenCalledWith(req.body);
            expect(response.res200).toHaveBeenCalledWith(mockResult, null, res);
        });

        it('should call next with Error400 when validation fails', async () => {
            const mockError = { message: 'Validation error' };
            jest.spyOn(AuthValidation.register, 'validate').mockReturnValue({ error: mockError });

            await register(req, res, next);

            expect(AuthValidation.register.validate).toHaveBeenCalledWith(req.body);
            expect(next).toHaveBeenCalledWith(new Error400('Validation error'));
        });

        it('should call next with an error when an internal error occurs', async () => {
            jest.spyOn(AuthValidation.register, 'validate').mockReturnValue({ error: null, value: req.body });

            AuthService.register.mockRejectedValue(new Error('Internal Server Error'));

            await register(req, res, next);

            expect(AuthValidation.register.validate).toHaveBeenCalledWith(req.body);
            expect(AuthService.register).toHaveBeenCalledWith(req.body);
            expect(next).toHaveBeenCalledWith(new Error('Internal Server Error'));
        });
    });

    describe('sendOtp', () => {
        it('should return 200 when OTP is sent successfully', async () => {
            jest.spyOn(AuthValidation.sendOtp, 'validate').mockReturnValue({ error: null, value: req.body });

            const mockResult = 'OTP sent successfully';
            AuthService.sendOtp.mockResolvedValue(mockResult);

            await sendOtp(req, res, next);

            expect(AuthValidation.sendOtp.validate).toHaveBeenCalledWith(req.body);
            expect(AuthService.sendOtp).toHaveBeenCalledWith(req.body.email);
            expect(response.res200).toHaveBeenCalledWith(mockResult, null, res);
        });

        it('should call next with Error400 when validation fails', async () => {
            const mockError = { message: 'Validation error' };
            jest.spyOn(AuthValidation.sendOtp, 'validate').mockReturnValue({ error: mockError });

            await sendOtp(req, res, next);

            expect(AuthValidation.sendOtp.validate).toHaveBeenCalledWith(req.body);
            expect(next).toHaveBeenCalledWith(new Error400('Validation error'));
        });

        it('should call next with an error when an internal error occurs', async () => {
            jest.spyOn(AuthValidation.sendOtp, 'validate').mockReturnValue({ error: null, value: req.body });

            AuthService.sendOtp.mockRejectedValue(new Error('Internal Server Error'));

            await sendOtp(req, res, next);

            expect(AuthValidation.sendOtp.validate).toHaveBeenCalledWith(req.body);
            expect(AuthService.sendOtp).toHaveBeenCalledWith(req.body.email);
            expect(next).toHaveBeenCalledWith(new Error('Internal Server Error'));
        });
    });

    describe('verifyOtp', () => {
        it('should return 200 when OTP is verified successfully', async () => {
            jest.spyOn(AuthValidation.verifyOtp, 'validate').mockReturnValue({ error: null, value: req.body });

            const mockResult = 'OTP verified successfully';
            AuthService.verifyOtp.mockResolvedValue(mockResult);

            await verifyOtp(req, res, next);

            expect(AuthValidation.verifyOtp.validate).toHaveBeenCalledWith(req.body);
            expect(AuthService.verifyOtp).toHaveBeenCalledWith(req.body);
            expect(response.res200).toHaveBeenCalledWith(mockResult, null, res);
        });

        it('should call next with Error400 when validation fails', async () => {
            const mockError = { message: 'Validation error' };
            jest.spyOn(AuthValidation.verifyOtp, 'validate').mockReturnValue({ error: mockError });

            await verifyOtp(req, res, next);

            expect(AuthValidation.verifyOtp.validate).toHaveBeenCalledWith(req.body);
            expect(next).toHaveBeenCalledWith(new Error400('Validation error'));
        });

        it('should call next with an error when an internal error occurs', async () => {
            jest.spyOn(AuthValidation.verifyOtp, 'validate').mockReturnValue({ error: null, value: req.body });

            AuthService.verifyOtp.mockRejectedValue(new Error('Internal Server Error'));

            await verifyOtp(req, res, next);

            expect(AuthValidation.verifyOtp.validate).toHaveBeenCalledWith(req.body);
            expect(AuthService.verifyOtp).toHaveBeenCalledWith(req.body);
            expect(next).toHaveBeenCalledWith(new Error('Internal Server Error'));
        });
    });
  
   describe('resetPassword', () => {
        it('should return 200 on successful password reset', async () => {
            req.body = { newPassword: 'new-password' };
            req.query = { token: 'mock-token' };

            jest.spyOn(AuthValidation.resetPassword, 'validate').mockReturnValue({ error: null, value: req.body });
            AuthService.resetPassword.mockResolvedValue({ message: 'Password reset successful' });

            await resetPassword(req, res);

            expect(response.res200).toHaveBeenCalledWith('Password reset successful', null, res);
        });

        it('should return 400 for missing token', async () => {
            req.body = { newPassword: 'new-password' };

            await resetPassword(req, res);

            expect(response.res400).toHaveBeenCalledWith('Token is required', res);
        });

        it('should return 400 for validation error', async () => {
            jest.spyOn(AuthValidation.resetPassword, 'validate').mockReturnValue({
                error: { details: [{ message: 'Validation error' }] },
            });

            await resetPassword(req, res);

            expect(response.res400).toHaveBeenCalledWith('Validation error', res);
        });

        it('should return 500 for internal server error', async () => {
            jest.spyOn(AuthValidation.resetPassword, 'validate').mockImplementation(() => {
                throw new Error('Internal Error');
            });

            await resetPassword(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error('Internal Error'));
        });
    });

    describe('sendResetPasswordEmail', () => {
        it('should return 200 on successful email send', async () => {
            req.body = { email: 'test@example.com' };

            AuthService.sendResetPasswordEmail.mockResolvedValue({ success: true });

            await sendResetPasswordEmail(req, res);

            expect(response.res200).toHaveBeenCalledWith(
                'Reset password email sent successfully',
                null,
                res
            );
        });

        it('should return 400 for missing email', async () => {
            await sendResetPasswordEmail(req, res);

            expect(response.res400).toHaveBeenCalledWith('Email is required', res);
        });

        it('should return 400 for email not found', async () => {
            req.body = { email: 'test@example.com' };

            AuthService.sendResetPasswordEmail.mockRejectedValue(new Error404('User not found'));

            await sendResetPasswordEmail(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error404('User not found'));
        });

        it('should return 500 for internal server error', async () => {
            req.body = { email: 'test@example.com' };

            AuthService.sendResetPasswordEmail.mockRejectedValue(new Error('Internal Error'));

            await sendResetPasswordEmail(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error('Internal Error'));
        });
    });
  
});
