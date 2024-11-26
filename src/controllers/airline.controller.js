import * as airlineService from '../services/airline.service.js';
import * as AirlineValidation from '../validations/airline.validation.js';
import { res200, res201 } from '../utils/response.js';
import { Error400, Error404 } from '../utils/customError.js';

export const getAirlines = async (req, res, next) => {
    try {
        const airlines = await airlineService.getAll();
        res200('Berhasil mengambil semua data maskapai', airlines, res);
    } catch (error) {
        next(error);
    }
};

export const getAirline = async (req, res, next) => {
    try {
        const airline = await airlineService.getOne(req.params.id);
        if (!airline) {
            throw new Error404('Data maskapai tidak ditemukan');
        }
        res200('Berhasil mengambil data maskapai', airline, res);
    } catch (error) {
        next(error);
    }
};

export const storeAirline = async (req, res, next) => {
    try {
        const { error, value } = AirlineValidation.payload.validate(req.body);
        if (error) {
            throw new Error400(`${error.details[0].message}`);
        }
        const airline = await airlineService.store(value);
        res201('Berhasil menambahkan data maskapai', airline, res);
    } catch (error) {
        next(error);
    }
};

export const updateAirline = async (req, res, next) => {
    try {
        const { error, value } = AirlineValidation.payload.validate(req.body);
        if (error) {
            throw new Error400(`${error.details[0].message}`);
        }
        const airline = await airlineService.update(req.params.id, value);
        res200('Berhasil mengubah data maskapai', airline, res);
    } catch (error) {
        next(error);
    }
};

export const destroyAirline = async (req, res, next) => {
    try {
        const airline = await airlineService.destroy(req.params.id);
        if (!airline) {
            throw new Error404('Data maskapai tidak ditemukan');
        }
        res200('Berhasil menghapus data maskapai', airline, res);
    } catch (error) {
        next(error);
    }
};