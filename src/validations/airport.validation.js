import joi from 'joi';

export const payload = joi.object({
    code: joi.string().min(2).max(4).required().messages({
        'string.base': 'Code should be a type of text',
        'string.empty': 'Code cannot be empty',
        'string.min': 'Code should have a minimum length of 2',
        'string.max': 'Code should have a maximum length of 4',
        'any.required': 'Code is a required field'
    }),
    name: joi.string().max(50).required().messages({
        'string.base': 'Name should be a type of text',
        'string.empty': 'Name cannot be empty',
        'string.max': 'Name should have a maximum length of 50',
        'any.required': 'Name is a required field'
    }),
    cityCode: joi.string().min(2).max(4).required().messages({
        'string.base': 'City Code should be a type of text',
        'string.empty': 'City Code cannot be empty',
        'string.min': 'City Code should have a minimum length of 2',
        'string.max': 'City Code should have a maximum length of 4',
        'any.required': 'City Code is a required field'
    })
});