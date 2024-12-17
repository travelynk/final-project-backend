import joi from 'joi';

export const payload = joi.object({
    code: joi.string().min(2).max(4).required().messages({
        'string.base': 'Kode harus berupa teks',
        'string.empty': 'Kode tidak boleh kosong',
        'string.min': 'Kode harus memiliki panjang minimal {#limit} karakter',
        'string.max': 'Kode harus memiliki panjang maksimal {#limit} karakter',
        'any.required': 'Kode wajib diisi'
    }),
    name: joi.string().max(50).required().messages({
        'string.base': 'Nama harus berupa teks',
        'string.empty': 'Nama tidak boleh kosong',
        'string.max': 'Nama harus memiliki panjang maksimal {#limit} karakter',
        'any.required': 'Nama wajib diisi'
    }),
    region: joi.string().valid('Asia', 'Afrika', 'Amerika Utara', 'Amerika Latin', 'Eropa', 'Australia').required().messages({
        'string.base': 'Region harus berupa teks',
        'string.empty': 'Region tidak boleh kosong',
        'any.required': 'Region wajib diisi',
        'any.only': 'Region harus salah satu dari {#valids}'
    })
});

export const payloadUpdate = joi.object({
    name: joi.string().max(50).required().messages({
        'string.base': 'Nama harus berupa teks',
        'string.empty': 'Nama tidak boleh kosong',
        'string.max': 'Nama harus memiliki panjang maksimal {#limit} karakter',
        'any.required': 'Nama wajib diisi'
    }),
    region: joi.string().valid('Asia', 'Afrika', 'Amerika Utara', 'Amerika Latin', 'Eropa', 'Australia').required().messages({
        'string.base': 'Region harus berupa teks',
        'string.empty': 'Region tidak boleh kosong',
        'any.required': 'Region wajib diisi',
        'any.only': 'Region harus salah satu dari {#valids}'
    })
});