import * as AirportService from "../services/airport.service.js";
import * as AirportValidation from "../validations/airport.validation.js";
import { res200, res201 } from "../utils/response.js";
import { Error404, Error400 } from "../utils/customError.js";

export const getAirports = async (req, res, next) => {
  try {
    const airports = await AirportService.getAll();
    res200("Berhasil mengambil semua data bandara", airports, res);
  } catch (error) {
    next(error);
  }
};

export const getAirport = async (req, res, next) => {
  try {
    const airport = await AirportService.getOne(req.params.id);
    if (!airport) {
      throw new Error404("Data bandara tidak ditemukan");
    }
    res200("Berhasil mengambil data bandara", airport, res);
  } catch (error) {
    next(error);
  }
};

export const storeAirport = async (req, res, next) => {
  try {
    const { error, value } = AirportValidation.payload.validate(req.body);
    if (error) {
      throw new Error400(`${error.details[0].message}`);
    }
    const airport = await AirportService.store(value);
    res201("Berhasil menambahkan data bandara", airport, res);
  } catch (error) {
    next(error);
  }
};

export const updateAirport = async (req, res, next) => {
  try {
    const { error, value } = AirportValidation.payload.validate(req.body);
    if (error) {
      throw new Error400(`${error.details[0].message}`);
    }

    const airport = await AirportService.update(req.params.id, value);
    res200("Berhasil mengubah data bandara", airport, res);
  } catch (error) {
    next(error);
  }
};

export const destroyAirport = async (req, res, next) => {
  try {
    const airport = await AirportService.destroy(req.params.id);
    res200("Berhasil menghapus data bandara", airport, res);
  } catch (error) {
    next(error);
  }
};
