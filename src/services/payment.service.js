import { coreApi, snap } from "../configs/midtransClient.js";
import prisma from "../configs/database.js";

export const createDebitPayment = async (bookingId, bank) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payments: true, user: { include: { profile: true } } },
    });

    if (!booking) throw new Error("Pemesanan tidak ditemukan");

    const paymentData = {
        payment_type: "bank_transfer",
        transaction_details: {
            order_id: `BOOKING-${bookingId}-${Date.now()}`,
            gross_amount: booking.totalPrice,
        },
        customer_details: {
            email: booking.user.email,
            first_name: booking.user.profile.fullName,
        },
        item_details: [
            {
                id: `BOOKING-${bookingId}`,
                name: `Flight Booking ${bookingId}`,
                price: booking.totalPrice,
                quantity: 1,
            },
        ],
        bank_transfer: { bank },
    };

    const chargeResponse = await coreApi.charge(paymentData);

    await prisma.payment.create({
        data: {
            bookingId: bookingId,
            transactionId: chargeResponse.transaction_id,
            reference_number: chargeResponse.order_id,
            total: parseFloat(chargeResponse.gross_amount),
            method: chargeResponse.payment_type,
            status: "Pending",
            amount: parseFloat(chargeResponse.gross_amount),
        },
    });

    return chargeResponse;
};

export const cancelPayment = async (transactionId) => {
    const currentPayment = await prisma.payment.findUnique({
        where: { transactionId },
    });

    if (!currentPayment) {
        throw new Error("Pembayaran tidak ditemukan");
    }

    const transactionStatus = await snap.transaction.status(transactionId);

    if (transactionStatus.transaction_status !== "pending") {
        throw new Error(`Transaction cannot be cancelled. Current status: ${transactionStatus.transaction_status}.`);
    }

    const cancelResponse = await snap.transaction.cancel(transactionId);

    await prisma.payment.update({
        where: { transactionId },
        data: { status: "Cancelled" },
    });

    return cancelResponse;
};

export const checkPaymentStatus = async (transactionId) => {
    const currentPayment = await prisma.payment.findUnique({
        where: { transactionId },
    });

    if (!currentPayment) {
        throw new Error("Pembayaran tidak ditemukan");
    }

    const transactionStatus = await snap.transaction.status(transactionId);
    const statusFormatted = transactionStatus.transaction_status.charAt(0).toUpperCase() +
        transactionStatus.transaction_status.slice(1);

    await prisma.payment.update({
        where: { transactionId },
        data: { status: statusFormatted },
    });

    return transactionStatus;
};

export const createGoPayPayment = async (bookingId) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payments: true, user: { include: { profile: true } } },
    });
  
    if (!booking) throw new Error("Pemesanan tidak ditemukan");

    const paymentData = {
        payment_type: "gopay",
        transaction_details: {
            order_id: `BOOKING-${bookingId}-${Date.now()}`,
            gross_amount: booking.totalPrice,
        },
        item_details: [
            {
                id: `BOOKING-${bookingId}`,
                name: `Flight Booking ${bookingId}`,
                price: booking.totalPrice,
                quantity: 1,
            },
        ],
        customer_details: {
            first_name: booking.user.profile.fullName,
            email: booking.user.email,
        },
    };

    const chargeResponse = await coreApi.charge(paymentData);

    await prisma.payment.create({
        data: {
            bookingId: bookingId,
            transactionId: chargeResponse.transaction_id,
            reference_number: chargeResponse.order_id,
            total: parseFloat(chargeResponse.gross_amount),
            method: chargeResponse.payment_type,
            status: "Pending",
            amount: parseFloat(chargeResponse.gross_amount),
        },
    });

    return chargeResponse;
};

export const createCardToken = async (payload) => {
    const cardResponse = await coreApi.cardToken({
        card_number: payload.card_number,
        card_exp_month: payload.card_exp_month,
        card_exp_year: payload.card_exp_year,
        card_cvv: payload.card_cvv,
        client_key: process.env.MIDTRANS_CLIENT_KEY,
    });

    return cardResponse.token_id;
};

export const createCardPayment = async (bookingId, cardToken) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payments: true, user: { include: { profile: true } } },
    });

    if (!booking) throw new Error("Pemesanan tidak ditemukan");

    const paymentData = {
        payment_type: "credit_card",
        transaction_details: {
            gross_amount: booking.totalPrice,
            order_id: `BOOKING-${bookingId}-${Date.now()}`,
        },
        credit_card: {
            token_id: cardToken,
            authentication: false,
        },
    };

    const chargeResponse = await coreApi.charge(paymentData);

    await prisma.payment.create({
        data: {
            bookingId: bookingId,
            transactionId: chargeResponse.transaction_id,
            reference_number: chargeResponse.order_id,
            total: parseFloat(chargeResponse.gross_amount),
            method: chargeResponse.payment_type,
            status: "Pending",
            amount: parseFloat(chargeResponse.gross_amount),
        },
    });

    return chargeResponse;
};
