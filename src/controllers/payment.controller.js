import * as response from "../utils/response.js";
import * as paymentService from "../services/payment.service.js";
import * as PaymentValidation from "../validations/payment.validation.js";
import { Error404 } from "../utils/customError.js";

export const createDebitPayment = async (req, res, next) => {
    try {
        const { error, value } = PaymentValidation.createPaymentSchema.validate(req.body);

        if (error) {
            return response.res400(`${error.details[0].message}`, res);
        }

        const result = await paymentService.createDebitPayment(value.bookingId, value.bank);
        return response.res200("Pembayaran berhasil dibuat", { paymentUrl: result }, res);
    } catch (error) {
        next(error);
    }
};

export const cancelPayment = async (req, res, next) => {
    try {
        const { error, value } = PaymentValidation.cancelPaymentSchema.validate(req.params);

        if (error) {
            return response.res400(`${error.details[0].message}`, res);
        }

        const { transactionId } = value;
        const cancelResponse = await paymentService.cancelPayment(transactionId);

        if (!cancelResponse) {
            throw new Error404("Pembayaran tidak ditemukan");
        }

        response.res200("Berhasil membatalkan pembayaran", cancelResponse, res);
    } catch (error) {
        next(error);
    }
};

export const checkPaymentStatus = async (req, res, next) => {
    try {
        const { error, value } = PaymentValidation.checkPaymentStatusSchema.validate(req.params);

        if (error) {
            return response.res400(`${error.details[0].message}`, res);
        }

        const { transactionId } = value;
        const statusResponse = await paymentService.checkPaymentStatus(transactionId);

        if (!statusResponse) {
            throw new Error404("Status pembayaran tidak ditemukan");
        }

        response.res200("Berhasil mengambil status pembayaran", statusResponse, res);
    } catch (error) {
        next(error);
    }
};

export const createGoPayPayment = async (req, res, next) => {
    try {
        const { error, value } = PaymentValidation.createGoPayPaymentSchema.validate(req.body);

        if (error) {
            return response.res400(`${error.details[0].message}`, res);
        }

        const result = await paymentService.createGoPayPayment(value.bookingId);
        return response.res200("Pembayaran berhasil dibuat", { paymentUrl: result }, res);
    } catch (error) {
        next(error);
    }
};

export const createCreditCardPayment = async (req, res, next) => {
    try {
        const { error, value } = PaymentValidation.createCreditCardPaymentSchema.validate(req.body);

        if (error) {
            return response.res400(`${error.details[0].message}`, res);
        }

        const payload = {
            card_number: value.card_number,
            card_exp_month: value.card_exp_month,
            card_exp_year: value.card_exp_year,
            card_cvv: value.card_cvv,
        };

        const paymentToken = await paymentService.createCardToken(payload);
        const creditCardPayment = await paymentService.createCardPayment(value.bookingId, paymentToken);

        return response.res200("Pembayaran berhasil dibuat", creditCardPayment, res);
    } catch (error) {
        next(error);
    }
};
