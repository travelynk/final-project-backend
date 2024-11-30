import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import { getSeatsByFlightID } from '../seat.controllers.js';
import { Error400 } from '../../utils/customError.js';
import * as response from '../../utils/response.js';
import * as SeatService from '../../services/seat.service.js';
import * as SeatValidation from '../../validations/seat.validation.js';

jest.mock('../../services/seat.service.js');
jest.mock('../../utils/response.js');
jest.mock('../../validations/seat.validation.js');

describe('Seat Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: {
                flightId: '123',
            },
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

    describe('getSeatsByFlightID', () => {
        it('should return 200 when seats are fetched successfully', async () => {
            jest.spyOn(SeatValidation.getSeatsByFlightID, 'validate').mockReturnValue({
                error: null,
                value: { flightId: '123' },
            });

            const mockSeats = [
                { id: 1, position: 'A1', isAvailable: true },
                { id: 2, position: 'A2', isAvailable: false },
            ];
            SeatService.getSeatsByFlightID.mockResolvedValue(mockSeats);

            await getSeatsByFlightID(req, res, next);

            expect(SeatValidation.getSeatsByFlightID.validate).toHaveBeenCalledWith(req.params);
            expect(SeatService.getSeatsByFlightID).toHaveBeenCalledWith('123');
            expect(response.res200).toHaveBeenCalledWith('Berhasil', mockSeats, res);
        });

        it('should call next with Error400 when validation fails', async () => {
            const mockError = { message: 'Invalid flightId' };
            jest.spyOn(SeatValidation.getSeatsByFlightID, 'validate').mockReturnValue({
                error: mockError,
            });

            await getSeatsByFlightID(req, res, next);

            expect(SeatValidation.getSeatsByFlightID.validate).toHaveBeenCalledWith(req.params);
            expect(next).toHaveBeenCalledWith(new Error400('Invalid flightId'));
        });

        it('should call next with an error when an error occurs in the service', async () => {
            jest.spyOn(SeatValidation.getSeatsByFlightID, 'validate').mockReturnValue({
                error: null,
                value: { flightId: '123' },
            });

            SeatService.getSeatsByFlightID.mockRejectedValue(new Error('Service Error'));

            await getSeatsByFlightID(req, res, next);

            expect(SeatValidation.getSeatsByFlightID.validate).toHaveBeenCalledWith(req.params);
            expect(SeatService.getSeatsByFlightID).toHaveBeenCalledWith('123');
            expect(next).toHaveBeenCalledWith(new Error('Service Error'));
        });
    });
});
