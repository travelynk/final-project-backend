import joi from 'joi';

export const payload = joi.object({
    code: joi.string().min(2).max(4).required(),
    name: joi.string().max(50).required(),
    cityCode: joi.string().min(2).max(4).required(),
});