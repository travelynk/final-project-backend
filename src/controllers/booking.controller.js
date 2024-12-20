import * as BookingService from '../services/booking.service.js';
import * as BookingValidation from '../validations/booking.validation.js';
import * as response from '../utils/response.js';
import { Error400 } from '../utils/customError.js';
import { decodeBookingCode } from '../utils/hashids.js';
import jwt from 'jsonwebtoken';

export const getBookings = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const bookings = await BookingService.getBookings(userId);

        response.res200('Berhasil', bookings, res);
    } catch (error) {
        next(error)
    }
};

export const getBooking = async (req, res, next) => {
    try {
        const { error, value } = BookingValidation.getBooking.validate(req.params);

        if (error) {
            throw new Error400(error.message);
        };

        const userId = req.user.id;

        const { id } = value;

        const booking = await BookingService.getBooking(userId, id);

        response.res200('Berhasil', booking, res);
    } catch (error) {
        next(error)
    }
};

export const storeBooking = async (req, res, next) => {
    try {
        const { error, value } = BookingValidation.storeBooking.validate(req.body);

        if (error) {
            throw new Error400(error.message);
        };

        const userId = req.user.id;

        const booking = await BookingService.storeBooking(userId, value);

        response.res200('Berhasil', booking, res);
    } catch (error) {
        next(error)
    }
};

export const updateStatusBooking = async (req, res, next) => {
    try {
        const validationBody = BookingValidation.updateStatusBookingBody.validate(req.body);

        const validationParams = BookingValidation.updateStatusBookingParams.validate(req.params);

        if (validationBody.error || validationParams.error) {
            const errors = [];
            if (validationParams.error) errors.push(validationParams.error.message);
            if (validationBody.error) errors.push(validationBody.error.message);
            throw new Error400(errors.join(', '));
        };

        const { id } = validationParams.value;

        const updatedBooking = await BookingService.updateStatusBooking(validationBody.value, id);

        response.res200('Berhasil', updatedBooking, res);
    } catch (error) {
        next(error)
    }
};

export const getBookingsByDate = async (req, res, next) => {
    try {
        const { error, value } = BookingValidation.getBookingsByDate.validate(req.query);

        if (error) {
            throw new Error400(error.message);
        };

        const userId = req.user.id;

        const { startDate, endDate } = value;

        const bookingsByDate = await BookingService.getBookingsByDate(userId, startDate, endDate);

        response.res200('Berhasil', bookingsByDate, res);
    } catch (error) {
        next(error)
    }
};

export const scanQrcode = async (req, res, next) => {
    try {
        const { token } = req.query;

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_FORGET);

        const { code } = decodedToken;

        const id = await decodeBookingCode(code);

        const updatedBooking = await BookingService.scanQrcode(id);

        response.res200('Berhasil', updatedBooking, res);
    } catch (error) {
        next(error)
    }
};

export const getTicket = async (req, res) => {
    try {

        const { token } = req.query;

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_FORGET);

        const { code } = decodedToken;

        const id = await decodeBookingCode(code);

        const userId = req.user.id;

        const booking = await BookingService.getTicket(userId, id)
        const domainUrl = process.env.DOMAIN_URL;

        res.render('tickets', {
            token,
            domainUrl,
            data: booking
        });
    } catch (error) {
        res.status(error.statusCode || 500).render('error', {
            error: {
                title: 'Error',
                message: error.message,
                status: error.statusCode,
            },
        });
        
    }
};

export const updateTotalBooking = async (req, res, next) => {
    try {
        const { id } = req.params;

        const updatedBooking = await BookingService.updateTotalBooking(id, req.body);

        response.res200('Berhasil', updatedBooking, res);
    } catch (error) {
        next(error)
    }
};