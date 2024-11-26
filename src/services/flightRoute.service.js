import prisma from "../configs/database.js";
import { Error400, Error404 } from "../utils/customError.js";

export const getAll = async () => {
    return await prisma.route.findMany(
        {
            include: {
                Airline: true,
                DepartureAirport: true,
                ArrivalAirport: true
            }
        }
    );
};

export const getOne = async (id) => {
    return await prisma.route.findUnique({
        where: {
            id: parseInt(id)
        }
    });
};

export const store = async (data) => {
    const currentRoute = await prisma.route.findFirst({
        where: {
            airlineId: data.airlineId,
            departureAirportId: data.departureAirportId,
            arrivalAirportId: data.arrivalAirportId,
            departureTime: data.departureTime,
            arrivalTime: data.arrivalTime
        }
    });

    if (currentRoute) throw new Error400('Rute penerbangan sudah tersedia!');

    return await prisma.route.create({
        data
    });
};

export const update = async (id, data) => {
    const currentRoute = await prisma.route.findFirst({
        where: {
            airlineId: data.airlineId,
            departureAirportId: data.departureAirportId,
            arrivalAirportId: data.arrivalAirportId,
            departureTime: data.departureTime,
            arrivalTime: data.arrivalTime
        }
    });

    if (currentRoute) throw new Error400('Rute penerbangan sudah tersedia!');

    return await prisma.route.update({
        where: {
            id: parseInt(id)
        },
        data
    });
};

export const destroy = async (id) => {
    const currentRoute = await prisma.route.findUnique({
        where: {
            id: parseInt(id)
        }
    });

    if (!currentRoute) throw new Error404('Data rute penerbangan tidak ditemukan!');

    return await prisma.route.delete({
        where: {
            id: parseInt(id)
        }
    });
};