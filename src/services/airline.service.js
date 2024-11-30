import prisma from "../configs/database.js";

export const getAll = async () => {
    return await prisma.airline.findMany();
};

export const getOne = async (id) => {
    return await prisma.airline.findUnique({
        where: {
            id: parseInt(id)
        }
    });
};

export const store = async (data) => {
    return await prisma.airline.create({
        data
    });
};

export const update = async (id, data) => {
    return await prisma.airline.update({
        where: {
            id: parseInt(id)
        },
        data
    });
};

export const destroy = async (id) => {
    return await prisma.airline.delete({
        where: {
            id: parseInt(id)
        }
    });
};