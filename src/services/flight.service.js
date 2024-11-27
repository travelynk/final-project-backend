import prisma from "../configs/database.js";
import { Error400, Error404 } from "../utils/customError.js";

export const getAll = async () => {
    return await prisma.flight.findMany();
};

export const getOne = async (id) => {
    return await prisma.flight.findUnique({
        where: {
            id: parseInt(id)
        }
    });
};

export const store = async (data) => {
    const currentFlight = await prisma.flight.findFirst({
        where: {
            routeId: data.routeId,
            departureTime: data.departureTime,
            arrivalTime: data.arrivalTime
        }
    });

    if (currentFlight) throw new Error400('Penerbangan sudah tersedia!');

    return await prisma.flight.create({
        data
    });
};

export const update = async (id, data) => {
    const currentFlight = await prisma.flight.findFirst({
        where: {
            routeId: data.routeId,
            departureTime: data.departureTime,
            arrivalTime: data.arrivalTime
        }
    });

    if (currentFlight) throw new Error400('Penerbangan sudah tersedia!');

    return await prisma.flight.update({
        where: {
            id: parseInt(id)
        },
        data
    });
};

export const destroy = async (id) => {
    const currentFlight = await prisma.flight.findUnique({
        where: {
            id: parseInt(id)
        }
    });

    if (!currentFlight) throw new Error404('Penerbangan tidak ditemukan!');

    return await prisma.flight.delete({
        where: {
            id: parseInt(id)
        }
    });
};