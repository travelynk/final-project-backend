import prisma from "../configs/database.js";

export const getAll = async () => {
    const terminals = await prisma.terminal.findMany({
        include: {
            airport: {
                include: {
                    city: {
                        include: {
                            country: true
                        }
                    }
                }
            }
        },
        orderBy: {
            airport: {
                city: {
                    name: 'asc'
                }
            }
        }
    });
    return terminals.map(terminal => {
        return {
            id: terminal.id,
            name: terminal.name,
            category: terminal.category,
            airport: {
                code: terminal.airport.code,
                name: terminal.airport.name,
            },
            city: {
                code: terminal.airport.city.code,
                name: terminal.airport.city.name,
            },
            country: {
                code: terminal.airport.city.country.code,
                name: terminal.airport.city.country.name,
            }
        };
    });

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