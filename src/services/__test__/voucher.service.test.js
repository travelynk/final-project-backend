import { jest, describe, it, expect, afterEach } from '@jest/globals';
import prisma from '../../configs/database.js';
import * as VoucherService from '../voucher.service.js';
import { Error400, Error404, Error409 } from '../../utils/customError.js';

jest.mock('../../configs/database.js', () => ({
    __esModule: true,
    default: {
        voucher: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        booking: {
            count: jest.fn(),
            findFirst: jest.fn(),
        },
    },
}));

describe("Voucher Service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getVouchers", () => {
        test("should return a list of vouchers", async () => {
            const mockVouchers = [{ id: 1, code: "DISC2025" }];
            prisma.voucher.findMany.mockResolvedValue(mockVouchers);

            const result = await VoucherService.getVouchers();

            expect(prisma.voucher.findMany).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockVouchers);
        });
    });

    describe("storeVoucher", () => {
        test("should throw Error404 if voucher code already exists", async () => {
            prisma.voucher.findUnique.mockResolvedValue({ id: 1, code: "DISC2025" });

            const data = { code: "DISC2025" };
            await expect(VoucherService.storeVoucher(data)).rejects.toThrow(Error404);
        });

        test("should create a new voucher if the code does not exist", async () => {
            const data = {
                code: "NEW2025",
                type: "Fixed",
                value: 100,
                minPurchase: 500,
                maxVoucher: 10,
                startDate: "2024-12-01",
                endDate: "2024-12-31",
            };

            prisma.voucher.findUnique.mockResolvedValue(null);
            prisma.voucher.create.mockResolvedValue({ id: 1, ...data });

            const result = await VoucherService.storeVoucher(data);

            expect(prisma.voucher.create).toHaveBeenCalledWith({
                data: {
                    ...data,
                    startDate: new Date(data.startDate),
                    endDate: new Date(data.endDate),
                },
            });
            expect(result).toEqual({ id: 1, ...data });
        });
    });

    describe("getVoucherByCode", () => {
        test("should correctly apply total price = 0 if totalPrice is minus", async () => {
            prisma.voucher.findUnique.mockResolvedValue({
                code: "FIXED2025",
                type: "Fixed",
                value: 200,
                startDate: new Date("2024-12-01"),
                endDate: new Date("2024-12-31"),
                minPurchase: 100,
                maxVoucher: 10,
            });

            prisma.booking.count.mockResolvedValue(0);
            prisma.booking.findFirst.mockResolvedValue(null);

            const result = await VoucherService.getVoucherByCode("FIXED2025", 150);

            expect(result).toMatchObject({
                code: "FIXED2025",
            });

            console.log(result.updatedTotalPrice);

            await expect(VoucherService.getVoucherByCode("FIXED2025", 0))
                .rejects
                .toThrow(new Error400("Mohon maaf, Minimum Pembelanjaan Anda tidak mencukupi"));
        });

        test("should correctly apply fixed discount and ensure totalPrice does not go below 0", async () => {
            prisma.voucher.findUnique.mockResolvedValue({
                code: "FIXED2025",
                type: "Fixed",
                value: 200,
                startDate: new Date("2024-12-01"),
                endDate: new Date("2024-12-31"),
                minPurchase: 500,
                maxVoucher: 10,
            });

            prisma.booking.count.mockResolvedValue(0);
            prisma.booking.findFirst.mockResolvedValue(null);

            const result = await VoucherService.getVoucherByCode("FIXED2025", 500);

            expect(result).toMatchObject({
                code: "FIXED2025",
            });

            await expect(VoucherService.getVoucherByCode("FIXED2025", 400))
                .rejects
                .toThrow(new Error400("Mohon maaf, Minimum Pembelanjaan Anda tidak mencukupi"));
        });

        test("should throw Error400 if total price is less than minimum purchase", async () => {
            prisma.voucher.findUnique.mockResolvedValue({
                code: "DISC2025",
                type: "Fixed",
                value: 100,
                startDate: new Date("2024-12-01"),
                endDate: new Date("2024-12-31"),
                minPurchase: 500,
                maxVoucher: 10,
            });

            prisma.booking.count.mockResolvedValue(0);
            prisma.booking.findFirst.mockResolvedValue(null);

            await expect(VoucherService.getVoucherByCode("DISC2025", 400)).rejects.toThrow(
                new Error400("Mohon maaf, Minimum Pembelanjaan Anda tidak mencukupi")
            );
        });

        test("should throw Error404 if voucher does not exist", async () => {
            prisma.voucher.findUnique.mockResolvedValue(null);

            await expect(VoucherService.getVoucherByCode("DISC2025", 1000)).rejects.toThrow(Error404);
        });

        test("should throw Error400 if voucher is invalid or expired", async () => {
            prisma.voucher.findUnique.mockResolvedValue({
                code: "DISC2025",
                startDate: new Date("2024-11-01"),
                endDate: new Date("2024-11-30"),
                maxVoucher: 10,
            });

            prisma.booking.count.mockResolvedValue(5);
            prisma.booking.findFirst.mockResolvedValue(null);

            await expect(VoucherService.getVoucherByCode("DISC2025", 1000)).rejects.toThrow(Error400);
        });

        test("should correctly apply percentage discount", async () => {
            prisma.voucher.findUnique.mockResolvedValue({
                code: "DISC2025",
                type: "Percentage",
                value: 10,
                startDate: new Date("2024-12-01"),
                endDate: new Date("2024-12-31"),
                minPurchase: 500,
                maxVoucher: 10,
            });

            prisma.booking.count.mockResolvedValue(0);
            prisma.booking.findFirst.mockResolvedValue(null);

            const result = await VoucherService.getVoucherByCode("DISC2025", 1000);

            expect(result).toMatchObject({
                code: "DISC2025",
                updatedTotalPrice: 900,
            });
        });

        test("should correctly apply fixed discount", async () => {
            prisma.voucher.findUnique.mockResolvedValue({
                code: "DISC2025",
                type: "Fixed",
                value: 100,
                startDate: new Date("2024-12-01"),
                endDate: new Date("2024-12-31"),
                minPurchase: 500,
                maxVoucher: 10,
            });

            prisma.booking.count.mockResolvedValue(0);
            prisma.booking.findFirst.mockResolvedValue(null);

            const result = await VoucherService.getVoucherByCode("DISC2025", 1000);

            expect(result).toMatchObject({
                code: "DISC2025",
                updatedTotalPrice: 900,
            });
        });

        test("should correctly apply fixed discount but not go below 0 for totalPrice", async () => {
            prisma.voucher.findUnique.mockResolvedValue({
                code: "FIXEDOVER",
                type: "Fixed",
                value: 600,
                startDate: new Date("2024-12-01"),
                endDate: new Date("2024-12-31"),
                minPurchase: 300,
                maxVoucher: 10,
            });

            prisma.booking.count.mockResolvedValue(0);
            prisma.booking.findFirst.mockResolvedValue(null);

            const result = await VoucherService.getVoucherByCode("FIXEDOVER", 500);

            expect(result).toMatchObject({
                code: "FIXEDOVER",
                updatedTotalPrice: 0,
            });
        });

        test("should correctly apply fixed discount when voucher type is Fixed", async () => {
            prisma.voucher.findUnique.mockResolvedValue({
                code: "FIXED2025",
                type: "Fixed",
                value: 100,
                startDate: new Date("2024-12-01"),
                endDate: new Date("2024-12-31"),
                minPurchase: 500,
                maxVoucher: 10,
            });

            prisma.booking.count.mockResolvedValue(0);
            prisma.booking.findFirst.mockResolvedValue(null);

            const result = await VoucherService.getVoucherByCode("FIXED2025", 1000);

            expect(result).toMatchObject({
                code: "FIXED2025",
                updatedTotalPrice: 900,
            });
        });

        test("should correctly apply fixed discount when voucher type is Fixed and discount is within totalPrice", async () => {
            prisma.voucher.findUnique.mockResolvedValue({
                code: "FIXED100",
                type: "Fixed",
                value: 200,
                startDate: new Date("2024-12-01"),
                endDate: new Date("2024-12-31"),
                minPurchase: 300,
                maxVoucher: 10,
            });

            prisma.booking.count.mockResolvedValue(0);
            prisma.booking.findFirst.mockResolvedValue(null);

            const result = await VoucherService.getVoucherByCode("FIXED100", 500);

            expect(result).toMatchObject({
                code: "FIXED100",
                updatedTotalPrice: 300,
            });
        });

    });

    describe("updateVoucher", () => {
        test("should throw Error409 if voucher is already used", async () => {
            prisma.booking.findFirst.mockResolvedValue({ id: 1 });

            await expect(VoucherService.updateVoucher("DISC2025", {})).rejects.toThrow(Error409);
        });

        test("should update voucher if it has not been used", async () => {
            prisma.booking.findFirst.mockResolvedValue(null);
            prisma.voucher.update.mockResolvedValue({ id: 1, code: "DISC2025" });

            const result = await VoucherService.updateVoucher("DISC2025", { type: "Fixed" });

            expect(prisma.voucher.update).toHaveBeenCalledWith({
                where: { code: "DISC2025" },
                data: { type: "Fixed" },
            });
            expect(result).toEqual({ id: 1, code: "DISC2025" });
        });
    });

    describe("getVoucherById", () => {
        test("should throw Error404 if voucher does not exist", async () => {
            prisma.voucher.findUnique.mockResolvedValue(null);

            await expect(VoucherService.getVoucherById(1)).rejects.toThrow(Error404);
        });

        test("should return voucher if found", async () => {
            const mockVoucher = { id: 1, code: "DISC2025" };
            prisma.voucher.findUnique.mockResolvedValue(mockVoucher);

            const result = await VoucherService.getVoucherById(1);

            expect(result).toEqual(mockVoucher);
        });
    });
});
