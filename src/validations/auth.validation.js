import Joi from 'joi';

export const login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(10).max(20).required(),
});
