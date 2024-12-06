import prisma from "../configs/database.js";
import { Error400, Error404 } from "../utils/customError.js";
import generateSeatCodes from "../utils/generateSeatCode.js";
import Graph from 'graphology';
const { MultiGraph } = Graph;

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
            flightNum: data.flightNum,
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

export const getAvailableFlight = async (data) => {
    const { route, seatClass, schedule } = data;
    const startDay = new Date(schedule[0]);
    const endDay = new Date(startDay);
    endDay.setUTCDate(endDay.getUTCDate() + 1);
    const [depCity, arrCity] = route;

    // Ambil data penerbangan yang tersedia berdasarkan jadwal
    const flights = await prisma.flight.findMany({
        where: {
            departureTime: {
                gte: startDay,
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
    });

    const outboundFlights = mapFlightData(flights, schedule, seatClass, depCity, arrCity);
    const returnFlights = [];

    return {outboundFlights, returnFlights};

};

const convertToJakartaTime = (utcDateStr) => {
    const date = new Date(utcDateStr);

    // Tambahkan offset +7 jam (WIB)
    const jakartaOffset = 7 * 60 * 60 * 1000; // Offset dalam milidetik
    const jakartaTime = new Date(date.getTime() + jakartaOffset);

    return {
        date: `${jakartaTime.getFullYear()}-${String(jakartaTime.getMonth() + 1).padStart(2, "0")}-${String(jakartaTime.getDate()).padStart(2, "0")}`,
        time: `${String(jakartaTime.getHours()).padStart(2, "0")}:${String(jakartaTime.getMinutes()).padStart(2, "0")}`,
    };
};

function createMultiGraph(flights) {
    const multiGraph = new MultiGraph();

    // Tambahkan node unik
    const uniqueNodes = new Set(flights.flatMap(flight => [
        flight.departureTerminal.airport.cityCode,
        flight.arrivalTerminal.airport.cityCode
    ]));
    uniqueNodes.forEach(node => multiGraph.addNode(node));

    // Tambahkan edges dengan informasi detail
    flights.forEach(flight => {
        const departureCityCode = flight.departureTerminal.airport.cityCode;
        const arrivalCityCode = flight.arrivalTerminal.airport.cityCode;

        multiGraph.addEdge(departureCityCode, arrivalCityCode, {
            flightId: flight.id,
            flightNum: flight.flightNum,
            // departureTime: flight.departureTime,
            // arrivalTime: flight.arrivalTime,
            // estimatedDuration: flight.estimatedDuration,
            // facility: flight.facility,
            // price: flight.price,
        });
    });

    return multiGraph;
}

function findAllPaths(graph, start, end, path = [], visited = new Set()) {
    path = [...path, start];
    visited.add(start);

    if (start === end) {
        return [path];
    }

    let paths = [];

    graph.outNeighbors(start).forEach(neighbor => {
        if (!visited.has(neighbor)) {
            const newPaths = findAllPaths(graph, neighbor, end, path, new Set(visited));
            paths.push(...newPaths);
        }
    });

    return paths;
}

function findValidFlights(flights, source, target) {
    return flights
        .filter(flight => flight.departureTerminal.airport.cityCode === source && flight.arrivalTerminal.airport.cityCode === target)
        .map(flight => {
        const departureTimeJakarta = convertToJakartaTime(flight.departureTime);
        const arrivalTimeJakarta = convertToJakartaTime(flight.arrivalTime);
        return {
            flightId: flight.id,
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
                time: departureTimeJakarta.time,
                date: departureTimeJakarta.date,
                terminal: flight.departureTerminal.name
            },
            arrival: {
                airport: flight.arrivalTerminal.airport.name,
                city: {
                    code: flight.arrivalTerminal.airport.city.code,
                    name: flight.arrivalTerminal.airport.city.name
                },
                time: arrivalTimeJakarta.time,
                date: arrivalTimeJakarta.date,
                terminal: flight.arrivalTerminal.name
            },
            estimatedDuration: flight.estimatedDuration,
            facility: flight.facility,
            price: flight.price,
        }});
}

function generateFlightCombinations(flightLists) {
    if (flightLists.length === 0) return [[]];

    const [firstList, ...remainingLists] = flightLists;
    const restCombinations = generateFlightCombinations(remainingLists);

    return firstList.flatMap(flight =>
        restCombinations.map(combo => [flight, ...combo])
    );
}

function mapFlightData(flights, schedule, seatClass, depCity, arrCity) {
    const multiGraph = createMultiGraph(flights);
    const paths = findAllPaths(multiGraph, depCity, arrCity);

    const processedPaths = paths.map((path) => {
        const flightDetails = path.slice(0, -1).map((node, i) => {
            let validFlights = findValidFlights(flights, node, path[i + 1]);
            return validFlights;
        });

        const allFlightCombinations = generateFlightCombinations(flightDetails);

        return allFlightCombinations.map(flightCombo => ({
            path,
            flights: flightCombo
        }));
    }).flat();

    const result = processedPaths.map((pathInfo) => {
        let totalPrice = 0;
        let totalDuration = 0;
        const flightsOnPath = pathInfo.flights;
        flightsOnPath.forEach((edgeAttributes) => {
            console.log(edgeAttributes)
            totalPrice += edgeAttributes.price;
            totalDuration += edgeAttributes.estimatedDuration;
        });

        return {
            flightDate: convertToJakartaTime(schedule[0]).date,
            estimatedDuration: `${totalDuration} Jam`,
            departureTime: pathInfo.flights[0].departure.time,
            arrivalTime: pathInfo.flights.at(-1).arrival.time,
            seatClass,
            price: `Rp ${totalPrice.toLocaleString()}`,
            isTransit: flightsOnPath.length > 1,
            // delayTransit: flightsOnPath.length > 1 ? (new Date(flightsOnPath[1].departureTime) - new Date(flightsOnPath[0].arrivalTime)) / 3600000 : 0,
            flights: pathInfo.flights,
        };
    });

    return result;
};