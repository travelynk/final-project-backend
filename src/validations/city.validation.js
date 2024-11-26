import joi from 'joi';

export const createPayload = joi.object({
    code: joi.string().min(2).max(4).required().messages({
        'string.base': 'Code should be a type of text',
        'string.min': 'Code should have a minimum length of 2',
        'string.max': 'Code should have a maximum length of 4',
        'any.required': 'Code is a required field'
    }),
    name: joi.string().max(50).required().messages({
        'string.base': 'Name should be a type of text',
        'string.max': 'Name should have a maximum length of 50',
        'any.required': 'Name is a required field'
    }),
    countryCode: joi.string().min(2).max(4).required().messages({
        'string.base': 'Country Code should be a type of text',
        'string.min': 'Country Code should have a minimum length of 2',
        'string.max': 'Country Code should have a maximum length of 4',
        'any.required': 'Country Code is a required field'
    }),
});

export const updatePayload = joi.object({
    name: joi.string().max(50).required().messages({
        'string.base': 'Name should be a type of text',
        'string.max': 'Name should have a maximum length of 50',
        'any.required': 'Name is a required field'
    }),
    countryCode: joi.string().min(2).max(4).required().messages({
        'string.base': 'Country Code should be a type of text',
        'string.min': 'Country Code should have a minimum length of 2',
        'string.max': 'Country Code should have a maximum length of 4',
        'any.required': 'Country Code is a required field'
    }),
});
