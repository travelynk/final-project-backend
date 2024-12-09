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
    departureTerminalId: joi.number().required().messages({
        'any.required': 'ID terminal keberangkatan diperlukan',
        'number.base': 'ID terminal keberangkatan harus berupa angka'
    }),
    arrivalTerminalId: joi.number().invalid(joi.ref('departureAirportId')).required().messages({
        'any.required': 'ID terminal kedatangan diperlukan',
        'number.base': 'ID terminal kedatangan harus berupa angka',
        'any.invalid': 'ID terminal kedatangan tidak boleh sama dengan ID terminal keberangkatan'
    }),
    departureTime: joi.date().required().min('now').messages({
        'any.required': 'Waktu keberangkatan diperlukan',
        'date.base': 'Waktu keberangkatan harus berupa tanggal yang valid',
        'date.min': 'Waktu keberangkatan tidak boleh kurang dari hari ini'
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

export const querySchema = joi.object({
    rf: joi.string()
        .pattern(new RegExp('^[A-Z]{3}\\.[A-Z]{3}$'))
        .required()
        .messages({
            'string.pattern.base': 'Rute tidak valid! Harus berupa tiga huruf kapital yang dipisahkan oleh titik, contoh: CGK.DPS',
            'any.required': 'Rute diperlukan!'
        })
        .custom((value, helpers) => {
            const route = value.split('.');
            if (route.length !== 2) {
                return helpers.message('Rute tidak valid! Harus terdiri dari dua lokasi');
            }

            if (route[0] === route[1]) {
                return helpers.message('Rute tidak valid! terminal keberangkatan dan kedatangan tidak boleh sama');
            }

            return value;
        }),

    dt: joi.string()
        .pattern(new RegExp('^(\\d{4}-\\d{2}-\\d{2})(\\.\\d{4}-\\d{2}-\\d{2})?$'))
        .required()
        .messages({
            'string.pattern.base': 'Jadwal tidak valid! Harus berupa tanggal dengan format YYYY-MM-DD',
            'any.required': 'Jadwal diperlukan!'
        })
        .custom((value, helpers) => {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            const schedule = value.split('.');
            const dateObjects = schedule.map((date) => new Date(date));

            if (schedule.length > 2 || schedule.length <= 0) {
                return helpers.message('Jadwal tidak valid!');
            }

            if (dateObjects.some((date) => date <= today || isNaN(date))) {
                return helpers.message('Semua tanggal harus lebih besar dari hari ini!');
            }

            if (schedule.length === 2) {
                const [startDate, endDate] = dateObjects;
                if (startDate > endDate) {
                    return helpers.message('Jadwal tidak valid! Tanggal berangkat tidak boleh sama atau lebih besar dari tanggal kembali');
                }
            }

            return value;
        }),

    ps: joi.string()
        .pattern(new RegExp('^\\d+\\.\\d+\\.\\d+$'))
        .required()
        .messages({
            'string.pattern.base': 'Jumlah penumpang tidak valid! Harus terdiri dari tiga angka yang dipisahkan oleh titik, contoh: 1.0.0',
            'any.required': 'Jumlah penumpang diperlukan!'
        })
        .custom((value, helpers) => {
            const passengers = value.split('.');
            if (passengers.some((p) => isNaN(p))) {
                return helpers.message('Jumlah penumpang tidak valid! Harus berupa angka.');
            }
            if (passengers.length !== 3) {
                return helpers.message('Jumlah penumpang tidak valid! Harus terdiri dari 3 angka.');
            }

            return value;
        }),

    sc: joi.string()
        .required()
        .valid("Economy", "Premium Economy", "Business", "First Class")
        .messages({
            'any.required': 'Seat class wajib diisi!',
            'any.only': 'Seat class harus diisi dengan salah satu dari: Economy, Premium Economy, Business, First Class'
        }),

});