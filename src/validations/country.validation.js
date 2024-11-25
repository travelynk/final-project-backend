import joi from 'joi';

export const payload = joi.object({
    code: joi.string().min(2).max(4).required(),
    name: joi.string().max(50).required(),
    region: joi.string().valid('Asia', 'Afrika', 'Amerika Utara', 'Amerika Latin', 'Eropa', 'Australia').required(),
});