import { coreApi, snap } from "../configs/midtransClient.js";
import prisma from "../configs/database.js";
import nodemailer from "nodemailer";
import { generateQrPng } from '../utils/qrcode.js';
import { imagekit } from '../utils/imagekit.js';
import { encodeBookingCode } from '../utils/hashids.js';
import jwt from 'jsonwebtoken';

import { vaNumberPaymentEmail } from "../views/send.email.payment.js";
import { gopayPaymentEmail } from "../views/send.email.payment.js";
import { cardPaymentEmail } from "../views/send.email.payment.js";
import { cancelPaymentEmail } from "../views/send.email.payment.js";
import { paymentStatusEmail } from "../views/send.email.payment.js";

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

    const virtualAccount = chargeResponse.va_numbers[0]?.va_number || "N/A"; // Ambil VA Number dari response
    const expiredDate = chargeResponse.transaction_time ?
        new Date(new Date(chargeResponse.transaction_time).getTime() + 24 * 60 * 60 * 1000).toLocaleString() :
        "N/A"; // Tambahkan expired date (24 jam setelah transaksi dibuat)

    // Generate QR Code setelah pembayaran sukses
    const updatedBooking = await generateQrcode(bookingId);


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
        "Menunggu Pembayaran",
        vaNumberPaymentEmail(bank, booking.totalPrice, chargeResponse.order_id, virtualAccount, expiredDate, updatedBooking.urlQrcode)
    );

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
        cancelPaymentEmail(transactionId)
    );

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
    // const statusFormatted = transactionStatus.transaction_status.charAt(0).toUpperCase() +
    //     transactionStatus.transaction_status.slice(1);

    let statusFormatted;
    switch (transactionStatus.transaction_status) {
        case "pending":
            statusFormatted = "Pending";
            break;
        case "settlement":
            statusFormatted = "Settlement";
            break;
        case "cancel":
            statusFormatted = "Cancelled";
            break;
        case "expire":
            statusFormatted = "Expired";
            break;
        default:
            statusFormatted = "Unknown"; // Default jika status tidak dikenali
    }

    await prisma.payment.update({
        where: { transactionId },
        data: { status: statusFormatted },
    });

    // Kirim email dengan status pembayaran
    await sendPaymentEmail(
        currentPayment.booking.user.email,
        "Status Pembayaran Diperbarui",
        paymentStatusEmail(transactionId, statusFormatted)
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
        gopayPaymentEmail(booking.totalPrice, chargeResponse.order_id, expiredDate, gopayDeepLink, gopayQrCodeUrl, infoQrCodeUrl)
    );


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
    const updatedBooking = await generateQrcode(bookingId);


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
        "Pembayaran Kartu Kredit Berhasil Dibuat",
        cardPaymentEmail(
            booking.totalPrice,
            chargeResponse.order_id,
            chargeResponse.transaction_status,
            updatedBooking.urlQrcode
        )
    );

    return chargeResponse;
};


// Fungsi untuk mengirim email notifikasi pembayaran
export const sendPaymentEmail = async (email, subject, htmlContent) => {
    // Konfigurasi transporter nodemailer
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // Gunakan SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Data email
    const mailData = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: htmlContent,
    };

    // Kirim email
    const info = await transporter.sendMail(mailData);

    return { messageId: info.messageId };
};


export const generateQrcode = async (id) => {
    const code = await encodeBookingCode(id);
    const resetToken = jwt.sign({ code }, process.env.JWT_SECRET_FORGET);
    const url = `${process.env.DOMAIN_URL}/api/v1/bookings/ticket?token=${resetToken}`;

    const qr = await generateQrPng(url);

    const qrCode = await imagekit.upload({
        fileName: "testing",
        file: qr.toString('base64')
    });

    const updatedBooking = await prisma.booking.update({
        where: {
            id: parseInt(id),
        },
        data: { urlQrcode: qrCode.url },
    });

    return updatedBooking
}