// import { describe, it, expect } from "@jest/globals";
// import { login } from "../auth.service.js";

// describe("Auth Service", () => {
//     it("should return null if user is not found", async () => {
//         const user = null;
//         const result = await login(user);
//         expect(result).toBeNull();
//     });

//     it("should return token if user is found", async () => {
//         const user = { username: "admin", password: "admin" };
//         const result = await login(user);
//         expect(result).toHaveProperty("token");
//     });
// });

import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import prisma from "../../configs/database.js";
import {
    login,
    register,
    resetPassword,
    sendResetPasswordEmail,
} from "../auth.service.js";

// jest.mock("../../configs/database.js");
// Mock prisma dengan benar
jest.mock('../../configs/database.js', () => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }));
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("nodemailer");

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

    describe("register", () => {
        it("should create a new user with a hashed password", async () => {
            bcrypt.hash.mockResolvedValue("hashedPassword");
            prisma.user.create.mockResolvedValue({ id: 1, email: "test@example.com" });

            const result = await register({
                email: "test@example.com",
                password: "password123",
                fullName: "Test User",
                phone: "1234567890",
                gender: "male",
            });

            expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: "test@example.com",
                    password: "hashedPassword",
                    role: "buyer",
                    verified: false,
                    Profile: {
                        create: {
                            fullName: "Test User",
                            phone: "1234567890",
                            gender: "male",
                        },
                    },
                },
                include: { Profile: true },
            });
            expect(result).toEqual({ id: 1, email: "test@example.com" });
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
