import * as response from '../utils/response.js';
import * as AuthValidation from '../validations/auth.validation.js';
import * as AuthService from '../services/auth.service.js';
import { Error400 } from '../utils/customError.js';

export const login = async (req, res) => {
    try {
        const { error, value } = AuthValidation.login.validate(req.body);

        if (error) {
            response.res400(`${error.details[0].message}`, res);
        }

        const token = await AuthService.login(value);

        response.res200('Login Success', token, res);
    } catch (error) {
        console.log('Error: ' + error.message);
        response.res500(res);
    }
}

export const register = async (req, res, next) => {
    try {
        const { error, value } = AuthValidation.register.validate(req.body);
        if (error) {
            throw new Error400(error.message);
        };

        const result = await AuthService.register(value);
        response.res200(result, null, res);
    } catch (error) {
        next(error);
    };
};

export const sendOtp = async (req, res, next) => {
    try {
        const { error, value } = AuthValidation.sendOtp.validate(req.body);

        if (error) {
            throw new Error400(error.message);
        };

        const result = await AuthService.sendOtp(value.email);

        response.res200(result, null, res);
    } catch (error) {
        next(error);
    };
};

export const verifyOtp = async (req, res, next) => {
    try {
        const { error, value } = AuthValidation.verifyOtp.validate(req.body);
        if (error) {
            throw new Error400(error.message);
        };

        const result = await AuthService.verifyOtp(value);

        response.res200(result, null, res);
    } catch (error) {
        next(error);
    };
};