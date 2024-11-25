import joi from 'joi';

export const payload = joi.object({
    name: joi.string().max(50).required(),
    airportId: joi.number().required(),
    category: joi.string().valid('Internasional', 'Domestik').required(),
});