import * as airlineService from '../services/airline.service.js';
import * as response from '../utils/response.js';
import * as AirlineValidation from '../validations/airline.validation.js';

export const getAirlines = async (req, res) => {
    try {
        const airlines = await airlineService.getAll();
        response.res200('Berhasil mengambil semua data maskapai', airlines, res);
    } catch (error) {
        console.log(error.message);
        response.res500(res);
    }
};

export const getAirline = async (req, res) => {
    try {
        const airline = await airlineService.getOne(req.params.id);
        if (!airline) {
            return response.res404('Data maskapai tidak ditemukan', res);
        }
        response.res200('Berhasil mengambil data maskapai', airline, res);
    } catch (error) {
        console.log(error.message);
        response.res500(res);
    }
};

export const storeAirline = async (req, res) => {
    try {
        const { error, value } = AirlineValidation.payload.validate(req.body);
        if (error) {
            return response.res400(`Validasi error: ${error.details[0].message}`, res);
        }
        const airline = await airlineService.store(value);
        response.res201('Berhasil menambahkan data maskapai', airline, res);
    } catch (error) {
        console.log(error.message);
        response.res500(res);
    }
};

export const updateAirline = async (req, res) => {
    try {
        const { error, value } = AirlineValidation.payload.validate(req.body);
        if (error) {
            return response.res400(`Validasi error: ${error.details[0].message}`, res);
        }
        const airline = await airlineService.update(req.params.id, value);
        response.res200('Berhasil mengubah data maskapai', airline, res);
    } catch (error) {
        console.log(error.message);
        response.res500(res);
    }
};

export const destroyAirline = async (req, res) => {
    try {
        const airline = await airlineService.destroy(req.params.id);
        if (!airline) {
            return response.res404('Data maskapai tidak ditemukan', res);
        }
        response.res200('Berhasil menghapus data maskapai', airline, res);
    } catch (error) {
        console.log(error.message);
        response.res500(res);
    }
};