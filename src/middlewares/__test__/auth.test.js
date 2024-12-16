import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import authMiddleware from '../auth.js';
import { Error401} from '../../utils/customError.js';
import jwt from 'jsonwebtoken';

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

describe('Auth Middleware', () => {
    let req, next;

    beforeEach(() => {
        req = {
            headers: {},
        };

        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should return 401 if token is missing', async () => {
        req.headers.authorization = null;
        await authMiddleware(req, next);

        const error  = new Error401('Token missing. Please log in again.');

        expect(next).toHaveBeenCalledWith(error);
    });

    it('should return 401 if token is expired', async () => {
        const error = new Error401('Token expired. Please log in again.');
        error.name = 'TokenExpiredError';
        jwt.verify.mockImplementationOnce(() => { throw error });

        req.headers.authorization = 'Bearer expired-token';
        await authMiddleware(req, next);
        expect(next).toHaveBeenCalledWith(error);
    });

    it('should return 401 if token is invalid', async () => {
        const error = new Error401('Invalid token. Please log in again.');
        error.name = 'JsonWebTokenError';
        jwt.verify.mockImplementationOnce(() => { throw error });

        req.headers.authorization = 'Bearer invalid-token';
        await authMiddleware(req, next);
        expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next if token is valid', async () => {
        const decoded = { id: '123', role: 'user' };
        jwt.verify.mockImplementationOnce(() => decoded);

        req.headers.authorization = 'Bearer valid-token';
        await authMiddleware(req, next);
        expect(req.user).toEqual({ id: '123', role: 'user' });
        expect(next).toHaveBeenCalled();
    });

    it('should return 500 if an unknown error occurs', async () => {
        const error = new Error('Unknown error');
        jwt.verify.mockImplementationOnce(() => { throw error });

        req.headers.authorization = 'Bearer valid-token';
        await authMiddleware(req, next);
        expect(next).toHaveBeenCalledWith(error);
    });
});
