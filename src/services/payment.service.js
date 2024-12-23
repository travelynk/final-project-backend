import { coreApi, snap } from "../configs/midtransClient.js";
import prisma from "../configs/database.js";
import { createNotification } from "../services/notification.service.js";
import * as FormatEmail from "../utils/formatPaymentEmail.js";
import { sendPaymentEmail } from '../utils/sendPaymentEmail.js';
import { generateQrCode } from '../utils/generateQrcode.js';

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

    const expiredDate = chargeResponse.transaction_time ?
        new Date(new Date(chargeResponse.transaction_time).getTime() + 24 * 60 * 60 * 1000).toLocaleString() :
        "N/A"; // Tambahkan expired date (24 jam setelah transaksi dibuat)

    // Generate QR Code setelah pembayaran sukses
    const qrCodeUrl = await generateQrCode(bookingId);

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

    // // Kirim email setelah pembayaran berhasil
    await sendPaymentEmail(
        booking.user.email,
        "Menunggu Pembayaran",
        FormatEmail.vaNumberPaymentEmail(bank, booking.totalPrice, chargeResponse.order_id, chargeResponse.va_numbers[0]?.va_number || "N/A", expiredDate, qrCodeUrl)
    );

    // Tambahkan notifikasi menggunakan createNotification dari notification.service.js
    const message = `Pembayaran Anda untuk pemesanan dengan reference number ${chargeResponse.order_id} telah diterima dan menunggu konfirmasi. Silakan lakukan pembayaran sebelum ${expiredDate}.`;
    await createNotification(booking.userId, "Payment", "Menunggu Pembayaran", message);

    return chargeResponse;
};

export const cancelPayment = async (transactionId) => {
    const currentPayment = await prisma.payment.findUnique({
        where: { transactionId },
        include: { booking: { include: { user: true } } },
    });

    if (!currentPayment) {
        throw new Error("Pembayaran tidak ditemukan");
    }

    const transactionStatus = await snap.transaction.status(transactionId);

    if (transactionStatus.transaction_status === "cancel") {
        return {
            message: `Transaction with ID ${transactionId} is already cancelled.`,
            status: "Cancelled",
        };
    }

    if (transactionStatus.transaction_status !== "pending") {
        throw new Error(`Transaction cannot be cancelled. Current status: ${transactionStatus.transaction_status}.`);
    }

    const cancelResponse = await snap.transaction.cancel(transactionId);

    await prisma.payment.update({
        where: { transactionId },
        data: { status: "Cancelled" },
    });

    // Kirim email setelah pembayaran dibatalkan
    await sendPaymentEmail(
        currentPayment.booking.user.email,
        "Pembayaran Dibatalkan",
        FormatEmail.cancelPaymentEmail(transactionId)
    );

    const message = `Pembayaran untuk pemesanan dengan nomor transaksi ${transactionId} telah dibatalkan.`;
    await createNotification(currentPayment.booking.userId, "Payment", "Pembayaran Dibatalkan", message);


    return cancelResponse;
};

export const checkPaymentStatus = async (transactionId) => {
    const currentPayment = await prisma.payment.findUnique({
        where: { transactionId },
        include: { booking: { include: { user: true } } },
    });

    if (!currentPayment) {
        throw new Error("Pembayaran tidak ditemukan");
    }

    const transactionStatus = await snap.transaction.status(transactionId);

    let statusFormatted;
    let message;
    if (transactionStatus.transaction_status === "pending") {
        statusFormatted = "Pending";
        message = `Pembayaran Anda untuk pemesanan dengan nomor transaksi ${transactionId} sedang menunggu pembayaran.`;
    } else if (["settlement", "capture"].includes(transactionStatus.transaction_status)) {
        statusFormatted = "Settlement";
        message = `Pembayaran Anda untuk pemesanan dengan nomor transaksi ${transactionId} telah berhasil.`;

        // Update status booking menjadi Issued jika pembayaran berhasil
        await prisma.booking.update({
            where: { id: currentPayment.booking.id },
            data: { status: "Issued" },
        });
        await createNotification(currentPayment.booking.userId, "Payment", "Status Pembayaran Diperbarui", message);
    } else if (transactionStatus.transaction_status === "cancel") {
        statusFormatted = "Cancelled";
        message = `Pembayaran Anda untuk pemesanan dengan nomor transaksi ${transactionId} dibatalkan.`;

        // Update status booking menjadi Cancelled jika pembayaran dibatalkan
        await prisma.booking.update({
            where: { id: currentPayment.booking.id },
            data: { status: "Cancelled" },
        });
    } else if (transactionStatus.transaction_status === "expire") {
        statusFormatted = "Expired";
        message = `Pembayaran Anda untuk pemesanan dengan nomor transaksi ${transactionId} telah kedaluwarsa.`;
    } else {
        throw new Error("Transaction status tidak dikenali");
    }

    await prisma.payment.update({
        where: { transactionId },
        data: { status: statusFormatted },
    });

    // Kirim email dengan status pembayaran
    await sendPaymentEmail(
        currentPayment.booking.user.email,
        "Status Pembayaran Diperbarui",
        FormatEmail.paymentStatusEmail(transactionId, statusFormatted)
    );

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

    const gopayDeepLink = chargeResponse.actions.find(
        (action) => action.name === "deeplink-redirect"
    )?.url || "N/A"; // URL deep link untuk redirect pembayaran

    const expiredDate = chargeResponse.transaction_time
        ? new Date(
            new Date(chargeResponse.transaction_time).getTime() + 24 * 60 * 60 * 1000
        ).toLocaleString()
        : "N/A"; // Expired Date (24 jam setelah transaksi dibuat)

    // URL untuk generasi QR Code
    const gopayQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        gopayDeepLink
    )}&size=200x200`;

    // Generate QR Code tambahan untuk informasi pemesanan
    const infoQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        `https://yourapp.com/booking/${bookingId}`
    )}&size=200x200`;


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

    // Kirim email setelah pembayaran berhasil
    await sendPaymentEmail(
        booking.user.email,
        "Menunggu Pembayaran GoPay",
        FormatEmail.gopayPaymentEmail(booking.totalPrice, chargeResponse.order_id, expiredDate, gopayDeepLink, gopayQrCodeUrl, infoQrCodeUrl)
    );

    const message = `Pembayaran Anda untuk pemesanan dengan reference number ${chargeResponse.order_id} telah diterima dan menunggu konfirmasi. Silakan lakukan pembayaran melalui GoPay sebelum ${expiredDate}.`;
    await createNotification(booking.userId, "Payment", "Menunggu Pembayaran GoPay", message);

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

    // Generate QR Code
    // const updatedBooking = await generateQrCode(bookingId);
    const qrCodeUrl = await generateQrCode(bookingId);

    // Buat pembayaran di database
    const payment = await prisma.payment.create({
        data: {
            bookingId: bookingId,
            transactionId: chargeResponse.transaction_id,
            reference_number: chargeResponse.order_id,
            total: parseFloat(chargeResponse.gross_amount),
            method: chargeResponse.payment_type,
            status: "Pending", // Status awal pembayaran
            amount: parseFloat(chargeResponse.gross_amount),
        },
    });

    // Update status booking dan pembayaran jika berhasil
    if (chargeResponse.transaction_status === "capture") {
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: "Issued" },
        });

        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "Settlement" },
        });
    }

    // // Kirim email setelah pembayaran berhasil dibuat
    const emailContent = FormatEmail.cardPaymentEmail(
        booking.totalPrice,
        chargeResponse.order_id,
        chargeResponse.transaction_status,
        qrCodeUrl
    );

    await sendPaymentEmail(
        booking.user.email,
        "Pembayaran Kartu Kredit Berhasil Dibuat",
        emailContent
    );

    const message = `Pembayaran Anda untuk pemesanan dengan nomor booking ${bookingId} telah berhasil.`;
    await createNotification(booking.userId, "Payment", "Pembayaran Berhasil", message);

    return chargeResponse;
};
