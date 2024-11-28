import * as response from '../utils/response.js';
import * as AuthValidation from '../validations/auth.validation.js';
import * as AuthService from '../services/auth.service.js';
import { Error400, Error401, Error404 } from '../utils/customError.js';

export const login = async (req, res, next) => {
    try {
        const { error, value } = AuthValidation.login.validate(req.body);
        
        if (error) {
            return response.res400(`${error.details[0].message}`, res);
        }

        const result = await AuthService.login(value);
        
        if (!result) {
            return response.res401('Invalid email or password!', res);
        }

        return response.res200('Login Success', result, res);
    } catch (error) {
        next(error);
    }
};
