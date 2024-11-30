import { coreApi } from "../configs/midtransClient.js";
import prisma from "../configs/database.js";

export const createPayment = async (bookingId, bank) => {
    // Cari booking dari database
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payments: true, user: { include: { profile: true } } },
    });

    if (!booking) throw new Error("Booking not found");

    const paymentData = {
        payment_type: "bank_transfer", // Default payment type
        transaction_details: {
            // order_id: `BOOKING-${bookingId}`,
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
        bank_transfer: { bank }, // Bank spesifik
    };

    const chargeResponse = await coreApi.charge(paymentData);

    await prisma.payment.create({
        data: {
            bookingId: bookingId,
            transactionId: chargeResponse.transaction_id,
            reference_number: chargeResponse.order_id,
            total: parseFloat(chargeResponse.gross_amount),
            method: chargeResponse.payment_type,
            status: "Pending", // Harus sesuai dengan enum PaymentStatus
            amount: parseFloat(chargeResponse.gross_amount),
        },
    });
    

    return chargeResponse.redirect_url;
};

export const cancelPayment = async (transactionId) => {
    const cancelResponse = await coreApi.cancel(transactionId);

    if (cancelResponse.status_code !== "200") throw new Error("Failed to cancel payment");

    await prisma.payment.update({
        where: { transactionId },
        data: { status: "Cancelled" },
    });

    return cancelResponse;
};

export const checkPaymentStatus = async (transactionId) => {
    const statusResponse = await coreApi.transaction.status(transactionId);
    const paymentStatus = statusResponse.transaction_status;

    await prisma.payment.update({
        where: { transactionId },
        data: { status: paymentStatus },
    });

    return statusResponse;
};
