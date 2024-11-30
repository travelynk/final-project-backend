import prisma from "../configs/database.js";

export const getAll = async () => {
    return await prisma.airport.findMany();
};

export const getOne = async (id) => {
    return await prisma.airport.findUnique({
        where: {
            id: parseInt(id)
        }
    });
};

export const store = async (data) => {
    return await prisma.airport.create({
        data
    });
};

export const update = async (id, data) => {
    return await prisma.airport.update({
        where: {
            id: parseInt(id)
        },
        data
    });
};

export const destroy = async (id) => {
    return await prisma.airport.delete({
        where: {
            id: parseInt(id)
        }
    });
};