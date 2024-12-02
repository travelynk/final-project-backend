import * as AirlineService from '../services/airline.service.js';
import * as AirlineValidation from '../validations/airline.validation.js';
import { res200, res201 } from '../utils/response.js';
import { Error400, Error404 } from '../utils/customError.js';

export const getAirlines = async (req, res, next) => {
    try {
        const airlines = await AirlineService.getAll();
        res200('Berhasil mengambil semua data maskapai', airlines, res);
    } catch (error) {
        next(error);
    }
};

export const getAirline = async (req, res, next) => {
    try {
        const airline = await AirlineService.getOne(req.params.id);
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
        if (!req.file) {
            throw new Error400('Silakan pilih gambar untuk diunggah');
        }
        const airline = await AirlineService.store(value, req.file);
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
        const airline = await AirlineService.update(req.params.id, value);
        res200('Berhasil mengubah data maskapai', airline, res);
    } catch (error) {
        next(error);
    }
};

export const updateImageAirline = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new Error400('Silakan pilih gambar untuk diunggah');
        }
        const airline = await AirlineService.updateImage(req.params.id, req.file);
        res200('Berhasil mengubah gambar maskapai', airline, res);
    } catch (error) {
        next(error);
    }
};

export const destroyAirline = async (req, res, next) => {
    try {
        const airline = await AirlineService.destroy(req.params.id);
        if (!airline) {
            throw new Error404('Data maskapai tidak ditemukan');
        }
        res200('Berhasil menghapus data maskapai', airline, res);
    } catch (error) {
        next(error);
    }
};