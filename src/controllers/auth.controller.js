import * as response from '../utils/response.js';
import * as AuthValidation from '../validations/auth.validation.js';
import * as AuthService from '../services/auth.service.js';

// export const login = async (req, res) => {
//     try {
//         const { error, value } = AuthValidation.login.validate(req.body);

//         if (error) {
//             response.res400(`${error.details[0].message}`, res);
//         }

//         const token = await AuthService.login(value);

//         response.res200('Login Success', token, res);
//     } catch (error) {
//         console.log('Error: ' + error.message);
//         response.res500(res);
//     }
// }


export const login = async (req, res) => {
    try {
        const { error, value } = AuthValidation.login.validate(req.body);

        if (error) {
            return response.res400(`${error.details[0].message}`, res);
        }

        const token = await AuthService.login(value);

        if (!token) {
            return response.res401('Invalid email or password', res);
        }

        // Verifikasi jika token ada, namun user belum diverifikasi
        if (token.error && token.error === 'Account is not verified') {
            return response.res401('Account is not verified. Please check your email for verification.', res);
        }

        return response.res200('Login Success', token, res);
    } catch (error) {
        // console.error('Error: ' + error.message);
        return response.res500(res);
    }
};

export const register = async (req, res) => {
    try {
        const { error, value } = AuthValidation.register.validate(req.body);

        if (error) {
            return response.res400(`${error.details[0].message}`, res);
        }

        const result = await AuthService.register(value);

        return response.res201('User registered successfully', result, res);
    } catch (error) {
        // console.error('Error: ' + error.message);
        return response.res500(res);
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { error, value } = AuthValidation.resetPassword.validate(req.body);

        if (error) {
            return response.res400(`${error.details[0].message}`, res);
        }

        const { token } = req.query; // Token is passed as query parameter

        if (!token) {
            return response.res400('Token is required', res);
        }

        // console.log("Value asli:", value)
        // console.log("Value:", value.newPassword)

        // Call service to reset password using token
        const result = await AuthService.resetPassword(token, value);

        return response.res200(result.message, null, res);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return response.res400('Token has expired. Please request a new reset password email.', res);
        }

        // console.error('Error: ' + error.message);
        return response.res500(res, error.message);
    }
};


// New endpoint to send a reset password email
export const sendResetPasswordEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return response.res400('Email is required', res);
        }

        const result = await AuthService.sendResetPasswordEmail(email);

        // return response.res200('Reset password email sent successfully', result, res);
        return response.res200('Reset password email sent successfully', null, res);
    } catch (error) {

        // Tangkap error yang spesifik
        if (error.message === 'User not found') {
            return response.res400('Email does not exist', res);
        }

        // console.error('Error: ' + error.message);
        return response.res500(res, error.message);
    }
};