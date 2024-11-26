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
    }),
    seatCapacity: joi.number().required().messages({
        'number.base': 'Kapasitas kursi harus berupa angka',
        'any.required': 'Kapasitas kursi wajib diisi'
    }),
    facility: joi.string().empty('').messages({
        'string.base': 'Fasilitas harus berupa teks'
    }),
    airportId: joi.number().required().messages({
        'number.base': 'ID bandara harus berupa angka',
        'any.required': 'ID bandara wajib diisi'
    }),
});