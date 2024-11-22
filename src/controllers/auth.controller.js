import * as response from '../utils/response.js';
import * as AuthValidation from '../validations/auth.validation.js';
import * as AuthService from '../services/auth.service.js';

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