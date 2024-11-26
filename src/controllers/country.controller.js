import * as response from "../utils/response.js";
import * as CountryService from "../services/country.service.js";
import * as CountryValidation from "../validations/country.validation.js";
import { Error400 } from "../utils/customError.js";

export const getCountries = async (req, res, next) => {
  try {
    const countries = await CountryService.getAll();

    response.res200("Berhasil mengambil semua data negara", countries, res);
  } catch (error) {
    next(error);
  }
};

export const getCountry = async (req, res, next) => {
  try {
    const country = await CountryService.getOne(req.params.code);

    response.res200("Berhasil mengambil satu data negara", country, res);
  } catch (error) {
    next(error);
  }
};

export const createCountry = async (req, res, next) => {
  try {
    const { error, value } = CountryValidation.payload.validate(req.body);
    if (error) {
      throw new Error400(`${error.details[0].message}`);
    }
    
    const country = await CountryService.store(value);

    response.res201("Berhasil menambahkan data negara baru", country, res);
  } catch (error) {
    if(error.code === 'P2002') return next(new Error400('Kode negara sudah digunakan'));
    next(error);
  }
};

export const updateCountry = async (req, res, next) => {
  try {
    const { error, value } = CountryValidation.payload.validate(req.body);

    if (error) {
      throw new Error400(`${error.details[0].message}`);
    }

    const country = await CountryService.update(req.params.code, value);

    response.res200("Berhasil memperbarui data negara", country, res);
  } catch (error) {
    if(error.code === 'P2002') return next(new Error400('Kode negara sudah digunakan'));
    next(error);
  }
};

export const deleteCountry = async (req, res, next) => {
  try {
    const country = await CountryService.destroy(req.params.code);

    response.res200("Berhasil menghapus negara", country, res);
  } catch (error) {
    next(error);
  }
};
