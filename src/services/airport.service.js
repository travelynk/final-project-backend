import prisma from "../configs/database.js";
import { Error404 } from "../utils/customError.js";

export const getAll = async () => {
    const airports = await prisma.airport.findMany(
        {
            orderBy: {
                code: 'asc'
            },
            include: {
                city: {
                    include: {
                        country: true
                    }
                }
            },
        }
    );

    return airports.map(airport => {
        return {
            id: airport.id,
            code: airport.code,
            name: airport.name,
            lat: airport.lat,
            long: airport.long,
            city: {
                code: airport.city.code,
                name: airport.city.name,
                country: {
                    code: airport.city.country.code,
                    name: airport.city.country.name
                }
            }
        };
    });

};

export const getOne = async (id) => {
    const airport = await prisma.airport.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            city: {
                include: {
                    country: true
                }
            }
        }
    });

    return {
        id: airport.id,
        code: airport.code,
        name: airport.name,
        lat: airport.lat,
        long: airport.long,
        city: {
            code: airport.city.code,
            name: airport.city.name,
            country: {
                code: airport.city.country.code,
                name: airport.city.country.name
            }
        }
    };
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
    const airport = await prisma.airport.findUnique({
        where: {
            id: parseInt(id)
        }
    });

    if (!airport) throw new Error404('Bandara tidak ditemukan');

    return await prisma.airport.delete({
        where: {
            id: parseInt(id)
        }
    });
};