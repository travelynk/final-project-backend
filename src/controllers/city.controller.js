import * as cityService from "../services/city.service.js";
import * as response from "../utils/response.js";
import * as CityValidation from "../validations/city.validation.js";

export const getCities = async (req, res) => {
  try {
    const cities = await cityService.getAll();
    response.res200("Berhasil mengambil semua data kota", cities, res);
  } catch (error) {
    console.log(error.message);
    response.res500(res);
  }
};

export const getCity = async (req, res) => {
  try {
    const city = await cityService.getOne(req.params.code);
    if (!city) {
      response.res404("Data kota tidak ditemukan", res);
      return;
    }
    response.res200("Berhasil mengambil data kota", city, res);
  } catch (error) {
    console.log(error.message);
    response.res500(res);
  }
};

export const storeCity = async (req, res) => {
  try {
    const { error, value } = CityValidation.createPayload.validate(req.body);
    if (error) {
      return response.res400(
        `Validasi error: ${error.details[0].message}`,
        res
      );
    }
    const city = await cityService.store(value);
    response.res201("Berhasil menambahkan data kota", city, res);
  } catch (error) {
    console.log(error.message);
    response.res500(res);
  }
};

export const updateCity = async (req, res) => {
  try {
    const { error, value } = CityValidation.updatePayload.validate(req.body);
    if (error) {
      return response.res400(
        `Validasi error: ${error.details[0].message}`,
        res
      );
    }

    const city = await cityService.update(req.params.code, value);
    response.res200("Berhasil mengubah data kota", city, res);
  } catch (error) {
    console.log(error.message);
    response.res500(res);
  }
};

export const destroyCity = async (req, res) => {
  try {
    const city = await cityService.destroy(req.params.code);
    response.res200("Berhasil menghapus data kota", city, res);
  } catch (error) {
    console.log(error.message);
    response.res500(res);
  }
};
