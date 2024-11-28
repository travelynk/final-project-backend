import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import { login } from '../../controllers/auth.controller.js';
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
            AuthService.login.mockResolvedValue({
                token: 'mock-token',
                user: { email: 'test@example.com', role: 'buyer'},
            });

            await login(req, res);

            expect(response.res200).toHaveBeenCalledWith(
                'Login Success', 
                { token: 'mock-token', user: { email: 'test@example.com', role: 'buyer' }},
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

        it('should return 401 for invalid email or password', async () => {
            req.body = { email: 'test@example.com', password: 'wrongpassword' };

            jest.spyOn(AuthValidation.login, 'validate').mockReturnValue({ error: null, value: req.body });
            AuthService.login.mockResolvedValue(null);

            await login(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error('Invalid email or password!'));
        });

        it('should return 401 for unverified account', async () => {
            req.body = { email: 'test@example.com', password: 'password' };
            
            jest.spyOn(AuthValidation.login, 'validate').mockReturnValue({ error: null, value: req.body });
            AuthService.login.mockRejectedValue(new Error('Account has not been verified'));

            await login(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error('Account has not been verified'));
        });

        it('should return 500 for internal server error', async () => {
            jest.spyOn(AuthValidation.login, 'validate').mockImplementation(() => {
                throw new Error('Internal Error');
            });

            await login(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error('Internal Error'));
        });
    });
});