import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import { getAll, getOne, update } from "../user.service";
import prisma from "../../configs/database";

jest.mock("../../configs/database", () => ({   
    user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
    },
}));

describe("User Service", () => {   
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockUsers = [
        { 
            id: 1, 
            email: "newuser@example.com",
            role: "buyer",
            verified: true,
            profile: {
                id: 1,
                fullName: "New User",
                phone: "081234567890",
                gender: "Male",
            },
        },
        {
            id: 3,
            email: "user1@example.com",
            role: "buyer",
            verified: true,
            profile: {
                id: 3,
                fullName: "User One",
                phone: "123456789",
                gender: "Female",
            },
        },
    ];

    // Test getAll
    describe("getAll", () => {
        it("should return all users with their profiles", async () => {
            prisma.user.findMany.mockResolvedValue(mockUsers);

            const result = await getAll();

            expect(prisma.user.findMany).toHaveBeenCalledWith({
                include: { profile: true },
                orderBy: { role: 'asc' },
            });

            expect(result).toEqual(mockUsers);
        });
    });

    // Test getOne
    describe("getOne", () => {
        it("should return a user with their profile", async () => {
            prisma.user.findUnique.mockResolvedValue(mockUsers[1]);

            const result = await getOne(3);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 3 },
                include: { profile: true },
            });
            
            expect(result).toEqual(mockUsers[1]);
        });

        it("should return null if user not found", async () => {   
            prisma.user.findUnique.mockResolvedValue(null);

            const result = await getOne(99);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 99 },
                include: { profile: true },
            });

            expect(result).toBeNull();
        });
    });

    // Test update
    describe("update", () => {
        it("should update a user's role", async () => {
            const mockUpdateUser = {
                id: 3,
                email: "updated@example.com",
                role: "buyer",
            };
            
            prisma.user.update.mockResolvedValue(mockUpdateUser);

            const result = await update(3, { role: "admin" });

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 3 },
                data: { role: "admin" },
            });
            expect(result).toEqual(mockUpdateUser);
        });
    });
});