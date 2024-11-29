import * as response from '../utils/response.js';
import * as AuthValidation from '../validations/auth.validation.js';
import * as AuthService from '../services/auth.service.js';
import { Error400, Error404 } from '../utils/customError.js';

export const login = async (req, res, next) => {
    try {
        const { error, value } = AuthValidation.login.validate(req.body);
        
        if (error) {
            return response.res400(`${error.details[0].message}`, res);
        }

        const result = await AuthService.login(value);
        if(!result) {
            throw new Error400('Invalid email or password!');
        }

        response.res200('Login Success', result, res);
    } catch (error) {
        if (error.massage === 'Account has not been verified') {
            next(new Error401('Account has not been verified'));
        }
        else {
            next(error);
        }
    }
}

export const resetPassword = async (req, res, next) => {
    try {
        const { error, value } = AuthValidation.resetPassword.validate(req.body);

        if (error) {
            return response.res400(`${error.details[0].message}`, res);
        }

        const { token } = req.query; // Token is passed as query parameter

        if (!token) {
            return response.res400('Token is required', res);
        }

        // Call service to reset password using token
        const result = await AuthService.resetPassword(token, value);

        return response.res200(result.message, null, res);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            next(new Error400('Token has expired. Please request a new reset password email.'));
        }

        next(error);
    }
};

// New endpoint to send a reset password email
export const sendResetPasswordEmail = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return response.res400('Email is required', res);
        }

        await AuthService.sendResetPasswordEmail(email);

        return response.res200('Reset password email sent successfully', null, res);
    } catch (error) {
        // Tangkap error yang spesifik
        if (error.message === 'User not found') {
            next(new Error404('Email does not exist'));
        }

        next(error);
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