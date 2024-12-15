import joi from 'joi';

export const payload = joi.object({
    code: joi.string().min(2).max(4).required().messages({
        'string.base': 'Kode harus berupa teks',
        'string.min': 'Kode minimal harus terdiri dari 2 karakter',
        'string.max': 'Kode maksimal harus terdiri dari 4 karakter',
        'any.required': 'Kode wajib diisi'
    }),
    name: joi.string().max(50).required().messages({
        'string.base': 'Nama harus berupa teks',
        'string.max': 'Nama maksimal harus terdiri dari 50 karakter',
        'any.required': 'Nama wajib diisi'
    })
});