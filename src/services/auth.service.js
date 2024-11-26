import prisma from "../configs/database.js";
import { Error400, Error404, Error409 } from "../utils/customError.js";
import { generateOTP, generateSecret, verifyOTP } from "../utils/otp.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer"

export const login = async (data) => {
    const user = data;

    if (!user) {
        return null;
    }

    const token = "jwt token";

    return { token };
}

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