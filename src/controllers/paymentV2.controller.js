import * as response from "../utils/response.js";
import * as paymentService from "../services/paymentV2.service.js";
import * as PaymentValidation from "../validations/payment.validation.js";
import { Error400, Error404 } from "../utils/customError.js";

export const createPayment = async (req, res, next) => {
    try {
const { error, value } = PaymentValidation.createPaymentSchema.validate(req.body);

        if (error) {
            return response.res400(`${error.details[0].message}`, res);
        }

        const result = await paymentService.createPayment(value.bookingId, value.bank);
       

        return response.res200(result.message, { paymentUrl: result }, res);
    } catch (error) {
        next(error);
    }
};


export const cancelPayment = async (req, res, next) => {
    try {
const { error, value } = PaymentValidation.cancelPaymentSchema.validate(req.params);

        if (error) {
            throw new Error400(error.message);
        };

        const { transactionId } = value;

        const cancelResponse = await paymentService.cancelPayment(transactionId);

        if (!cancelResponse) {
            throw new Error404('Pembayaran tidak ditemukan');
        }

        response.res200('Berhasil membatalkan pembayaran', cancelResponse, res);
    } catch (error) {
        next(error);
    }




    //     const { transactionId } = req.params;
    //     const cancelResponse = await paymentService.cancelPayment(transactionId);
    //     res.status(200).json({ message: "Payment canceled successfully", cancelResponse });
    // } catch (error) {
    //     res.status(500).json({ error: error.message });
    // }
};

export const checkPaymentStatus = async (req, res, next) => {
    try {
        // console.log(req.params);
        const { error, value } = PaymentValidation.checkPaymentStatusSchema.validate(req.params);

        if (error) {
            throw new Error400(error.message);
        };

        const { transactionId } = value;
     
        const statusResponse = await paymentService.checkPaymentStatus(transactionId);

        if (!statusResponse) {
            throw new Error404('Status pembayaran tidak ditemukan');
        }

        response.res200('Berhasil mengambil status pembayaran', statusResponse, res);
    } catch (error) {
        next(error);
    }

    //     const { transactionId } = req.params;
    //     const statusResponse = await paymentService.checkPaymentStatus(transactionId);
    //     res.status(200).json({ message: "Payment status retrieved", status: statusResponse });
    // } catch (error) {
    //     res.status(500).json({ error: error.message });
    // }
};

export const createGoPayPayment = async (req, res) => {
    try {
const { error, value } = PaymentValidation.createGoPayPaymentSchema.validate(req.body);

        if (error) {
            return response.res400(`${error.details[0].message}`, res);
        }

        const result = await paymentService.createGoPayPayment(value.bookingId);

        return response.res200(result.message, { paymentUrl: result }, res);
    } catch (error) {
        next(error);
    }
};

export const createCreditCardPayment = async (req, res, next) => {
    try {
 // Validasi request body
 const { error, value } = PaymentValidation.createCreditCardPaymentSchema.validate(req.body);

 if (error) {
     return res.status(400).json({ error: error.details[0].message });
 }

 // Siapkan payload untuk token kartu
 const payload = {
     card_number: value.card_number,
     card_exp_month: value.card_exp_month,
     card_exp_year: value.card_exp_year,
     card_cvv: value.card_cvv,
 };

 // Buat token pembayaran kartu
 const paymentToken = await paymentService.createCardToken(payload);

 // Lakukan pembayaran dengan token yang sudah dibuat
 const creditCardPayment = await paymentService.createCardPayment(value.bookingId, paymentToken);

 // Kirim respons sukses
 res.status(201).json({ 
     message: "Payment created successfully", 
     paymentDetails: creditCardPayment 
 });
} catch (err) {
 // Tangani error dan kirim respons gagal
 res.status(500).json({ error: err.message });
}
};


