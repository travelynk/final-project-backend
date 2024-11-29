import joi from 'joi';

export const flightSchema = joi.object({
    airlineId: joi.number().required().messages({
        'any.required': 'ID maskapai diperlukan',
        'number.base': 'ID maskapai harus berupa angka'
    }),
    flightNum: joi.string().max(15).required().messages({
        'any.required': 'Nomor penerbangan diperlukan',
        'string.base': 'Nomor penerbangan harus berupa string',
        'string.max': 'Nomor penerbangan harus maksimal 15 karakter'
    }),
    departureAirportId: joi.number().required().messages({
        'any.required': 'ID bandara keberangkatan diperlukan',
        'number.base': 'ID bandara keberangkatan harus berupa angka'
    }),
    arrivalAirportId: joi.number().invalid(joi.ref('departureAirportId')).required().messages({
        'any.required': 'ID bandara kedatangan diperlukan',
        'number.base': 'ID bandara kedatangan harus berupa angka',
        'any.invalid': 'ID bandara kedatangan tidak boleh sama dengan ID bandara keberangkatan'
    }),
    departureTime: joi.date().required().messages({
        'any.required': 'Waktu keberangkatan diperlukan',
        'date.base': 'Waktu keberangkatan harus berupa tanggal yang valid'
    }),
    arrivalTime: joi.date().required().invalid(joi.ref("departureTime")).greater(joi.ref('departureTime')).messages({
        'any.required': 'Waktu kedatangan diperlukan',
        'date.base': 'Waktu kedatangan harus berupa tanggal yang valid',
        'any.invalid': 'Waktu kedatangan tidak boleh sama dengan waktu keberangkatan',
        'date.greater': 'Waktu kedatangan harus lebih besar dari waktu keberangkatan'
        
    }),
    estimatedDuration: joi.number().required().messages({
        'any.required': 'Durasi perkiraan diperlukan',
        'number.base': 'Durasi perkiraan harus berupa angka'
    }),
    seatClass: joi.string().required().messages({
        'any.required': 'Kelas kursi diperlukan',
        'string.base': 'Kelas kursi harus berupa string'
    }),
    seatCapacity: joi.number().required().messages({
        'any.required': 'Kapasitas kursi diperlukan',
        'number.base': 'Kapasitas kursi harus berupa angka'
    }),
    facility: joi.string().messages({
        'string.base': 'Fasilitas harus berupa string'
    }),
    price: joi.number().required().messages({
        'any.required': 'Harga diperlukan',
        'number.base': 'Harga harus berupa angka'
    }),
    groupId: joi.number().allow(null).messages({
        'number.base': 'ID grup harus berupa angka'
    })
});