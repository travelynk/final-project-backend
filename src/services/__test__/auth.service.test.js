import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { login, verifyOtp, sendOtp, register, resetPassword, sendResetPasswordEmail } from "../auth.service.js";
import prisma from "../../configs/database";
import { Error400, Error404, Error409 } from "../../utils/customError";
import { generateOTP, generateSecret, verifyOTP } from "../../utils/otp";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";


jest.mock("../../configs/database", () => ({
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
    },
}));

jest.mock("nodemailer", () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn(),
    }),
}));

jest.mock("../../utils/otp", () => ({
    generateOTP: jest.fn(),
    generateSecret: jest.fn(),
    verifyOTP: jest.fn(),
}));

jest.mock("bcrypt", () => ({
    hash: jest.fn(),
}));

jest.mock("jsonwebtoken");

describe("Auth Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("login", () => {
        it("should return null if user is not found", async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const result = await login({ email: "test@example.com", password: "password123" });

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "test@example.com" } });
            expect(result).toBeNull();
        });

        it("should return null if password is invalid", async () => {
            prisma.user.findUnique.mockResolvedValue({ email: "test@example.com", password: "hashedPassword" });
            bcrypt.compare.mockResolvedValue(false);

            const result = await login({ email: "test@example.com", password: "wrongpassword" });

            expect(bcrypt.compare).toHaveBeenCalledWith("wrongpassword", "hashedPassword");
            expect(result).toBeNull();
        });

        it("should return a token if login is successful", async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 1, email: "test@example.com", password: "hashedPassword", role: "buyer" });
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue("mockToken");

            const result = await login({ email: "test@example.com", password: "password123" });

            expect(jwt.sign).toHaveBeenCalledWith({ id: 1, role: "buyer" }, process.env.JWT_SECRET, { expiresIn: "1h" });
            expect(result).toEqual({ token: "mockToken", role: "buyer" });
        });
    });
  
   describe('register', () => {
        it("should register a user and send OTP", async () => {
            const data = { email: "newuser@example.com", password: "password123", fullName: "it User", phone: "1234567890" };

            prisma.user.findUnique.mockResolvedValueOnce(null);

            bcrypt.hash.mockResolvedValue("hashedPassword");

            generateSecret.mockReturnValue("secret");

            prisma.user.create.mockResolvedValue({
                email: data.email,
                password: "hashedPassword",
                role: "buyer",
                otpSecret: "secret",
                verified: false,
                Profile: { fullName: data.fullName, phone: data.phone },
            });

            prisma.user.findUnique.mockResolvedValueOnce({
                email: data.email,
                otpSecret: "secret",
            });

            generateOTP.mockReturnValue("123456");

            nodemailer.createTransport.mockReturnValue({
                sendMail: jest.fn().mockResolvedValue("Email sent successfully"),
            });

            const result = await register(data);

            expect(result).toBe("Email untuk memverifikasi akun Anda telah dikirim.");

            expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    email: data.email,
                    password: "hashedPassword",
                    otpSecret: "secret",
                    Profile: {
                        create: {
                            fullName: data.fullName,
                            phone: data.phone,
                        },
                    },
                }),
            }));

            expect(generateOTP).toHaveBeenCalledWith("secret");

            expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith(expect.objectContaining({
                to: data.email,
                subject: "Verification Travelynk Account",
                text: expect.stringContaining("Your OTP code is: 123456"),
            }));
        });

        it("should throw Error409 if email is already used during registration", async () => {
            const mockUser = { email: "existinguser@example.com", verified: true };
            prisma.user.findUnique.mockResolvedValue(mockUser);

            const data = { email: "existinguser@example.com", password: "password123", fullName: "it User", phone: "1234567890" };
            await expect(register(data)).rejects.toThrowError(Error409);
        });
    });

    describe('sendOtp', () => {
        it("should send OTP email", async () => {
            const mockUser = { email: "it@example.com", otpSecret: "secret" };
            prisma.user.findUnique.mockResolvedValue(mockUser);
            generateOTP.mockReturnValue("123456");

            const email = "it@example.com";
            const result = await sendOtp(email);

            expect(result).toBe("Email untuk memverifikasi akun Anda telah dikirim.");
            expect(nodemailer.createTransport().sendMail).toHaveBeenCalled();
        });

        it("should throw Error404 if user is not found while sending OTP", async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const email = "notfound@example.com";
            await expect(sendOtp(email)).rejects.toThrowError(Error404);
        });

    });

    describe('verifyOtp', () => {
        it("should throw Error404 if user is not found during OTP verification", async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const data = { email: "notfound@example.com", otp: "123456" };
            await expect(verifyOtp(data)).rejects.toThrowError(Error404);
        });

        it("should verify OTP successfully", async () => {
            const mockUser = { email: "it@example.com", otpSecret: "secret" };
            prisma.user.findUnique.mockResolvedValue(mockUser);
            verifyOTP.mockReturnValue(true);
            prisma.user.update.mockResolvedValue(mockUser);

            const data = { email: "it@example.com", otp: "123456" };
            const result = await verifyOtp(data);
            expect(result).toBe("OTP berhasil diverifikasi.");
        });

        it("should throw Error400 if OTP is invalid during verification", async () => {
            const mockUser = { email: "it@example.com", otpSecret: "secret" };
            prisma.user.findUnique.mockResolvedValue(mockUser);
            verifyOTP.mockReturnValue(false);

            const data = { email: "it@example.com", otp: "123456" };
            await expect(verifyOtp(data)).rejects.toThrowError(Error400);
        });
    });

    describe("resetPassword", () => {
        it("should update the user's password if the token is valid", async () => {
            jwt.verify.mockReturnValue({ email: "test@example.com" });
            prisma.user.findUnique.mockResolvedValue({ email: "test@example.com" });
            bcrypt.hash.mockResolvedValue("newHashedPassword");
            prisma.user.update.mockResolvedValue({ email: "test@example.com" });

            const result = await resetPassword("validToken", { newPassword: "newPassword123" });

            expect(jwt.verify).toHaveBeenCalledWith("validToken", process.env.JWT_SECRET_FORGET);
            expect(bcrypt.hash).toHaveBeenCalledWith("newPassword123", 10);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { email: "test@example.com" },
                data: { password: "newHashedPassword" },
            });
            expect(result).toEqual({ message: "Password reset successfully" });
        });

        it("should throw an error if the token is invalid", async () => {
            jwt.verify.mockImplementation(() => {
                throw new Error("Invalid or expired token");
            });

            await expect(resetPassword("invalidToken", { newPassword: "newPassword123" })).rejects.toThrow("Invalid or expired token");
        });
    });

    describe("sendResetPasswordEmail", () => {
        it("should send a reset password email to the user", async () => {
            prisma.user.findUnique.mockResolvedValue({ email: "test@example.com" });
            jwt.sign.mockReturnValue("resetToken");
            const sendMailMock = jest.fn().mockResolvedValue({ messageId: "mockMessageId" });
            nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

            const result = await sendResetPasswordEmail("test@example.com");

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "test@example.com" } });
            expect(jwt.sign).toHaveBeenCalledWith({ email: "test@example.com" }, process.env.JWT_SECRET_FORGET, { expiresIn: "1h" });
            expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
                to: "test@example.com",
                subject: "Reset Your Password",
                html: expect.stringContaining("Reset Password"),
            }));
            expect(result).toHaveProperty("messageId");
        });

        it("should throw an error if user is not found", async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(sendResetPasswordEmail("unknown@example.com")).rejects.toThrow("User not found");
        });
    });
});
