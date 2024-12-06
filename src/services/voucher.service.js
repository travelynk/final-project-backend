import prisma from "../configs/database.js";
import { Error400, Error404 } from "../utils/customError.js";

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
        throw new Error404('Mohon maaf, Code Voucher sudah pernah di input');
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

export const getVoucherByCode = async (code , totalPrice) => {
    const voucher = await prisma.voucher.findUnique({
        where: { code },
    });

    if (!voucher){
        throw new Error404("Mohon maaf , tidak dapat menemukan Voucher tersebut");
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

    if (totalPrice < voucher.minPurchase){
        throw new Error400('Mohon maaf, Minimum Pembelanjaan Anda tidak mencukupi');
    }
    
    let updatedTotalPrice = totalPrice;

    if (voucher.type == "percentage") {
        updatedTotalPrice -= (totalPrice * voucher.value / 100)
    } else if (voucher.type == "fixed"){
        updatedTotalPrice -= voucher.value
    }

    voucher.updatedTotalPrice = updatedTotalPrice;

    return voucher;
};