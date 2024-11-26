import * as response from "../utils/response.js";
import * as CountryService from "../services/country.service.js";
import * as CountryValidation from "../validations/country.validation.js";

export const getCountries = async (req, res) => {
  try {
    const countries = await CountryService.getAll();

    response.res200("Berhasil mengambil semua data negara", countries, res);
  } catch (error) {
    console.log("Error: " + error.message);
    response.res500(res);
  }
};

export const getCountry = async (req, res) => {
  try {
    const country = await CountryService.getOne(req.params.code);

    response.res200("Berhasil mengambil satu data negara", country, res);
  } catch (error) {
    console.log("Error: " + error.message);
    response.res500(res);
  }
};

export const createCountry = async (req, res) => {
  try {
    const { error, value } = CountryValidation.payload.validate(req.body);
    if (error) {
      return response.res400(
        `Validation error: ${error.details[0].message}`,
        res
      );
    }
    

    const country = await CountryService.store(value);

    response.res200("Berhasil menambahkan data negara baru", country, res);
  } catch (error) {
    console.log("Error: " + error.message);
    response.res500(res);
  }
};

export const updateCountry = async (req, res) => {
  try {
    const { error, value } = CountryValidation.payload.validate(req.body);

    if (error) {
      return response.res400(
        `Validation error: ${error.details[0].message}`,
        res
      );
    }

    const country = await CountryService.update(req.params.code, value);

    response.res200("Berhasil memperbarui data negara", country, res);
  } catch (error) {
    console.log("Error: " + error.message);
    response.res500(res);
  }
};

export const deleteCountry = async (req, res) => {
  try {
    const country = await CountryService.destroy(req.params.code);

    response.res200("Berhasil menghapus negara", country, res);
  } catch (error) {
    console.log("Error: " + error.message);
    response.res500(res);
  }
};
