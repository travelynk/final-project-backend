// validations/updateProfile.validation.js
import Joi from 'joi';

export const dataProfile = Joi.object({
    grossAmount: Joi.number().required().messages({
        'any.required': 'Gross Amount is required',
        'number.base': 'Gross Amount must be a number',
    }),
    firstName: Joi.string().required().messages({
        'any.required': 'First Name is required',
        'string.base': 'First Name must be a string',
    }),
    lastName: Joi.string().required().messages({
        'any.required': 'Last Name is required',
        'string.base': 'Last Name must be a string',
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Please provide a valid email',
    }),
    phone: Joi.string().required().messages({
        'any.required': 'Phone number is required',
        'string.base': 'Phone number must be a string',
    }),
});
