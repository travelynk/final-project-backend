import joi from 'joi';

export const payload = joi.object({
    name: joi.string().max(50).required().messages({
        'string.base': 'Nama harus berupa teks',
        'string.max': 'Nama harus memiliki panjang maksimal 50 karakter',
        'any.required': 'Nama adalah field yang wajib diisi'
    }),
    airportId: joi.number().required().messages({
        'number.base': 'ID Bandara harus berupa angka',
        'any.required': 'ID Bandara adalah field yang wajib diisi'
    }),
    category: joi.string().valid('Internasional', 'Domestik', 'Multi').required().messages({
        'string.base': 'Kategori harus berupa teks',
        'any.only': 'Kategori harus salah satu dari [Internasional, Domestik]',
        'any.required': 'Kategori adalah field yang wajib diisi'
    })
});