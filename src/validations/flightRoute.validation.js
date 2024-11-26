import joi from 'joi';

export const payload = joi.object({
    airlineId: joi.number().required().messages({
        'any.required': 'ID maskapai wajib diisi',
        'number.base': 'ID maskapai harus berupa angka'
    }),
    departureAirportId: joi.number().required().messages({
        'any.required': 'ID bandara keberangkatan wajib diisi',
        'number.base': 'ID bandara keberangkatan harus berupa angka'
    }),
    arrivalAirportId: joi.number().invalid(joi.ref('departureAirportId')).required().messages({
        'any.required': 'ID bandara kedatangan wajib diisi',
        'number.base': 'ID bandara kedatangan harus berupa angka',
        'any.invalid': 'ID bandara kedatangan tidak boleh sama dengan ID bandara keberangkatan'
    }),
    departureTime: joi.string().required().messages({
        'any.required': 'Waktu keberangkatan wajib diisi',
        'string.base': 'Waktu keberangkatan harus berupa string'
    }),
    arrivalTime: joi.string().invalid(joi.ref('departureTime')).required().messages({
        'any.required': 'Waktu kedatangan wajib diisi',
        'string.base': 'Waktu kedatangan harus berupa string',
        'any.invalid': 'Waktu kedatangan tidak boleh sama dengan waktu keberangkatan'
    }),
    estimatedDuration: joi.number().required().messages({
        'any.required': 'Durasi estimasi wajib diisi',
        'number.base': 'Durasi estimasi harus berupa angka'
    }),
});