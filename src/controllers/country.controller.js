import * as CountryService from "../services/country.service.js";
import * as CountryValidation from "../validations/country.validation.js";
import { res200, res201 } from "../utils/response.js";
import { Error400, Error404 } from "../utils/customError.js";

export const getCountries = async (req, res, next) => {
  try {
    const countries = await CountryService.getAll();

    res200("Berhasil mengambil semua data negara", countries, res);
  } catch (error) {
    next(error);
  }
};

export const getCountry = async (req, res, next) => {
  try {
    const country = await CountryService.getOne(req.params.code);

    if(!country) throw new Error404('Data negara tidak ditemukan');

    res200("Berhasil mengambil satu data negara", country, res);
  } catch (error) {
    next(error);
  }
};

export const createCountry = async (req, res, next) => {
  try {
    const { error, value } = CountryValidation.payload.validate(req.body);
    
    if (error) throw new Error400(`${error.details[0].message}`);
    
    const country = await CountryService.store(value);

    res201("Berhasil menambahkan data negara baru", country, res);
  } catch (error) {
    if(error.code === 'P2002') return next(new Error400('Kode negara sudah digunakan'));
    next(error);
  }
};

export const updateCountry = async (req, res, next) => {
  try {
    const { error, value } = CountryValidation.payload.validate(req.body);

    if (error) throw new Error400(`${error.details[0].message}`);

    const country = await CountryService.update(req.params.code, value);

    res200("Berhasil memperbarui data negara", country, res);
  } catch (error) {
    if(error.code === 'P2002') return next(new Error400('Kode negara sudah digunakan'));
    next(error);
  }
};

export const deleteCountry = async (req, res, next) => {
  try {
    const country = await CountryService.destroy(req.params.code);

    res200("Berhasil menghapus negara", country, res);
  } catch (error) {
    next(error);
  }
};
