import joi from 'joi';

export const createPayload = joi.object({
    code: joi.string().min(2).max(4).required(),
    name: joi.string().max(50).required(),
    countryCode: joi.string().min(2).max(4).required(),
});

export const updatePayload = joi.object({
    name: joi.string().max(50).required(),
    countryCode: joi.string().min(2).max(4).required(),
});