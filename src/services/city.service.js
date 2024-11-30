import prisma from "../configs/database.js";

export const getAll = async () => {
    return await prisma.city.findMany();
};

export const getOne = async (code) => {
    return await prisma.city.findUnique({
        where: {
            code
        }
    });
};

export const store = async (data) => {
    return await prisma.city.create({
        data
    });
};

export const update = async (code, data) => {
    return await prisma.city.update({
        where: {
            code
        },
        data
    });
};

export const destroy = async (code) => {
    return await prisma.city.delete({
        where: {
            code
        }
    });
};