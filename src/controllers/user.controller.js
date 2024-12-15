import * as UserService from '../services/user.service.js';
import * as UserValidation from '../validations/user.validation.js';
import { res200 } from '../utils/response.js';
import { Error400, Error404 } from '../utils/customError.js';

export const getUsers = async (req, res, next) => {
    try {
        const users = await UserService.getAll();
        
        res200('Berhasil mengambil semua data user', users, res);
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const user = await UserService.getOne(req.params.id);
        if (!user) throw new Error404('Data user tidak ditemukan');

        res200('Berhasil mengambil data user', user, res);
    } catch (error) {
        next(error);
    }
};

export const updateRoleUser = async (req, res, next) => {
    try {
        const { error, value } = UserValidation.schemaUpdateRole.validate(req.body);
        if (error) throw new Error400(`${error.details[0].message}`);

        const user = await UserService.update(req.params.id, value);
        res200('Berhasil mengubah role user', user, res);
    } catch (error) {
        if (error.code === 'P2025') return next(new Error404('Data user tidak ditemukan'));
        next(error);
    }
};