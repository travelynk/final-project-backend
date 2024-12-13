export const sendOtpEmail = (otp) => `
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
        .otp-code {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            background-color: #f0f0f0;
            border: 1px dashed #FFA500;
            padding: 10px;
            margin: 20px 0;
            display: inline-block;
            color: #FFA500;
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
            <h1 class="email-title">Travelynk</h1>
        </div>
        <div class="email-content">
            <p>Halo,</p>
            <p>Terima kasih telah mendaftar di Travelynk. Berikut adalah kode OTP Anda untuk verifikasi:</p>
            <div class="otp-code">${otp}</div>
            <p>Harap masukkan kode ini di aplikasi kami untuk melanjutkan proses verifikasi.</p>
            <p>Kode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun untuk menjaga keamanan akun Anda.</p>
        </div>
        <div class="email-footer">
            <p>Terima kasih telah menggunakan layanan kami!</p>
            <p>Jika Anda memiliki pertanyaan, silakan hubungi layanan pelanggan kami.</p>
        </div>
    </div>
</body>
</html>
`;
