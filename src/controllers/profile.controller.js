import { res200 } from '../utils/response.js';
import * as ProfileValidation from '../validations/profile.validation.js';
import * as ProfileService from '../services/profile.service.js';
import { Error400, Error404 } from '../utils/customError.js';

export const getProfile = async (req, res, next) => {
    try {
        const { id } = req.user
        const user = await ProfileService.getProfile(id);
        res200('Berhasil', user, res);
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

        const { id } = req.user
        const user = await ProfileService.updateProfile(id, value);
        res200('Berhasil', user, res);
    } catch (error) {
        if (error.code === "P2025") {
            error.message = "Pengguna tidak ditemukan. Pastikan informasi yang Anda masukkan sudah benar dan coba lagi."
            next(new Error404(error.message))
        }
        next(error)
    }
}