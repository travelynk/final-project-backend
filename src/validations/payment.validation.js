import Joi from "joi";

// Schema untuk createPayment
export const createPaymentSchema = Joi.object({
    bookingId: Joi.number().integer().required().messages({
        "number.base": "Booking ID harus berupa angka.",
        "number.integer": "Booking ID harus berupa bilangan bulat.",
        "any.required": "Booking ID wajib diisi.",
    }),
    bank: Joi.string().valid("bca", "bni", "bri", "mandiri", "permata").required().messages({
        "string.base": "Bank harus berupa teks.",
        "any.only": "Bank hanya bisa salah satu dari: bca, bni, bri, mandiri, permata.",
        "any.required": "Bank wajib diisi.",
    }),
});

// Schema untuk cancelPayment
export const cancelPaymentSchema = Joi.object({
    transactionId: Joi.string().min(3).required().messages({
        "string.base": "Transaction ID harus berupa teks.",
        "any.required": "Transaction ID wajib diisi.",
        "string.min": "Transaction ID minimal 3.",
    }),
});

// Schema untuk checkPaymentStatus
export const checkPaymentStatusSchema = Joi.object({
    transactionId: Joi.string().min(3).required().messages({
        "string.base": "Transaction ID harus berupa teks.",
        "any.required": "Transaction ID wajib diisi.",
        "string.min": "Transaction ID minimal 3.",
    }),
});

// Schema untuk createGoPayPayment
export const createGoPayPaymentSchema = Joi.object({
    bookingId: Joi.number().integer().required().messages({
        "number.base": "Booking ID harus berupa angka.",
        "number.integer": "Booking ID harus berupa bilangan bulat.",
        "any.required": "Booking ID wajib diisi.",
    }),
});

// Schema untuk createCreditCardPayment
export const createCreditCardPaymentSchema = Joi.object({
    bookingId: Joi.number().integer().required().messages({
        "number.base": "Booking ID harus berupa angka.",
        "number.integer": "Booking ID harus berupa bilangan bulat.",
        "any.required": "Booking ID wajib diisi.",
    }),
    card_number: Joi.string().min(13).required().messages({
        "string.creditCard": "Card number tidak valid.",
        "any.required": "Card number wajib diisi.",
        "string.min": "Transaction ID minimal 13.",
    }),
    card_exp_month: Joi.string().max(2)
        .regex(/^(0[1-9]|1[0-2])$/)
        .required()
        .messages({
            "string.pattern.base": "Bulan kedaluwarsa kartu harus dalam format MM (01-12).",
            "any.required": "Bulan kedaluwarsa kartu wajib diisi.",
            "string.max": "card exp month maksimal 2 nomor.",
        }),
    card_exp_year: Joi.string().max(4)
        .regex(/^\d{4}$/)
        .required()
        .messages({
            "string.pattern.base": "Tahun kedaluwarsa kartu harus berupa 4 digit.",
            "any.required": "Tahun kedaluwarsa kartu wajib diisi.",
            "string.max": "card exp year maksimal 4 nomor.",
        }),
    card_cvv: Joi.string().max(3)
        .required()
        .messages({
            "string.pattern.base": "CVV harus berupa 3-4 digit.",
            "any.required": "CVV wajib diisi.",
            "string.max": "card CVV maksimal 3 nomor.",
        }),
});
