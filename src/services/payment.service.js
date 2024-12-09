import { coreApi, snap } from "../configs/midtransClient.js";
import prisma from "../configs/database.js";
import nodemailer from "nodemailer";

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
        `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                    padding: 20px;
                }
                .email-header {
                    text-align: center;
                    background-color: #FFA500;
                    color: white;
                    padding: 10px 0;
                    border-radius: 5px 5px 0 0;
                }
                .email-content {
                    padding: 20px;
                    color: #333333;
                }
                .email-content p {
                    margin: 10px 0;
                }
                .email-footer {
                    text-align: center;
                    font-size: 12px;
                    color: #888888;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>Menunggu Pembayaran</h1>
                </div>
                <div class="email-content">
                    <p>Pesanan Anda telah dibuat dengan detail berikut:</p>
                    <p><strong>Bank:</strong> ${bank}</p>
                    <p><strong>Total:</strong> Rp${booking.totalPrice.toLocaleString()}</p>
                    <p><strong>Reference Number:</strong> ${chargeResponse.order_id}</p>
                    <p><strong>Virtual Account Number:</strong> ${virtualAccount}</p>
                    <p><strong>Expired Date:</strong> ${expiredDate}</p>
                    <p>Silakan lakukan pembayaran sebelum tanggal jatuh tempo menggunakan Virtual Account yang disediakan.</p>
                </div>
                <div class="email-footer">
                    <p>Terima kasih telah memilih layanan kami!</p>
                    <p>Jika Anda memiliki pertanyaan, silakan hubungi layanan pelanggan kami.</p>
                </div>
            </div>
        </body>
        </html>
        `
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
        `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                    padding: 20px;
                }
                .email-header {
                    text-align: center;
                    background-color: #ff4d4d;
                    color: white;
                    padding: 10px 0;
                    border-radius: 5px 5px 0 0;
                }
                .email-content {
                    padding: 20px;
                    color: #333333;
                }
                .email-content p {
                    margin: 10px 0;
                }
                .email-footer {
                    text-align: center;
                    font-size: 12px;
                    color: #888888;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>Pembayaran Dibatalkan</h1>
                </div>
                <div class="email-content">
                    <p>Pembayaran Anda telah dibatalkan dengan detail berikut:</p>
                    <p><strong>Nomor Transaksi:</strong> ${transactionId}</p>
                    <p><strong>Status:</strong> Cancelled</p>
                    <p>Jika pembatalan ini tidak dilakukan oleh Anda, segera hubungi layanan pelanggan kami.</p>
                </div>
                <div class="email-footer">
                    <p>Terima kasih telah menggunakan layanan kami.</p>
                </div>
            </div>
        </body>
        </html>
        `
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
        `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                    padding: 20px;
                }
                .email-header {
                    text-align: center;
                    background-color: #007bff;
                    color: white;
                    padding: 10px 0;
                    border-radius: 5px 5px 0 0;
                }
                .email-content {
                    padding: 20px;
                    color: #333333;
                }
                .email-content p {
                    margin: 10px 0;
                }
                .email-footer {
                    text-align: center;
                    font-size: 12px;
                    color: #888888;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>Status Pembayaran Diperbarui</h1>
                </div>
                <div class="email-content">
                    <p>Berikut adalah status terbaru untuk pembayaran Anda:</p>
                    <p><strong>Nomor Transaksi:</strong> ${transactionId}</p>
                    <p><strong>Status:</strong> ${statusFormatted}</p>
                    <p>Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi layanan pelanggan kami.</p>
                </div>
                <div class="email-footer">
                    <p>Terima kasih telah menggunakan layanan kami.</p>
                </div>
            </div>
        </body>
        </html>
        `
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
        `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                    padding: 20px;
                }
                .email-header {
                    text-align: center;
                    background-color: #34a853;
                    color: white;
                    padding: 10px 0;
                    border-radius: 5px 5px 0 0;
                }
                .email-content {
                    padding: 20px;
                    color: #333333;
                }
                .email-content p {
                    margin: 10px 0;
                }
                .email-footer {
                    text-align: center;
                    font-size: 12px;
                    color: #888888;
                    margin-top: 20px;
                }
                .qr-code {
                    text-align: center;
                    margin: 20px 0;
                }
                .qr-code img {
                    max-width: 200px;
                    height: auto;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>Menunggu Pembayaran GoPay</h1>
                </div>
                <div class="email-content">
                    <p>Pesanan Anda telah dibuat dengan detail berikut:</p>
                    <p><strong>Total:</strong> Rp${booking.totalPrice.toLocaleString()}</p>
                    <p><strong>Reference Number:</strong> ${chargeResponse.order_id}</p>
                    <p><strong>Expired Date:</strong> ${expiredDate}</p>
                    <div class="qr-code">
                        <p><strong>Scan QR Code atau klik tautan untuk membayar:</strong></p>
                        ${gopayDeepLink !== "N/A"
            ? `<a href="${gopayDeepLink}" target="_blank"><img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                gopayDeepLink
            )}&size=200x200" alt="QR Code"></a>`
            : "<p>QR Code tidak tersedia.</p>"
        }
                    </div>
                    <p>Atau buka aplikasi GoPay Anda untuk menyelesaikan pembayaran.</p>
                </div>
                <div class="email-footer">
                    <p>Terima kasih telah memilih layanan kami!</p>
                    <p>Jika Anda memiliki pertanyaan, silakan hubungi layanan pelanggan kami.</p>
                </div>
            </div>
        </body>
        </html>
        `
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
        `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                    padding: 20px;
                }
                .email-header {
                    text-align: center;
                    background-color: #007bff;
                    color: white;
                    padding: 10px 0;
                    border-radius: 5px 5px 0 0;
                }
                .email-content {
                    padding: 20px;
                    color: #333333;
                }
                .email-content p {
                    margin: 10px 0;
                }
                .email-footer {
                    text-align: center;
                    font-size: 12px;
                    color: #888888;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>Pembayaran Kartu Kredit Berhasil</h1>
                </div>
                <div class="email-content">
                    <p>Pesanan Anda telah berhasil diproses dengan detail berikut:</p>
                    <p><strong>Total:</strong> Rp${booking.totalPrice.toLocaleString()}</p>
                    <p><strong>Reference Number:</strong> ${chargeResponse.order_id}</p>
                    <p><strong>Status:</strong> ${chargeResponse.transaction_status === "capture" ? "Sukses" : "Pending"}</p>
                    <p>Terima kasih telah menggunakan layanan kami. Anda akan menerima notifikasi jika ada pembaruan pada status pembayaran Anda.</p>
                </div>
                <div class="email-footer">
                    <p>Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi layanan pelanggan kami.</p>
                </div>
            </div>
        </body>
        </html>
        `
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

    console.log(mailData);

    // Kirim email
    const info = await transporter.sendMail(mailData);

    // console.log(`Payment email sent to ${email}, Message ID: ${info.messageId}`);

    return { messageId: info.messageId };
};