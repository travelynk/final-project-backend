import prisma from "../configs/database.js";
import { Error400, Error404 } from "../utils/customError.js";
import generateSeatCodes from "../utils/generateSeatCode.js";
// import Graph from 'graphology';
// import { singleSource } from 'graphology-shortest-path';
// const { MultiGraph } = Graph;

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

// export const getAvailableFlight = async (data) => {
//     const { route, seatClass, schedule } = data;
//     const startDay = new Date(schedule[0]);
//     const endDay = new Date(startDay);
//     endDay.setUTCDate(endDay.getUTCDate() + 1);

//     // Ambil data semua penerbangan
//     const flights = await prisma.flight.findMany({
//         where: {
//             departureTime: {
//                 gte: startDay,
//                 lt: endDay,
//             },
//             seatClass,
//             flightSeats: {
//                 some: {
//                     isAvailable: true,
//                 },
//             },
//         },
//         include: {
//             departureAirport: {
//                 include: {
//                     city: true,
//                 },
//             },
//             arrivalAirport: {
//                 include: {
//                     city: true,
//                 },
//             },
//         },
//     });

//     // Inisialisasi graf
//     const graph = new DirectedGraph();

//     // Tambahkan node dan edge dari data penerbangan
//     flights.forEach((flight) => {
//         const departureCity = flight.departureAirport.city.code;
//         const arrivalCity = flight.arrivalAirport.city.code;

//         // Tambahkan node jika belum ada
//         if (!graph.hasNode(departureCity)) graph.addNode(departureCity);
//         if (!graph.hasNode(arrivalCity)) graph.addNode(arrivalCity);

//         // Tambahkan edge dengan atribut
//         graph.addEdge(departureCity, arrivalCity, {
//             flightId: flight.id,
//             price: flight.price,
//             departureTime: flight.departureTime,
//             arrivalTime: flight.arrivalTime,
//         });
//     });

//     // Cari semua jalur dari kota asal ke kota tujuan
//     const [origin, destination] = route; // Contoh: ['JKT', 'SBY']
//     if (!graph.hasNode(origin) || !graph.hasNode(destination)) {
//         throw new Error404('Kota asal atau tujuan tidak ditemukan!');
//     }

//     // Cari jalur terpendek menggunakan Dijkstra atau Breadth-First Search
//     const paths = [];
//     graph.forEachPathFromNode(origin, destination, (path, attributes) => {
//         paths.push({
//             path,
//             attributes,
//         });
//     });

//     // Format data hasil
//     const result = paths.map((p) => {
//         const totalPrice = p.attributes.reduce((sum, attr) => sum + attr.price, 0);
//         const flights = p.path.map((city, idx) => {
//             if (idx < p.path.length - 1) {
//                 const edge = graph.edge(city, p.path[idx + 1]);
//                 return {
//                     flightId: edge.flightId,
//                     departureCity: city,
//                     arrivalCity: p.path[idx + 1],
//                     price: edge.price,
//                 };
//             }
//             return null;
//         }).filter(Boolean);

//         return {
//             totalPrice,
//             flights,
//         };
//     });

//     return result;
// };

// export const getAvailableFlight = async (data) => {
//     const { route, seatClass, schedule } = data;
//     const startDay = new Date(schedule[0]);
//     const endDay = new Date(startDay);
//     endDay.setUTCDate(endDay.getUTCDate() + 1);

//     // Ambil data penerbangan yang tersedia berdasarkan jadwal
//     const flights = await prisma.flight.findMany({
//         where: {
//             departureTime: {
//                 gte: startDay,
//                 lt: endDay,
//             },
//             seatClass,
//             flightSeats: {
//                 some: {
//                     isAvailable: true,
//                 },
//             },
//         },
//         include: {
//             departureAirport: {
//                 include: {
//                     city: true, // Mengambil informasi kota
//                 },
//             },
//             arrivalAirport: {
//                 include: {
//                     city: true, // Mengambil informasi kota
//                 },
//             },
//         },
//     });

//     // Inisialisasi graf
//     const graph = new MultiGraph();

//     // Tambahkan node dan edge ke graf berdasarkan kode kota
//     flights.forEach((flight) => {
//         const departureCityCode = flight.departureAirport.city.code; // Kode kota keberangkatan
//         const arrivalCityCode = flight.arrivalAirport.city.code; // Kode kota tujuan

//         // Tambahkan node kota jika belum ada
//         if (!graph.hasNode(departureCityCode)) graph.addNode(departureCityCode);
//         if (!graph.hasNode(arrivalCityCode)) graph.addNode(arrivalCityCode);

//         // Tambahkan edge dari kota keberangkatan ke kota tujuan dengan ID penerbangan
//         graph.addEdge(departureCityCode, arrivalCityCode, {
//             flightId: flight.id,
//             price: flight.price,
//             departureTime: flight.departureTime,
//             arrivalTime: flight.arrivalTime,
//         });

//         console.log(`Edge: ${departureCityCode} -> ${arrivalCityCode}, Price: ${flight.price}`);
//     });

//     // Fungsi DFS untuk menemukan semua jalur antara dua node
//     const findAllPaths = (current, destination, path = [], pathDetails = []) => {
//         path.push(current);
//         if (current === destination) {
//             paths.push({ path: [...path], details: [...pathDetails] });
//         } else {
//             graph.neighbors(current).forEach((neighbor) => {
//                 if (!path.includes(neighbor)) {
//                     // Ambil semua edge antara current dan neighbor
//                     const edges = graph.edges(current, neighbor);
//                     edges.forEach((edge) => {
//                         const edgeAttributes = graph.getEdgeAttributes(edge);
//                         pathDetails.push(edgeAttributes);
//                         findAllPaths(neighbor, destination, path, pathDetails);
//                         pathDetails.pop(); // Kembali ke jalur sebelumnya setelah rekursi
//                     });
//                 }
//             });
//         }
//         path.pop();
//     };

//     const [originCity, destinationCity] = route; // Contoh: ['JKT', 'SBY']
//     if (!graph.hasNode(originCity) || !graph.hasNode(destinationCity)) {
//         throw new Error404('Kota asal atau tujuan tidak ditemukan!');
//     }

//     const paths = [];
//     findAllPaths(originCity, destinationCity);

//     if (paths.length === 0) {
//         throw new Error404('Tidak ada jalur antara kota asal dan tujuan.');
//     }

//     // Format hasil
//     const results = paths.map((pathObj) => {
//         let totalPrice = 0;
//         const flightsOnPath = pathObj.details;
//         flightsOnPath.forEach((edgeAttributes) => {
//             totalPrice += edgeAttributes.price;
//         });

//         return {
//             totalPrice,
//             flights: flightsOnPath.map((edge) => ({
//                 flightId: edge.flightId,
//                 departureCity: edge.departureCity,
//                 arrivalCity: edge.arrivalCity,
//                 price: edge.price,
//             })),
//         };
//     });

//     return results;
// };
