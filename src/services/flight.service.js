import prisma from "../configs/database.js";
import { Error400, Error404 } from "../utils/customError.js";
import generateSeatCodes from "../utils/generateSeatCode.js";
import mapFlightData from "../utils/graphFlight.js";
import { formatTime } from '../utils/formatTime.js';

export const getAll = async () => {
    const flights = await prisma.flight.findMany({
        include: {
            airline: true,
            departureTerminal: {
                include: {
                    airport: {
                        include: {
                            city: true,
                        }
                    }
                }
            },
            arrivalTerminal: {
                include: {
                    airport: {
                        include: {
                            city: true,
                        }
                    }
                }
            },
        },
        orderBy: {
            departureTime: 'desc'
        }
    });

    return flights
        .map(flight => {
            return {
                id: flight.id,
                flightNum: flight.flightNum,
                airline: {
                    name: flight.airline.name,
                    image: flight.airline.image
                },
                departure: {
                    airport: flight.departureTerminal.airport.name,
                    city: {
                        code: flight.departureTerminal.airport.city.code,
                        name: flight.departureTerminal.airport.city.name
                    },
                    schedule: formatTime(flight.departureTime).date + ' ' + formatTime(flight.departureTime).time,
                    terminal: flight.departureTerminal.name
                },
                arrival: {
                    airport: flight.arrivalTerminal.airport.name,
                    city: {
                        code: flight.arrivalTerminal.airport.city.code,
                        name: flight.arrivalTerminal.airport.city.name
                    },
                    schedule: formatTime(flight.arrivalTime).date + ' ' + formatTime(flight.arrivalTime).time,
                    terminal: flight.arrivalTerminal.name
                },
                estimatedDuration: flight.estimatedDuration,
                facility: flight.facility,
                price: flight.price,
            }
        });
};

export const getOne = async (id) => {
    const flight = await prisma.flight.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            airline: true,
            departureTerminal: {
                include: {
                    airport: {
                        include: {
                            city: true,
                        }
                    }
                }
            },
            arrivalTerminal: {
                include: {
                    airport: {
                        include: {
                            city: true,
                        }
                    }
                }
            },
        },
    });

    return {
        id: flight.id,
        flightNum: flight.flightNum,
        airline: {
            id: flight.airline.id,
            name: flight.airline.name,
            image: flight.airline.image
        },
        departure: {
            airport: flight.departureTerminal.airport.name,
            city: {
                code: flight.departureTerminal.airport.city.code,
                name: flight.departureTerminal.airport.city.name
            },
            schedule: formatTime(flight.departureTime).date + ' ' + formatTime(flight.departureTime).time,
            terminal: {
                id: flight.departureTerminal.id,
                name: flight.departureTerminal.name
            }
        },
        arrival: {
            airport: flight.arrivalTerminal.airport.name,
            city: {
                code: flight.arrivalTerminal.airport.city.code,
                name: flight.arrivalTerminal.airport.city.name
            },
            schedule: formatTime(flight.arrivalTime).date + ' ' + formatTime(flight.arrivalTime).time,
            terminal: {
                id: flight.arrivalTerminal.id,
                name: flight.arrivalTerminal.name
            }
        },
        estimatedDuration: flight.estimatedDuration,
        seatClass: flight.seatClass,
        seatCapacity: flight.seatCapacity,
        facility: flight.facility,
        price: flight.price,
    };
};

export const store = async (data) => {
    const currentFlight = await prisma.flight.findFirst({
        where: {
            airlineId: data.airlineId,
            flightNum: data.flightNum,
            departureTerminalId: data.departureTerminalId,
            arrivalTerminalId: data.arrivalTerminalId,
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
            departureTerminalId: data.departureTerminalId,
            arrivalTerminalId: data.arrivalTerminalId,
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

export const getAvailableFlight = async (data) => {
    const { route, seatClass, schedule, passengers } = data;
    const startDay = new Date(schedule[0]);
    const endDay = new Date(startDay);
    endDay.setUTCDate(endDay.getUTCDate() + 1);
    const [depCity, arrCity] = route;
    let outboundFlights = [];
    let returnFlights = [];
    const now = new Date();

    if (schedule.length > 1) {
        const returnStartDay = new Date(schedule[1]);
        const returnEndDay = new Date(returnStartDay);
        returnEndDay.setUTCDate(returnEndDay.getUTCDate() + 1);

        const flights = await prisma.flight.findMany({
            where: {
                departureTime: {
                    gte: now,
                    lt: returnEndDay,
                },
                seatClass,
                flightSeats: {
                    some: {
                        isAvailable: true,
                    },
                },
            },
            include: {
                airline: true,
                departureTerminal: {
                    include: {
                        airport: {
                            include: {
                                city: true,
                            }
                        }
                    }
                },
                arrivalTerminal: {
                    include: {
                        airport: {
                            include: {
                                city: true,
                            }
                        }
                    }
                },
            },
            orderBy: {
                price: 'asc'
            }
        });

        if (flights.length > 0) {
            returnFlights = mapFlightData(flights, schedule[1], seatClass, arrCity, depCity, passengers);
        }
    }

    const flights = await prisma.flight.findMany({
        where: {
            departureTime: {
                gte: now,
                lt: endDay,
            },
            seatClass,
            flightSeats: {
                some: {
                    isAvailable: true,
                },
            },
        },
        include: {
            airline: true,
            departureTerminal: {
                include: {
                    airport: {
                        include: {
                            city: true,
                        }
                    }
                }
            },
            arrivalTerminal: {
                include: {
                    airport: {
                        include: {
                            city: true,
                        }
                    }
                }
            },
        },
        orderBy: {
            price: 'asc'
        }
    });

    if (flights.length > 0) {
        outboundFlights = mapFlightData(flights, schedule[0], seatClass, depCity, arrCity, passengers);
    }

    return { outboundFlights, returnFlights };
};