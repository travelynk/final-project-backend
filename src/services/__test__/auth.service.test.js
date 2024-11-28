import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { login } from "../auth.service.js";
import prisma from "../../configs/database";
import { Error400, Error401, Error404, Error409 } from "../../utils/customError";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';


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

jest.mock("bcrypt", () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

describe("Auth Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("login", () => {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            password: "hashedPassword",
            role: "buyer",
            verified: true,
        };
        const mockData = {
            email: "test@example.com",
            password: "password123", 
        };

        it("should return token and user info when login success", async () => {
            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue("mockToken");
        
            const result = await login(mockData);
            
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: mockData.email },
            });

            expect(bcrypt.compare).toHaveBeenCalledWith(mockData.password, mockUser.password);

            expect(jwt.sign).toHaveBeenCalledWith(
              { id: mockUser.id, role: mockUser.role },
              process.env.JWT_SECRET,
              { expiresIn: "1d" }
            );

            expect(result).toEqual({
              token: "mockToken",
              user: { email: mockUser.email, role: mockUser.role },
            });
        });
  
        it("should throw Error400 if email or password are not filled", async () => {
            await expect(login({ email: null, password: "password123" })).rejects.toThrowError(Error400);
            await expect(login({ email: "test@example.com", password: null })).rejects.toThrowError(Error400);        
        });
      
        it("should throw Error400 if user email is not found", async () => {
          prisma.user.findUnique.mockResolvedValue(null);
      
          await expect(login(mockData)).rejects.toThrowError(Error400);
          await expect(login(mockData)).rejects.toThrow("Invalid email!");
        });

        it("should throw Error401 if user is not verified", async () => {
            const unverifiedUser = { ...mockUser, verified: false };
            prisma.user.findUnique.mockResolvedValue(unverifiedUser);

            await expect(login(mockData)).rejects.toThrowError(Error401);
            await expect(login(mockData)).rejects.toThrow("Account has not been verified");
        });

        it("should throw Error400 if password is incorrect", async () => {
          prisma.user.findUnique.mockResolvedValue(mockUser);
          bcrypt.compare.mockResolvedValue(false);
      
          await expect(login(mockData)).rejects.toThrowError(Error400);
          await expect(login(mockData)).rejects.toThrow("Invalid password!");
        });
    });
});