import joi from 'joi';

export const createPayload = joi.object({
    code: joi.string().min(2).max(4).required().messages({
        'string.base': 'Kode harus berupa teks',
        'string.min': 'Kode harus memiliki panjang minimal 2 karakter',
        'string.max': 'Kode harus memiliki panjang maksimal 4 karakter',
        'any.required': 'Kode adalah field yang wajib diisi'
    }),
    name: joi.string().max(50).required().messages({
        'string.base': 'Nama harus berupa teks',
        'string.max': 'Nama harus memiliki panjang maksimal 50 karakter',
        'any.required': 'Nama adalah field yang wajib diisi'
    }),
    countryCode: joi.string().min(2).max(4).required().messages({
        'string.base': 'Kode Negara harus berupa teks',
        'string.min': 'Kode Negara harus memiliki panjang minimal 2 karakter',
        'string.max': 'Kode Negara harus memiliki panjang maksimal 4 karakter',
        'any.required': 'Kode Negara adalah field yang wajib diisi'
    }),
});

export const updatePayload = joi.object({
    name: joi.string().max(50).required().messages({
        'string.base': 'Nama harus berupa teks',
        'string.max': 'Nama harus memiliki panjang maksimal 50 karakter',
        'any.required': 'Nama adalah field yang wajib diisi'
    }),
    countryCode: joi.string().min(2).max(4).required().messages({
        'string.base': 'Kode Negara harus berupa teks',
        'string.min': 'Kode Negara harus memiliki panjang minimal 2 karakter',
        'string.max': 'Kode Negara harus memiliki panjang maksimal 4 karakter',
        'any.required': 'Kode Negara adalah field yang wajib diisi'
    }),
});
