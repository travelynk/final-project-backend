import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import { login, register, sendOtp, verifyOtp } from '../../controllers/auth.controller.js';
import { Error400 } from '../../utils/customError.js';
import * as response from '../../utils/response.js';
import * as AuthService from '../../services/auth.service.js';
import * as AuthValidation from '../../validations/auth.validation.js';

jest.mock('../../services/auth.service.js');
jest.mock('../../utils/response.js');

describe('Auth Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                email: 'fulan@gmail.com',
                password: '12345'
            }
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return 200 when login succeeds', async () => {
            jest.spyOn(AuthValidation.login, 'validate').mockReturnValue({ error: null, value: req.body });

            const mockToken = 'mock-token';
            AuthService.login.mockResolvedValue(mockToken);

            await login(req, res);

            expect(AuthValidation.login.validate).toHaveBeenCalledWith(req.body);
            expect(AuthService.login).toHaveBeenCalledWith(req.body);
            expect(response.res200).toHaveBeenCalledWith('Login Success', mockToken, res);
        });

        it('should return 400 when validation fails', async () => {
            const mockError = { details: [{ message: 'Validation error' }] };
            jest.spyOn(AuthValidation.login, 'validate').mockReturnValue({ error: mockError });

            await login(req, res);

            expect(AuthValidation.login.validate).toHaveBeenCalledWith(req.body);
            expect(response.res400).toHaveBeenCalledWith('Validation error', res);
        });

        it('should return 500 when an internal error occurs', async () => {
            jest.spyOn(AuthValidation.login, 'validate').mockReturnValue({ error: null, value: req.body });

            AuthService.login.mockRejectedValue(new Error('Internal Server Error'));

            await login(req, res);

            expect(AuthValidation.login.validate).toHaveBeenCalledWith(req.body);
            expect(AuthService.login).toHaveBeenCalledWith(req.body);
            expect(response.res500).toHaveBeenCalledWith(res);
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


});
