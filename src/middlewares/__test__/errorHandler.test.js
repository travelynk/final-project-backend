import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import * as ErrorHandler from '../errorHandler.js';
import { Error400 } from '../../utils/customError.js';
import * as response from '../../utils/response.js';

jest.mock('../../utils/response.js');

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
            expect(response.res404).toHaveBeenCalledWith('Resource not found!', res);
        });
    });

    describe('handleOther', () => {
        it('should return 400 with message for Error400', () => {
            const err = new Error400('error');
            ErrorHandler.handleOther(err, req, res, next);
            expect(response.res400).toHaveBeenCalledWith('error', res);
        });

        it('should return 500 with message for other errors', () => {
            const err = { message: 'error' };
            ErrorHandler.handleOther(err, req, res, next);
            expect(response.res500).toHaveBeenCalledWith(res);
        });

        it('should call next if no error', () => {
            ErrorHandler.handleOther(null, req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
});