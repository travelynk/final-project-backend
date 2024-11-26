import * as cityService from "../services/city.service.js";
import * as CityValidation from "../validations/city.validation.js";
import { res200, res201 } from "../utils/response.js";
import { Error400, Error404 } from "../utils/customError.js";

export const getCities = async (req, res, next) => {
  try {
    const cities = await cityService.getAll();
    res200("Berhasil mengambil semua data kota", cities, res);
  } catch (error) {
    next(error);
  }
};

export const getCity = async (req, res, next) => {
  try {
    const city = await cityService.getOne(req.params.code);
    if (!city) {
      throw new Error404("Data kota tidak ditemukan");
    }
    res200("Berhasil mengambil data kota", city, res);
  } catch (error) {
    next(error);
  }
};

export const storeCity = async (req, res, next) => {
  try {
    const { error, value } = CityValidation.createPayload.validate(req.body);
    if (error) {
      throw new Error400(`${error.details[0].message}`);
    }
    const city = await cityService.store(value);
    res201("Berhasil menambahkan data kota", city, res);
  } catch (error) {
    next(error);
  }
};

export const updateCity = async (req, res, next) => {
  try {
    const { error, value } = CityValidation.updatePayload.validate(req.body);
    if (error) {
      throw new Error400(`${error.details[0].message}`);
    }

    const city = await cityService.update(req.params.code, value);
    res200("Berhasil mengubah data kota", city, res);
  } catch (error) {
    next(error);
  }
};

export const destroyCity = async (req, res, next) => {
  try {
    const city = await cityService.destroy(req.params.code);
    res200("Berhasil menghapus data kota", city, res);
  } catch (error) {
    next(error);
  }
};
