import prisma from "../configs/database.js";
import { Error400, Error404 } from "../utils/customError.js";
import generateSeatCodes from "../utils/generateSeatCode.js";

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
            airlineId: data.airlineId,
            departureAirportId: data.departureAirportId,
            arrivalAirportId: data.arrivalAirportId,
            departureTime: data.departureTime,
            arrivalTime: data.arrivalTime
        }
    });

    if (currentFlight) throw new Error400('Penerbangan sudah tersedia!');

    const seats = generateSeatCodes(data.seatCapacity, 6);

    const departureTime = new Date(data.departureTime);
    const arrivalTime = new Date(data.arrivalTime);
    const estimatedDuration = (arrivalTime - departureTime) / 1000 / 60 / 60;

    return await prisma.flight.create({
        data: {
            ...data,
            estimatedDuration,
            flightSeats: {
                createMany: {
                    data: seats.map(seat => ({ position: seat }))
                }
            }
        }
    });
};

export const update = async (id, data) => {
    const flightData = await prisma.flight.findUnique({
        where: { id: parseInt(id) }
    });

    if (!flightData) throw new Error404('Penerbangan tidak ditemukan!');

    const isDuplicateFlight = await prisma.flight.findFirst({
        where: {
            airlineId: data.airlineId,
            departureAirportId: data.departureAirportId,
            arrivalAirportId: data.arrivalAirportId,
            departureTime: data.departureTime,
            arrivalTime: data.arrivalTime,
            NOT: { id: parseInt(id) }
        }
    });

    if (isDuplicateFlight) throw new Error400('Penerbangan sudah tersedia!');

    return await prisma.flight.update({
        where: { id: parseInt(id) },
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

// Client
export const getAvailableFlight = async (data) => {
    const startDay = new Date(data.schedule[0]);
    const endDay = new Date(startDay);
    endDay.setUTCDate(endDay.getUTCDate() + 1);

    let outboundFlights = await prisma.flight.findMany({
        where: {
            departureAirport: {
                cityCode: data.route[0]
            },
            arrivalAirport: {
                cityCode: data.route[1]
            },
            seatClass: data.seatClass,
            departureTime: {
                gte: startDay,
                lt: endDay
            },
            flightSeats: {
                some: {
                    isAvailable: true,
                }
            }
        },
        include: {
            airline: true,
            departureAirport: true,
            arrivalAirport: true,
            _count: {
                select: {
                    flightSeats: {
                        where: {
                            isAvailable: true
                        }
                    }
                }
            }
        },
        orderBy: {
            price: 'asc'
        }
    });

    if (!outboundFlights.length) throw new Error404('Penerbangan tidak ditemukan!');

    // Mapping response outbound flight
    outboundFlights = outboundFlights.map(flight => {
        const availableSeats = flight._count.flightSeats;
        delete flight._count;
        delete flight.airlineId;
        delete flight.departureAirportId;
        delete flight.arrivalAirportId;
        return {
            ...flight,
            availableSeats,
            passengers: data.passengers
        }
    });

    let returnFlights=[];
    
    // Check if return flight is available    
    if (data.schedule[1]){
        const returnStartDay = new Date(data.schedule[1]);
        const returnEndDay = new Date(returnStartDay);
        returnEndDay.setUTCDate(returnEndDay.getUTCDate() + 1);

        returnFlights = await prisma.flight.findMany({
            where: {
                departureAirport: {
                    cityCode: data.route[1]
                },
                arrivalAirport: {
                    cityCode: data.route[0]
                },
                seatClass: data.seatClass,
                departureTime: {
                    gte: returnStartDay,
                    lt: returnEndDay
                },
                flightSeats: {
                    some: {
                        isAvailable: true,
                    }
                }
            },
            include: {
                airline: true,
                departureAirport: true,
                arrivalAirport: true,
                _count: {
                    select: {
                        flightSeats: {
                            where: {
                                isAvailable: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                price: 'asc'
            }
        });

        if (!returnFlights.length) throw new Error404('Penerbangan pulang tidak ditemukan!');

        returnFlights = returnFlights.map(flight => {
            const availableSeats = flight._count.flightSeats;
            delete flight._count;
            delete flight.airlineId;
            delete flight.departureAirportId;
            delete flight.arrivalAirportId;
            return {
                ...flight,
                availableSeats,
                passengers: data.passengers
            }
        });
    }

    const availableFlight = {
        outboundFlights,
        returnFlights
    };

    return availableFlight;

};