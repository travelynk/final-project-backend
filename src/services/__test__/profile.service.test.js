import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { getProfile, updateProfile } from "../profile.service.js";
import prisma from "../../configs/database.js";
import { Error404 } from "../../utils/customError.js";

jest.mock("../../configs/database.js", () => ({
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
}));

describe("Profile Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getProfile", () => {
        it("should return user profile if found", async () => {
            const mockUser = {
                id: 1,
                email: "it@example.com",
                profile: {
                    fullName: "it User",
                    phone: "1234567890",
                },
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await getProfile(1);
            expect(result).toEqual({
                id: mockUser.id,
                fullName: mockUser.profile.fullName,
                phone: mockUser.profile.phone,
                email: mockUser.email,
            });
        });

        it("should throw Error404 if user is not found", async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(getProfile(999)).rejects.toThrowError(Error404);
            await expect(getProfile(999)).rejects.toThrow("Pengguna tidak ditemukan. Pastikan informasi yang Anda masukkan sudah benar dan coba lagi.");
        });
    });

    describe("updateProfile", () => {
        it("should update user profile if found", async () => {
            const mockUser = {
                id: 1,
                email: "it@example.com",
                profile: {
                    fullName: "it User",
                    phone: "1234567890",
                },
            };

            const updatedData = {
                email: "updated@example.com",
                fullName: "Updated User",
                phone: "9876543210",
            };

            prisma.user.update.mockResolvedValue(mockUser);

            const result = await updateProfile(1, updatedData);
            expect(result).toEqual({
                id: mockUser.id,
                fullName: mockUser.profile.fullName,
                phone: mockUser.profile.phone,
                email: mockUser.email,
            });

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
                data: {
                    email: updatedData.email,
                    profile: {
                        update: {
                            fullName: updatedData.fullName,
                            phone: updatedData.phone,
                        },
                    },
                },
                include: {
                    profile: true,
                },
            });
        });

        it("should throw Error404 if user is not found during update", async () => {
            const updatedData = {
                email: "updated@example.com",
                fullName: "Updated User",
                phone: "9876543210",
            };

            prisma.user.update.mockResolvedValue(null);

            await expect(updateProfile(999, updatedData)).rejects.toThrowError(Error404);
            await expect(updateProfile(999, updatedData)).rejects.toThrow("Pengguna tidak ditemukan. Pastikan informasi yang Anda masukkan sudah benar dan coba lagi.");
        });
    });
});
