import prisma from "../configs/database.js";
import { Error404 } from "../utils/customError.js";

export const getAll = async () => {
    const cities = await prisma.city.findMany({
        include: {
            country: true
        },
    });

    return cities.map((city) => {
        return {
            code: city.code,
            name: city.name,
            country: {
                code: city.country.code,
                name: city.country.name,
            },
        };
    });
};

export const getOne = async (code) => {
    const city = await prisma.city.findUnique({
        where: {
            code
        },
        include: {
            country: true
        },
    });

    return {
        code: city.code,
        name: city.name,
        country: {
            code: city.country.code,
            name: city.country.name,
        },
    };
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
    const city = await prisma.city.findUnique({
        where: {
            code
        },
        include: {
            airports: true
        }
    });

    if (!city) throw new Error404("Kota tidak ditemukan");
    
    return await prisma.city.delete({
        where: {
            code
        }
    });
};