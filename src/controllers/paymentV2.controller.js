import * as paymentService from "../services/paymentV2.service.js";

export const createPayment = async (req, res) => {
    try {
        const { bookingId, bank } = req.body;
        const paymentUrl = await paymentService.createPayment(bookingId, bank);
        res.status(201).json({ message: "Payment created successfully", paymentUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const cancelPayment = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const cancelResponse = await paymentService.cancelPayment(transactionId);
        res.status(200).json({ message: "Payment canceled successfully", cancelResponse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const checkPaymentStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const statusResponse = await paymentService.checkPaymentStatus(transactionId);
        res.status(200).json({ message: "Payment status retrieved", status: statusResponse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createGoPayPayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        
        // Panggil service untuk membuat pembayaran GoPay
        const paymentResponse = await paymentService.createGoPayPayment(bookingId);
        
        res.status(201).json({ message: "Payment created successfully", paymentResponse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createCreditCardPayment = async (req, res) => {
    try {
        const { bookingId, card_number, card_exp_month, card_exp_year, card_cvv } = req.body;
        
        const payload = {
            card_number: card_number,
            card_exp_month: card_exp_month,
            card_exp_year: card_exp_year,
            card_cvv: card_cvv,

        };
        const paymentToken = await paymentService.createCardToken(payload);

        const creditCardPayment = await paymentService.createCardPayment(bookingId, paymentToken);
        res.status(201).json({ message: "Payment created successfully", creditCardPayment });
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}