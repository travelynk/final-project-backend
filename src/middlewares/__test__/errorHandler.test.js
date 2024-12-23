import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import * as ErrorHandler from '../errorHandler.js';

describe('Error Handler Middleware', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    describe('handleNotFound', () => {
        it('should return 404 with message', () => {
            ErrorHandler.handleNotFound(req, res);

            // expect(response.res404).toHaveBeenCalledWith('Resource not found!', res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: {
                    code: 404,
                    message: 'Resource not found!',
                },
                data: null,
            });
        });
    });

    describe('handleOther', () => {
        it('should return the correct JSON response for Error400', () => {
            const err = {
                statusCode: 400,
                status: false,
                message: 'Bad Request',
                data: null,
            };

            ErrorHandler.handleOther(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: false,
                message: 'Bad Request',
                data: null,
            });
        });

        it('should return the correct JSON response for other errors', () => {
            const err = {
                message: 'Internal Server Error',
                status: false,
                data: null,
            };

            ErrorHandler.handleOther(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: false,
                message: 'Internal Server Error',
                data: null,
            });
        });

        it('should return default message "Internal Server Error" if no message is provided', () => {
            const err = {
                statusCode: 500,
                status: false,
                data: null,
            };

            ErrorHandler.handleOther(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: false,
                message: 'Internal Server Error',
                data: null,
            });
        });

        it('should call next() if there is no error (null error)', () => {
            ErrorHandler.handleOther(null, req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('should log the error message if in development mode', () => {
            process.env.NODE_ENV = 'development';
            const err = new Error('Unknown error');
            console.log = jest.fn();

            ErrorHandler.handleOther(err, req, res, next);

            expect(console.log).toHaveBeenCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith(err.message);
        });

        it('should log the error message if statusCode 500', () => {
            process.env.NODE_ENV = 'production';

            const err = new Error('Unknown error');

            console.log = jest.fn();

            ErrorHandler.handleOther(err, req, res, next);

            expect(console.log).toHaveBeenCalledTimes(1);

            expect(console.log).toHaveBeenCalledWith(err.message);

        });

    });
});
