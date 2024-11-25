import prisma from "../configs/database.js";

export const getAll = async () => {
    return await prisma.terminal.findMany();
};

export const getOne = async (id) => {
    return await prisma.terminal.findUnique({
        where: {
            id: parseInt(id)
        }
    });
};

export const store = async (data) => {
    return await prisma.terminal.create({
        data
    });
};

export const update = async (id, data) => {
    return await prisma.terminal.update({
        where: {
            id: parseInt(id)
        },
        data
    });
};

export const destroy = async (id) => {
    return await prisma.terminal.delete({
        where: {
            id: parseInt(id)
        }
    });
};