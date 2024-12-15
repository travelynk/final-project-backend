import prisma from "../configs/database.js";
import { Error400, Error404, Error409 } from "../utils/customError.js";

export const getVouchers = async () => {
    return await prisma.voucher.findMany();
};

export const storeVoucher = async (data) => {
    const {
        code,
        type,
        value,
        minPurchase,
        maxVoucher,
        startDate,
        endDate,
    } = data;


    const existingVoucher = await prisma.voucher.findUnique({
        where: { code },
    });

    if (existingVoucher) {
        throw new Error404('Mohon maaf, Code Voucher sudah pernah digunakan');
    }

    const voucher = await prisma.voucher.create({
        data: {
            code,
            type,
            value,
            minPurchase,
            maxVoucher,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
        },
    });

    return voucher;
};

export const getVoucherByCode = async (code, totalPrice) => {
    const voucher = await prisma.voucher.findUnique({
        where: { code },
    });

    if (!voucher) {
        throw new Error404("Mohon maaf, Voucher tidak dapat ditemukan");
    }
    const userId = 1;

    const usedVouchers = await prisma.booking.count({
        where: {
            voucher: {
                code,
            },
        },
    });

    const isUsed = await prisma.booking.findFirst({
        where: {
            userId,
            voucher: {
                code,
            },
        },
    });

    if (voucher.startDate > new Date() || voucher.endDate < new Date() || voucher.maxVoucher <= usedVouchers || isUsed) {
        throw new Error400('Mohon maaf, Code Voucher sudah tidak berlaku');
    }

    if (totalPrice < voucher.minPurchase) {
        throw new Error400('Mohon maaf, Minimum Pembelanjaan Anda tidak mencukupi');
    }

    let updatedTotalPrice = totalPrice;

    if (voucher.type == "Percentage") {
        updatedTotalPrice -= (totalPrice * voucher.value / 100)
    } else if (voucher.type == "Fixed") {
        updatedTotalPrice -= voucher.value
    }

    voucher.updatedTotalPrice = updatedTotalPrice;

    return voucher;
};

export const updateVoucher = async (code, dataToUpdate) => {
    const isUsed = await prisma.booking.findFirst({
        where: {
            voucher: {
                code,
            },
        },
    });

    if (isUsed) {
        throw new Error409('Voucher sudah pernah digunakan dan tidak dapat diperbarui.');
    }

    const updatedVoucher = await prisma.voucher.update({
        where: { code },
        data: {
            ...dataToUpdate, 
        },
    });

    return updatedVoucher;
};

export const getVoucherById = async (id) => {
    const voucher = await prisma.voucher.findUnique({
        where: { id },
    });

    if (!voucher) {
        throw new Error404("Mohon maaf, Voucher tidak dapat ditemukan");
    };

    return voucher;
};