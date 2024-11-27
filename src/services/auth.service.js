import prisma from "../configs/database.js";
import { Error400, Error404, Error409 } from "../utils/customError.js";
import { generateOTP, generateSecret, verifyOTP } from "../utils/otp.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer"
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../configs/database.js';
import nodemailer from 'nodemailer';

export const login = async ({ email, password }) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return null; // Jika email tidak ditemukan.

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null; // Jika password tidak valid.

    // Verifikasi jika akun belum diverifikasi
    // if (!user.verified) {
    //     throw new Error("Account is not verified");
    // }

    // Membuat JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return { token, role: user.role };
};

export const register = async ({ email, password, fullName, phone, gender }) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role: 'buyer',
            verified: false,
            Profile: {
                create: {
                    fullName,
                    phone,
                    gender,
                },
            },
        },
        include: { Profile: true },
    });

    return user;
};


// Updated resetPassword to use the token for resetting password directly
// Reset password function, using token to update password
export const resetPassword = async (token, password) => {
    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_FORGET);
        const { email } = decoded;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("User not found");
        }

        // Hash new password and update password
        const hashedPassword = await bcrypt.hash(password.newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        return { message: "Password reset successfully" };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            // Lemparkan error TokenExpiredError untuk ditangani di controller
            throw error;
        }

        throw new Error('Invalid or expired token');
    }
};

// New function to send a reset password email
export const sendResetPasswordEmail = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("User not found");
    }

    // Generate token reset password (contoh sederhana)
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET_FORGET, { expiresIn: "1h" });
    const resetLink = `${process.env.DOMAIN_URL}/api/v1/auth/reset-password?token=${resetToken}`;
    console.log(resetLink);

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
        subject: "Reset Your Password",
        html: `
             <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #007bff; text-align: center;">Reset Password Request</h1>
            <p style="font-size: 16px;">Hello,</p>
            <p style="font-size: 16px;">You requested to reset your password. Please click the button below to proceed:</p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${resetLink}" style="display: inline-block; padding: 12px 25px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="font-size: 16px;">If you did not request this, please ignore this email or contact support if you have concerns.</p>
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 14px; color: #666; text-align: center;">This email was sent automatically. Please do not reply.</p>
        </div>
        `,
    };

    // Kirim email
    const info = await transporter.sendMail(mailData);

    console.log(`Reset password email sent to ${email}, Message ID: ${info.messageId}`);
    return { messageId: info.messageId };
    // return { message: "Reset password email sent successfully" };
};

export const verifyOtp = async (data) => {
    const { email, otp } = data;

    const user = await prisma.user.findUnique({
        where: { email: email },
    });

    if (!user) {
        throw new Error404("Pengguna tidak ditemukan. Pastikan informasi yang Anda masukkan sudah benar dan coba lagi.");
    };

    const isValid = verifyOTP(otp, user.otpSecret);

    if (!isValid) {
        throw new Error400("OTP yang dikirimkan sudah tidak valid atau telah kedaluwarsa.");
    };

    await prisma.user.update({
        where: { email },
        data: { verified: true },
    });

    return "OTP berhasil diverifikasi.";
};

export const sendOtp = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error404("Pengguna tidak ditemukan. Pastikan informasi yang Anda masukkan sudah benar dan coba lagi.");
    };

    const otp = generateOTP(user.otpSecret);

    // const transporter = nodemailer.createTransport({
    //     host: "smtp.mailtrap.io",
    //     port: 2525,
    //     auth: {
    //         user: process.env.MAILTRAP_USER,
    //         pass: process.env.MAILTRAP_PASS,
    //     },
    // });
    
    const transporter = nodemailer.createTransport({
        service: "gmail",
        secure:true,                    
        auth: {
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS  
        }
      });

    const mailOptions = {
        from: "test@gmail.com",
        to: email,
        subject: "Verification Travelynk Account",
        text: `Your OTP code is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    return "Email untuk memverifikasi akun Anda telah dikirim.";
};

export const register = async (data) => {
    const { email, password, fullName, phone } = data;

    const existingEmail = await prisma.user.findUnique({
        where: { email: email },
    });

    if (!existingEmail) {
        const secret = generateSecret();
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "buyer",
                otpSecret: secret,
                verified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                Profile: {
                    create: { fullName, phone },
                },
            },
            include: { Profile: true },
        });
    };

    if (existingEmail?.verified) {
        throw new Error409("Alamat email yang Anda masukkan sudah digunakan. Silakan coba dengan alamat email yang berbeda.");
    };

    const result = await sendOtp(email);
    return result;
}
