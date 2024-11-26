import joi from 'joi';

export const payload = joi.object({
    code: joi.string().min(2).max(4).required().messages({
        'string.base': 'Kode harus berupa teks',
        'string.empty': 'Kode tidak boleh kosong',
        'string.min': 'Kode harus memiliki panjang minimal 2 karakter',
        'string.max': 'Kode harus memiliki panjang maksimal 4 karakter',
        'any.required': 'Kode adalah field yang wajib diisi'
    }),
    name: joi.string().max(50).required().messages({
        'string.base': 'Nama harus berupa teks',
        'string.empty': 'Nama tidak boleh kosong',
        'string.max': 'Nama harus memiliki panjang maksimal 50 karakter',
        'any.required': 'Nama adalah field yang wajib diisi'
    }),
    cityCode: joi.string().min(2).max(4).required().messages({
        'string.base': 'Kode Kota harus berupa teks',
        'string.empty': 'Kode Kota tidak boleh kosong',
        'string.min': 'Kode Kota harus memiliki panjang minimal 2 karakter',
        'string.max': 'Kode Kota harus memiliki panjang maksimal 4 karakter',
        'any.required': 'Kode Kota adalah field yang wajib diisi'
    })
});