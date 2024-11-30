// controllers/updateProfile.controller.js
import * as response from '../utils/response.js';
import * as dataValidation from '../validations/data.validation.js';
import * as dataService from '../services/data.service.js';
import { Error400 } from '../utils/customError.js';

export const dataProfile = async (req, res, next) => {
    try {
        // Validasi input
        const { error, value } = dataValidation.dataProfile.validate(req.body);

        if (error) {
            return response.res400(`${error.details[0].message}`, res);
        }

        // Panggil service untuk mengupdate data profile
        const result = await dataService.dataProfile(value, req.user.id); // req.user.id adalah ID user yang sudah terautentikasi

        return response.res200('Profile updated successfully', result, res);
    } catch (error) {
        next(error);
    }
};
