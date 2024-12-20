import prisma from "../configs/database.js";
import { Error400, Error401, Error404, Error409 } from "../utils/customError.js";
import { generateOTP, generateSecret, verifyOTP } from "../utils/otp.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { google, oauth2Client, authorizationUrl } from "../configs/googleOauth.js";
import { sendOtpEmail } from "../views/send.otp.js";

export const login = async ({ email, password }) => {
    try {
        //validasi input
        if (!email || !password) {
            throw new Error400('Email dan kata sandi harus diisi!');
        }

        const user = await prisma.user.findUnique({
            where: { 
                email,
                deletedAt: null
            },
            include: { profile: true },
        });

        if (!user) {
            throw new Error400('Email tidak valid!');
        }

        if (!user.verified) {
            throw new Error401('Akun belum diverifikasi');
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new Error400('Kata sandi tidak valid!');
        }
        //generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const userData = {
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.profile.fullName,
        };

        return {
            token,
            user: userData,
        };
    } catch (error) {
        if (error instanceof Error400 || error instanceof Error401) {
            throw error;
        } else {
            throw new Error("Internal Server Error");
        }
    }
};

export const register = async (data) => {
    const { email, password, fullName, phone } = data;

    const existingEmail = await prisma.user.findUnique({
        where: { email },
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
                profile: {
                    create: { fullName, phone },
                },
            },
            include: { profile: true },
        });
    };

    if (existingEmail?.verified) {
        throw new Error409("Alamat email yang Anda masukkan sudah digunakan. Silakan coba dengan alamat email yang berbeda.");
    };

    const result = await sendOtp(email);
    return result;
}

export const verifyOtp = async (data) => {
    const { email, otp } = data;

    const user = await prisma.user.findUnique({
        where: { 
            email,
            deletedAt: null
        },
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
        where: { 
            email,
            deletedAt: null
        },
    });

    if (!user) {
        throw new Error404("Pengguna tidak ditemukan. Pastikan informasi yang Anda masukkan sudah benar dan coba lagi.");
    };

    const otp = generateOTP(user.otpSecret);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: "test@gmail.com",
        to: email,
        subject: "Verification Travelynk Account",
        html: sendOtpEmail(otp),
    };

    await transporter.sendMail(mailOptions);

    return "Email untuk memverifikasi akun Anda telah dikirim.";
};

export const resetPassword = async (token, password) => {
    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_FORGET);
        const { email } = decoded;

        const user = await prisma.user.findUnique({ 
            where: { 
                email,
                deletedAt: null
            } 
        });

        if (!user) {
            throw new Error404("Akun pengguna tidak di temukan");
        }

        // Hash new password and update password
        const hashedPassword = await bcrypt.hash(password.newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        return { message: "Berhasil mereset password" };
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            throw new Error401('Token tidak valid atau telah kedaluwarsa. Silakan minta email reset kata sandi yang baru.');
        } else if (error instanceof Error404) {
            throw error;
        } else {
            throw new Error('Internal Server Error');
        }
    }
};

export const sendResetPasswordEmail = async (email) => {
    const user = await prisma.user.findUnique({ 
        where: {
            email,
            deletedAt: null 
        } 
    });

    if (!user) {
        throw new Error404("User not found");
    }

    // Generate token reset password (contoh sederhana)
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET_FORGET, { expiresIn: "1h" });
    const resetLink = `${process.env.FE_DOMAIN}/auth/reset-password?token=${resetToken}`;

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
    return { messageId: info.messageId };
};

export const googleAuthorizeUrl = async () => {
    return authorizationUrl;
};

export const googleOauthCallback = async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    if (!data.email || !data.verified_email) {
        throw new Error400("Email tidak valid atau belum diverifikasi");
    }

    const email = data.email;
    let user = await prisma.user.findUnique({ 
        where: { 
            email,
            deletedAt: null
        },
        include: { profile: true }
    });

    if (!user) {
        const secret = generateSecret();
        const password = Math.random().toString(36).slice(-10);
        const hashedPassword = await bcrypt.hash(password, 10);

        user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "buyer",
                otpSecret: secret,
                verified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                profile: {
                    create: { fullName: data.name, phone: "628", gender: "Laki-laki" },
                },
            },
            include: { profile: true },
        });
    } else {
        if (!user.verified) {
            await prisma.user.update({
                where: { email },
                data: { verified: true },
            })
        }
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    const result = {
        token,
        user: { email: user.email, role: user.role, name: user.profile.fullName },
    }

    return result;
};