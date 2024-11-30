import prisma from "../configs/database.js";
import { imagekit } from "../utils/imagekit.js";

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

export const store = async (data, file) => {
    const uploadFile = await imagekit.upload({
        file: file.buffer.toString('base64'),
        fileName: file.originalname,
        folder: '/airlines',
    });

    return await prisma.airline.create({
        data: {
            ...data,
            image: uploadFile.url
        }
    });
};

export const update = async (id, data, file) => {
    const uploadFile = await imagekit.upload({
        file: file.buffer.toString('base64'),
        fileName: file.originalname,
        folder: '/airlines',
    });

    return await prisma.airline.update({
        where: {
            id: parseInt(id)
        },
        data: {
            ...data,
            image: uploadFile.url
        }
    });
};

export const destroy = async (id) => {
    return await prisma.airline.delete({
        where: {
            id: parseInt(id)
        }
    });
};