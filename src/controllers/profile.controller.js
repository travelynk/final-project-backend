import * as response from '../utils/response.js';
import * as ProfileValidation from '../validations/profile.validation.js';
import * as ProfileService from '../services/profile.service.js';
import { Error400 } from '../utils/customError.js';

export const getProfile = async (req, res, next) => {
    try {
        const id = 3
        const user = await ProfileService.getProfile(id);
        response.res200('Berhasil', user, res);
    } catch (error) {
        next(error)
    }
}

export const updateProfile = async (req, res, next) => {
    try {
        const { error, value } = ProfileValidation.updateProfile.validate(req.body);

        if (error) {
            throw new Error400(error.message);
        };

        const id = 3;
        const user = await ProfileService.updateProfile(id, value);
        response.res200('Berhasil', user, res);
    } catch (error) {
        next(error)
    }
}