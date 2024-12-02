import { snap } from "../configs/midtransClient.js"; // Pastikan path sesuai dengan struktur folder

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

