import { coreApi, snap } from "../configs/midtransClient.js";

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

    return chargeResponse;
};

export const cancelPayment = async (transactionId) => {
    try {

               // Periksa status transaksi
               const transactionStatus = await snap.transaction.status(transactionId);

               // Periksa apakah status transaksi memungkinkan pembatalan
               if (transactionStatus.transaction_status !== 'pending') {
                   throw new Error(
                       `Transaction cannot be cancelled. Current status: ${transactionStatus.transaction_status}.`
                   );
               }
       
               // Batalkan transaksi jika statusnya pending
               const cancelResponse = await snap.transaction.cancel(transactionId);
       
               // Perbarui status di database
               await prisma.payment.update({
                   where: { transactionId },
                   data: { status: 'Expired' }, // Gunakan 'Expired' untuk menandai pembatalan
               });
       
               return cancelResponse;
           } catch (error) {
               console.error('Error cancelling payment:', error.response?.data || error.message);
               throw new Error(error.response?.data?.status_message || error.message);
           }

    // if (cancelResponse.status_code !== "200")
    //     throw new Error("Failed to cancel payment");

    // await prisma.payment.update({
    //     where: { transactionId },
    //     data: { status: "Cancelled" },
    // });

    // return cancelResponse;
};

export const checkPaymentStatus = async (transactionId) => {
    try {
        // Ambil status transaksi dari Midtrans
        const transactionStatus = await snap.transaction.status(transactionId);

        // console.log(transactionStatus);

        // Ubah status ke format Prisma

        const status = transactionStatus.transaction_status;
        const statusFormatted = status.charAt(0).toUpperCase() + status.slice(1);

        // console.log(statusFormatted);
        // console.log(transactionId);

        await prisma.payment.update({
            where: { transactionId },
            data: { status: statusFormatted },
        });

        return transactionStatus;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const createGoPayPayment = async (bookingId) => {
    // Cari booking dari database
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payments: true, user: { include: { profile: true } } },
    });

    if (!booking) throw new Error("Booking not found");

    // Data pembayaran untuk GoPay
    const paymentData = {
        // payment_type: "gopay",
        // transaction_details: {
        //     order_id: `BOOKING-${bookingId}-${Date.now()}`,
        //     gross_amount: booking.totalPrice,
        // },
        // customer_details: {
        //     email: booking.user.email,
        //     first_name: booking.user.profile.fullName,
        // },
        // item_details: [
        //     {
        //         id: `BOOKING-${bookingId}`,
        //         name: `Flight Booking ${bookingId}`,
        //         price: booking.totalPrice,
        //         quantity: 1,
        //     },
        // ],
        // gopay: {
        //     enable_callback: true, // Enable callback untuk GoPay
        //     callback_url: "https://your-callback-url.com", // Ganti dengan URL callback Anda
        // },

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
            //   last_name: "Utomo",
            email: booking.user.email,
            //   phone: "081223323423",
        },
    };

    // Membuat pembayaran dengan GoPay
    const chargeResponse = await coreApi.charge(paymentData);

    // Simpan transaksi pembayaran ke database
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

    return chargeResponse;
};

export const createCardToken = async (payload) => {
    // coreApi.cardToken = will return token
    const cardResponse = await coreApi.cardToken({
        card_number: payload.card_number,
        card_exp_month: payload.card_exp_month,
        card_exp_year: payload.card_exp_year,
        card_cvv: payload.card_cvv,
        client_key: process.env.MIDTRANS_CLIENT_KEY,
    });
    const cardToken = cardResponse.token_id;
    return cardToken;
};

export const createCardPayment = async (bookingId, cardToken) => {

    // Cari booking dari database
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payments: true, user: { include: { profile: true } } },
    });

    if (!booking) throw new Error("Booking not found");


    const paymentData = {
        payment_type: "credit_card",
        transaction_details: {
            gross_amount: booking.totalPrice,
            order_id: `BOOKING-${bookingId}-${Date.now()}`,
        },
        credit_card: {
            token_id: cardToken, // card token taruh di sini
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
            status: "Pending", // Harus sesuai dengan enum PaymentStatus
            amount: parseFloat(chargeResponse.gross_amount),
        },
    });

    return chargeResponse;
};
