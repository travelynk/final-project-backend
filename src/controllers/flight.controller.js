import * as FlightService from '../services/flight.service.js';
import * as FlightValidation from '../validations/flight.validation.js';
import { res200, res201 } from '../utils/response.js';
import { Error404, Error400 } from '../utils/customError.js';

export const getFlights = async (req, res, next) => {
    try {
        const flights = await FlightService.getAll();
        res200('Berhasil mengambil semua data penerbangan', flights, res);
    } catch (error) {
        next(error);
    }
};

export const getFlight = async (req, res, next) => {
    try {
        const flight = await FlightService.getOne(req.params.id);
        if (!flight) {
            throw new Error404('Data penerbangan tidak ditemukan');
        }
        res200('Berhasil mengambil data penerbangan', flight, res);
    } catch (error) {
        next(error);
    }
};

export const storeFlight = async (req, res, next) => {
    try {
        const { error, value } = FlightValidation.flightSchema.validate(req.body);
        if (error) {
            throw new Error400(`${error.details[0].message}`);
        }
        const flight = await FlightService.store(value);
        res201('Berhasil menambahkan data penerbangan', flight, res);
    } catch (error) {
        next(error);
    }
};

export const updateFlight = async (req, res, next) => {
    try {
        const { error, value } = FlightValidation.flightSchema.validate(req.body);
        if (error) {
            throw new Error400(`${error.details[0].message}`);
        }
        const flight = await FlightService.update(req.params.id, value);
        res200('Berhasil mengubah data penerbangan', flight, res);
    } catch (error) {
        next(error);
    }
};

export const destroyFlight = async (req, res, next) => {
    try {
        const flight = await FlightService.destroy(req.params.id);
        res200('Berhasil menghapus data penerbangan', flight, res);
    } catch (error) {
        next(error);
    }
};

export const getAvailableFlight = async (req, res, next) => {
    try {
        const { error, value } = FlightValidation.querySchema.validate(req.query);
        if (error) {
            throw new Error400(`${error.details[0].message}`, 400);
        }

        const { rf, dt, ps, sc } = value;
        const data = {
            route: rf.split('.'),
            schedule: dt.split('.'),
            passengers: ps.split('.'),
            seatClass: sc
        };

        const flights = await FlightService.getAvailableFlight(data);
        res200('Berhasil mengambil data penerbangan yang tersedia', flights, res);
    } catch (error) {
        error.data = []
        next(error);
    }
};