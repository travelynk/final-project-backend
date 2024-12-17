import * as BookingService from '../../services/booking.service.js';
import * as BookingValidation from '../../validations/booking.validation.js';
import * as response from '../../utils/response.js';
import * as BookingController from '../booking.controller.js';
import { Error400 } from '../../utils/customError.js';
import jwt from 'jsonwebtoken';
import { decodeBookingCode } from '../../utils/hashids.js';

jest.mock('../../services/booking.service.js');
jest.mock('../../validations/booking.validation.js');
jest.mock('../../utils/response.js');
jest.mock('../../utils/hashids.js');
jest.mock('jsonwebtoken');

describe('Booking Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: { id: 123 }, params: {}, body: {}, query: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn(), render: jest.fn() };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getBookings', () => {
        test('should return all bookings successfully', async () => {
            const mockBookings = [{ id: 1 }, { id: 2 }];
            BookingService.getBookings.mockResolvedValue(mockBookings);

            await BookingController.getBookings(req, res, next);

            expect(BookingService.getBookings).toHaveBeenCalledWith(req.user.id);
            expect(response.res200).toHaveBeenCalledWith('Berhasil', mockBookings, res);
        });

        test('should pass errors to next', async () => {
            const error = new Error('Service Error');
            BookingService.getBookings.mockRejectedValue(error);

            await BookingController.getBookings(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getBooking', () => {
        test('should return a single booking', async () => {
            const mockBooking = { id: 1 };
            BookingValidation.getBooking = { validate: jest.fn().mockReturnValue({ value: { id: 1 } }) };
            BookingService.getBooking.mockResolvedValue(mockBooking);
            req.params = { id: 1 };

            await BookingController.getBooking(req, res, next);

            expect(BookingValidation.getBooking.validate).toHaveBeenCalledWith(req.params);
            expect(BookingService.getBooking).toHaveBeenCalledWith(req.user.id, 1);
            expect(response.res200).toHaveBeenCalledWith('Berhasil', mockBooking, res);
        });

        test('should throw validation error', async () => {
            const error = new Error400('Validation Error');
            BookingValidation.getBooking = { validate: jest.fn().mockReturnValue({ error }) };

            await BookingController.getBooking(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('storeBooking', () => {
        test('should store a booking successfully', async () => {
            const mockBooking = { id: 1 };
            BookingValidation.storeBooking = { validate: jest.fn().mockReturnValue({ value: { flight: 'A123' } }) };
            BookingService.storeBooking.mockResolvedValue(mockBooking);

            await BookingController.storeBooking(req, res, next);

            expect(BookingService.storeBooking).toHaveBeenCalledWith(1, { flight: 'A123' });
            expect(response.res200).toHaveBeenCalledWith('Berhasil', mockBooking, res);
        });

        test('should handle validation error', async () => {
            const error = new Error400('Validation Error');
            BookingValidation.storeBooking = { validate: jest.fn().mockReturnValue({ error }) };

            await BookingController.storeBooking(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updateStatusBooking', () => {
        test('should update booking status', async () => {
            const updatedBooking = { id: 1, status: 'confirmed' };
            BookingValidation.updateStatusBookingBody = { validate: jest.fn().mockReturnValue({ value: { status: 'confirmed' } }) };
            BookingValidation.updateStatusBookingParams = { validate: jest.fn().mockReturnValue({ value: { id: 1 } }) };
            BookingService.updateStatusBooking.mockResolvedValue(updatedBooking);

            req.params = { id: 1 };
            req.body = { status: 'confirmed' };

            await BookingController.updateStatusBooking(req, res, next);

            expect(response.res200).toHaveBeenCalledWith('Berhasil', updatedBooking, res);
        });

        test('should handle params validation error', async () => {
            const paramsError = new Error('Params validation error');
            BookingValidation.updateStatusBookingParams.validate.mockReturnValue({ error: paramsError });
            BookingValidation.updateStatusBookingBody.validate.mockReturnValue({ value: {} }); // Body valid
    
            await BookingController.updateStatusBooking(req, res, next);
    
            expect(next).toHaveBeenCalledWith(expect.any(Error400));
            expect(next.mock.calls[0][0].message).toBe('Params validation error');
        });
    
        test('should handle body validation error', async () => {
            const bodyError = new Error('Body validation error');
            BookingValidation.updateStatusBookingParams.validate.mockReturnValue({ value: { id: 'valid-id' } }); // Params valid
            BookingValidation.updateStatusBookingBody.validate.mockReturnValue({ error: bodyError });
    
            await BookingController.updateStatusBooking(req, res, next);
    
            expect(next).toHaveBeenCalledWith(expect.any(Error400));
            expect(next.mock.calls[0][0].message).toBe('Body validation error');
        });
    
        test('should handle both params and body validation errors', async () => {
            const paramsError = new Error('Params validation error');
            const bodyError = new Error('Body validation error');
    
            BookingValidation.updateStatusBookingParams.validate.mockReturnValue({ error: paramsError });
            BookingValidation.updateStatusBookingBody.validate.mockReturnValue({ error: bodyError });
    
            await BookingController.updateStatusBooking(req, res, next);
    
            expect(next).toHaveBeenCalledWith(expect.any(Error400));
            expect(next.mock.calls[0][0].message).toBe('Params validation error, Body validation error');
        });
    });

    describe('getBookingsByDate', () => {
        test('should return bookings by date', async () => {
            const bookings = [{ id: 1 }];
            BookingValidation.getBookingsByDate = { validate: jest.fn().mockReturnValue({ value: { startDate: '2024-06-01', endDate: '2024-06-10' } }) };
            BookingService.getBookingsByDate.mockResolvedValue(bookings);

            req.query = { startDate: '2024-06-01', endDate: '2024-06-10' };

            await BookingController.getBookingsByDate(req, res, next);

            expect(response.res200).toHaveBeenCalledWith('Berhasil', bookings, res);
        });

        test('should handle validation errors', async () => {
            const error = new Error400('Validation Error');
            BookingValidation.getBookingsByDate = { validate: jest.fn().mockReturnValue({ error }) };

            await BookingController.getBookingsByDate(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('scanQrcode', () => {
        test('should scan QR code successfully', async () => {
            const updatedBooking = { id: 1 };
            jwt.verify.mockReturnValue({ code: 'hashedCode' });
            decodeBookingCode.mockResolvedValue(1);
            BookingService.scanQrcode.mockResolvedValue(updatedBooking);

            req.query = { token: 'fakeToken' };

            await BookingController.scanQrcode(req, res, next);

            expect(response.res200).toHaveBeenCalledWith('Berhasil', updatedBooking, res);
        });

        test('should handle token errors', async () => {
            jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });
            req.query = { token: 'fakeToken' };

            await BookingController.scanQrcode(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('getTicket', () => {
        test('should render ticket page', async () => {
            const mockTicket = { id: 1, flight: 'A123' };
            jwt.verify.mockReturnValue({ code: 'hashedCode' });
            decodeBookingCode.mockResolvedValue(1);
            BookingService.getTicket.mockResolvedValue(mockTicket);
            process.env.DOMAIN_URL = 'http://localhost';

            req.query = { token: 'fakeToken' };

            await BookingController.getTicket(req, res);

            expect(res.render).toHaveBeenCalledWith('tickets', {
                token: 'fakeToken',
                domainUrl: 'http://localhost',
                data: mockTicket,
            });
        });

        test('should render error page on failure', async () => {
            jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });
            req.query = { token: 'fakeToken' };

            await BookingController.getTicket(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({
                error: expect.any(Object),
            }));
        });
    });
});
