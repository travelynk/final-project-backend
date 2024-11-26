import * as flightRouteService from '../services/flightRoute.service.js';
import * as FlightRouteValidation from '../validations/flightRoute.validation.js';
import { res200, res201 } from '../utils/response.js';
import { Error400, Error404 } from '../utils/customError.js';

export const getFlightRoutes = async (req, res, next) => {
    try {
        const flightRoutes = await flightRouteService.getAll();
        res200('Berhasil mengambil semua data rute penerbangan', flightRoutes, res);
    } catch (error) {
        next(error);
    }
};

export const getFlightRoute = async (req, res, next) => {
    try {
        const flightRoute = await flightRouteService.getOne(req.params.id);
        if (!flightRoute) throw new Error404('Data rute penerbangan tidak ditemukan');

        res200('Berhasil mengambil data rute penerbangan', flightRoute, res);
    } catch (error) {
        next(error);
    }
};

export const storeFlightRoute = async (req, res, next) => {
    try {
        const { error, value } = FlightRouteValidation.payload.validate(req.body);
        if (error) throw new Error400(`${error.details[0].message}`);

        const flightRoute = await flightRouteService.store(value);
        res201('Berhasil menambahkan data rute penerbangan', flightRoute, res);
    } catch (error) {
        next(error);
    }
};

export const updateFlightRoute = async (req, res, next) => {
    try {
        const { error, value } = FlightRouteValidation.payload.validate(req.body);
        if (error) throw new Error400(`${error.details[0].message}`);

        const flightRoute = await flightRouteService.update(req.params.id, value);
        res200('Berhasil mengubah data rute penerbangan', flightRoute, res);
    } catch (error) {
        next(error);
    }
};

export const destroyFlightRoute = async (req, res, next) => {
    try {
        const flightRoute = await flightRouteService.destroy(req.params.id);
        res200('Berhasil menghapus data rute penerbangan', flightRoute, res);
    } catch (error) {
        next(error);
    }
};