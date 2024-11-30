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
        console.log(error)
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
        const route = (req.query.rf).split('.');
        const schedule = (req.query.dt).split('.');
        const passengers = (req.query.ps).split('.');
        const seatClass = req.query.sc;
    
        if (route.length !== 2) throw new Error400('Rute tidak valid!');
        if (schedule.length > 2 || schedule.length <= 0) throw new Error400('Jadwal tidak valid!');
        if (passengers.length !== 3) throw new Error400('Jumlah penumpang tidak valid!');

        //check schedule [0] and [1] (if available) must be in the format of 'YYYY-MM-DD' not a number or not a string random
        if (schedule.length === 2) {
            if (isNaN(Date.parse(schedule[0])) || isNaN(Date.parse(schedule[1]))) {
                throw new Error400('Jadwal tidak valid!');
            }
        } else {
            if (isNaN(Date.parse(schedule[0]))) {
                throw new Error400('Jadwal tidak valid!');
            }
        }

        if(schedule[0] > schedule[1]) throw new Error400('Jadwal tidak valid! tidak boleh sama');

        const data = {
            route,
            schedule,
            passengers,
            seatClass
        };

        const flights = await FlightService.getAvailableFlight(data);
        res200('Berhasil mengambil data penerbangan yang tersedia', flights, res);
    } catch (error) {
        next(error);
    }
};