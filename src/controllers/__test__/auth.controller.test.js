// import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';
// import { login } from '../../controllers/auth.controller.js';
// import * as response from '../../utils/response.js';
// import * as AuthService from '../../services/auth.service.js';
// import * as AuthValidation from '../../validations/auth.validation.js';

// jest.mock('../../services/auth.service.js');
// jest.mock('../../utils/response.js');

// describe('Auth Controller', () => {
//     let req, res;

//     beforeEach(() => {
//         req = {
//             body: {
//                 email: 'fulan@gmail.com',
//                 password: '12345'
//             }
//         };
//         res = {
//             json: jest.fn(),
//             status: jest.fn().mockReturnThis()
//         };
//     });

//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     describe('login', () => {
//         it('should return 200 when login succeeds', async () => {
//             // Mock validation result
//             jest.spyOn(AuthValidation.login, 'validate').mockReturnValue({ error: null, value: req.body });

//             // Mock AuthService.login to return a token
//             const mockToken = 'mock-token';
//             AuthService.login.mockResolvedValue(mockToken);

//             // Call the controller
//             await login(req, res);

//             // Assertions
//             expect(AuthValidation.login.validate).toHaveBeenCalledWith(req.body);
//             expect(AuthService.login).toHaveBeenCalledWith(req.body);
//             expect(response.res200).toHaveBeenCalledWith('Login Success', mockToken, res);
//         });

//         it('should return 400 when validation fails', async () => {
//             // Mock validation result with an error
//             const mockError = { details: [{ message: 'Validation error' }] };
//             jest.spyOn(AuthValidation.login, 'validate').mockReturnValue({ error: mockError });

//             // Call the controller
//             await login(req, res);

//             // Assertions
//             expect(AuthValidation.login.validate).toHaveBeenCalledWith(req.body);
//             expect(response.res400).toHaveBeenCalledWith('Validation error', res);
//         });

//         it('should return 500 when an internal error occurs', async () => {
//             // Mock validation result
//             jest.spyOn(AuthValidation.login, 'validate').mockReturnValue({ error: null, value: req.body });

//             // Mock AuthService.login to throw an error
//             AuthService.login.mockRejectedValue(new Error('Internal Server Error'));

//             // Call the controller
//             await login(req, res);

//             // Assertions
//             expect(AuthValidation.login.validate).toHaveBeenCalledWith(req.body);
//             expect(AuthService.login).toHaveBeenCalledWith(req.body);
//             expect(response.res500).toHaveBeenCalledWith(res);
//         });
//     });
// });


import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import * as response from '../../utils/response.js';
import * as AuthValidation from '../../validations/auth.validation.js';
import * as AuthService from '../../services/auth.service.js';
import { login, register, resetPassword, sendResetPasswordEmail } from '../../controllers/auth.controller.js';

jest.mock('../../utils/response.js');
jest.mock('../../services/auth.service.js');

describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            query: {},
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
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

            await login(req, res);

            expect(response.res400).toHaveBeenCalledWith('Validation error', res);
        });

        it('should return 500 for internal server error', async () => {
            jest.spyOn(AuthValidation.login, 'validate').mockImplementation(() => {
                throw new Error('Internal Error');
            });

            await login(req, res);

            expect(response.res500).toHaveBeenCalledWith(res);
        });
    });

    describe('register', () => {
        it('should return 201 on successful registration', async () => {
            req.body = { email: 'test@example.com', password: 'password' };

            jest.spyOn(AuthValidation.register, 'validate').mockReturnValue({ error: null, value: req.body });
            AuthService.register.mockResolvedValue({ id: 1 });

            await register(req, res);

            expect(response.res201).toHaveBeenCalledWith('User registered successfully', { id: 1 }, res);
        });

        it('should return 400 for validation error', async () => {
            jest.spyOn(AuthValidation.register, 'validate').mockReturnValue({
                error: { details: [{ message: 'Validation error' }] },
            });

            await register(req, res);

            expect(response.res400).toHaveBeenCalledWith('Validation error', res);
        });

        it('should return 500 for internal server error', async () => {
            jest.spyOn(AuthValidation.register, 'validate').mockImplementation(() => {
                throw new Error('Internal Error');
            });

            await register(req, res);

            expect(response.res500).toHaveBeenCalledWith(res);
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

            await resetPassword(req, res);

            expect(response.res500).toHaveBeenCalledWith(res, 'Internal Error');
        });
    });

    describe('sendResetPasswordEmail', () => {
        it('should return 200 on successful email send', async () => {
            req.body = { email: 'test@example.com' };

            AuthService.sendResetPasswordEmail.mockResolvedValue({ success: true });

            await sendResetPasswordEmail(req, res);

            expect(response.res200).toHaveBeenCalledWith(
                'Reset password email sent successfully',
                { success: true },
                res
            );
        });

        it('should return 400 for missing email', async () => {
            await sendResetPasswordEmail(req, res);

            expect(response.res400).toHaveBeenCalledWith('Email is required', res);
        });

        it('should return 500 for internal server error', async () => {
            req.body = { email: 'test@example.com' };

            AuthService.sendResetPasswordEmail.mockRejectedValue(new Error('Internal Error'));

            await sendResetPasswordEmail(req, res);

            expect(response.res500).toHaveBeenCalledWith(res, 'Internal Error');
        });
    });
});
