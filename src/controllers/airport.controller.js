import * as airportService from "../services/airport.service.js";
import * as response from "../utils/response.js";
import * as AirportValidation from "../validations/airport.validation.js";

export const getAirports = async (req, res) => {
  try {
    const airports = await airportService.getAll();
    response.res200("Berhasil mengambil semua data bandara", airports, res);
  } catch (error) {
    console.log(error.message);
    response.res500(res);
  }
};

export const getAirport = async (req, res) => {
  try {
    const airport = await airportService.getOne(req.params.id);
    if (!airport) {
      response.res404("Data bandara tidak ditemukan", res);
      return;
    }
    response.res200("Berhasil mengambil data bandara", airport, res);
  } catch (error) {
    console.log(error.message);
    response.res500(res);
  }
};

export const storeAirport = async (req, res) => {
  try {
    const { error, value } = AirportValidation.payload.validate(req.body);
    if (error) {
      return response.res400(
        `Validasi error: ${error.details[0].message}`,
        res
      );
    }
    const airport = await airportService.store(value);
    response.res201("Berhasil menambahkan data bandara", airport, res);
  } catch (error) {
    console.log(error.message);
    response.res500(res);
  }
};

export const updateAirport = async (req, res) => {
  try {
    const { error, value } = AirportValidation.payload.validate(req.body);
    if (error) {
      return response.res400(
        `Validasi error: ${error.details[0].message}`,
        res
      );
    }

    const airport = await airportService.update(req.params.id, value);
    response.res200("Berhasil mengubah data bandara", airport, res);
  } catch (error) {
    console.log(error.message);
    response.res500(res);
  }
};

export const destroyAirport = async (req, res) => {
  try {
    const airport = await airportService.destroy(req.params.id);
    response.res200("Berhasil menghapus data bandara", airport, res);
  } catch (error) {
    console.log(error.message);
    response.res500(res);
  }
};
