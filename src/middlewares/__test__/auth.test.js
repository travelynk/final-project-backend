import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import authMiddleware from '../auth.js';
import { res401, res500 } from '../../utils/response.js';
import jwt from 'jsonwebtoken';

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

jest.mock('../../utils/response.js', () => ({
    res401: jest.fn(),
    res500: jest.fn(),
}));

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
        };

        // Properly mock res methods: status and json
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should return 401 if token is missing', async () => {
        req.headers.authorization = null;
        await authMiddleware(req, res, next);
        expect(res401).toHaveBeenCalledWith('Token expired. Please log in again.', res);
    });

    it('should return 401 if token is expired', async () => {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        jwt.verify.mockImplementationOnce(() => { throw error });

        req.headers.authorization = 'Bearer expired-token';
        await authMiddleware(req, res, next);
        expect(res401).toHaveBeenCalledWith('Token expired. Please log in again.', res);
    });

    it('should return 401 if token is invalid', async () => {
        const error = new Error('invalid token');
        error.name = 'JsonWebTokenError';
        jwt.verify.mockImplementationOnce(() => { throw error });

        req.headers.authorization = 'Bearer invalid-token';
        await authMiddleware(req, res, next);
        expect(res401).toHaveBeenCalledWith('Invalid token. Please log in again.', res);
    });

    it('should call next if token is valid', async () => {
        const decoded = { id: '123', role: 'user' };
        jwt.verify.mockImplementationOnce(() => decoded);

        req.headers.authorization = 'Bearer valid-token';
        await authMiddleware(req, res, next);
        expect(req.user).toEqual({ id: '123', role: 'user' });
        expect(next).toHaveBeenCalled();
    });

    it('should return 500 if an unknown error occurs', async () => {
        const error = new Error('Unknown error');
        jwt.verify.mockImplementationOnce(() => { throw error });

        req.headers.authorization = 'Bearer valid-token';
        await authMiddleware(req, res, next);
        expect(res500).toHaveBeenCalledWith('Internal Server Error', res);
    });
});
