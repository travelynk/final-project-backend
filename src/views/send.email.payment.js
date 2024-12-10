export const vaNumberPaymentEmail = (bank, totalPrice, orderId, virtualAccount, expiredDate, qrCodeUrl) => `
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
            padding: 20px 0;
            border-radius: 5px 5px 0 0;
        }
        .email-title {
            font-size: 24px;
            margin: 0;
            font-weight: bold;
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
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1 class="email-title">Travelynk</h1>
        </div>
        <div class="email-content">
            <p>Pesanan Anda telah dibuat dengan detail berikut:</p>
            <p><strong>Bank:</strong> ${bank}</p>
            <p><strong>Total:</strong> Rp${totalPrice.toLocaleString()}</p>
            <p><strong>Reference Number:</strong> ${orderId}</p>
            <p><strong>Virtual Account Number:</strong> ${virtualAccount}</p>
            <p><strong>Expired Date:</strong> ${expiredDate}</p>
            <p>Silakan lakukan pembayaran sebelum tanggal jatuh tempo menggunakan Virtual Account yang disediakan.</p>
            <div class="qr-code">
                <p><strong>Atau scan QR Code di bawah ini untuk cetak tiket:</strong></p>
                <img src="${qrCodeUrl}" alt="QR Code" width="200" height="200" />
            </div>
        </div>
        <div class="email-footer">
            <p>Terima kasih telah memilih layanan kami!</p>
            <p>Jika Anda memiliki pertanyaan, silakan hubungi layanan pelanggan kami.</p>
        </div>
    </div>
</body>
</html>
`;


export const gopayPaymentEmail = (totalPrice, orderId, expiredDate, gopayDeepLink, gopayQrCodeUrl, infoQrCodeUrl) => `
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
            <h1>Travelynk</h1>
        </div>
        <div class="email-content">
            <p>Pesanan Anda telah dibuat dengan detail berikut:</p>
            <p><strong>Total:</strong> Rp${totalPrice.toLocaleString()}</p>
            <p><strong>Reference Number:</strong> ${orderId}</p>
            <p><strong>Expired Date:</strong> ${expiredDate}</p>
            <div class="qr-code">
                <p><strong>Scan QR Code atau klik tautan untuk membayar:</strong></p>
                <a href="${gopayDeepLink}" target="_blank">
                    <img src="${gopayQrCodeUrl}" alt="QR Code Gopay">
                </a>
                <p><strong>Atau gunakan QR Code ini untuk cetak tiket:</strong></p>
                <img src="${infoQrCodeUrl}" alt="QR Code Informasi Pemesanan" />
            </div>
        </div>
        <div class="email-footer">
            <p>Terima kasih telah memilih layanan kami!</p>
            <p>Jika Anda memiliki pertanyaan, silakan hubungi layanan pelanggan kami.</p>
        </div>
    </div>
</body>
</html>
`;

export const cardPaymentEmail = (totalPrice, orderId, transactionStatus, qrCodeUrl) => `
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
        .qr-code {
            text-align: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Travelynk</h1>
        </div>
        <div class="email-content">
            <p>Pesanan Anda telah berhasil diproses dengan detail berikut:</p>
            <p><strong>Total:</strong> Rp${totalPrice.toLocaleString()}</p>
            <p><strong>Reference Number:</strong> ${orderId}</p>
            <p><strong>Status:</strong> ${transactionStatus === "capture" ? "Sukses" : "Pending"}</p>
            <div class="qr-code">
                <p><strong>Scan QR Code di bawah untuk cetak tiket:</strong></p>
                <img src="${qrCodeUrl}" alt="QR Code" width="200" height="200" />
            </div>
            <p>Terima kasih telah menggunakan layanan kami. Anda akan menerima notifikasi jika ada pembaruan pada status pembayaran Anda.</p>
        </div>
        <div class="email-footer">
            <p>Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi layanan pelanggan kami.</p>
        </div>
    </div>
</body>
</html>
`;


export const cancelPaymentEmail = (transactionId) => `
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
            <h1>Travelynk</h1>
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
`;


export const paymentStatusEmail = (transactionId, statusFormatted) => `
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
            <h1>Travelynk</h1>
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
`;