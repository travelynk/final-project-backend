import { jest, beforeEach, describe, test, expect } from '@jest/globals';
import prisma from '../../configs/database.js';
import * as FlightService from '../flight.service.js';

jest.mock('../../configs/database.js', () => ({
    __esModule: true,
    default: {
        flight: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('Flight Service', () => {
    let data;
    beforeEach(() => {
        jest.clearAllMocks();
        data = {
            id: 8,
            airlineId: 14,
            flightNum: 'GA4004',
            departureTerminalId: 9,
            arrivalTerminalId: 11,
            departureTime: "2024 - 12 - 18T08: 30:00.000Z",
            arrivalTime: "2024 - 12 - 18T10: 10:00.000Z",
            estimatedDuration: 1.5,
            seatClass: 'Economy',
            seatCapacity: 100,
            facility: 'Snack',
            price: 2000000,
            airline: {
                id: 14,
                code: 'GA',
                name: 'Garuda Indonesia',
                image: 'https://images.flightroutes.com/airlines/100/GA_100px.png'
            },
            departureTerminal: {
                id: 9,
                name: 'Terminal Domestik',
                airportId: 9,
                category: 'Domestik',
                airport: {
                    id: 29,
                    code: 'JOG',
                    name: 'Adisutjipto Airport',
                    cityCode: 'JOG',
                    lat: -7.793306,
                    long: 110.426809,
                    city: { code: 'JOG', name: 'Yogyakarta-Java Island', countryCode: 'ID' }
                }
            },
            arrivalTerminal: {
                id: 11,
                name: 'Terminal 1',
                airportId: 10,
                category: 'Domestik',
                airport: {
                    id: 29,
                    code: 'JOG',
                    name: 'Adisutjipto Airport',
                    cityCode: 'JOG',
                    lat: -7.793306,
                    long: 110.426809,
                    city: { code: 'JOG', name: 'Yogyakarta-Java Island', countryCode: 'ID' }
                }
            }
        };
    });

    describe('getAll', () => {
        test('should return all flights', async () => {
            prisma.flight.findMany.mockResolvedValue([data]);

            const result = await FlightService.getAll();

            expect(result).toEqual([data]);
            expect(prisma.flight.findMany).toHaveBeenCalledTimes(1);
        });

        test('should return empty array', async () => {
            prisma.flight.findMany.mockResolvedValue([]);

            const result = await FlightService.getAll();

            expect(result).toEqual([]);
            expect(prisma.flight.findMany).toHaveBeenCalledTimes(1);
        });
    });

    // describe('getOne', () => {
    //     test('should return one flight', async () => {
    //         prisma.flight.findUnique.mockResolvedValue(data);

    //         const result = await FlightService.getOne(parseInt(data.id));

    //         expect(result).toEqual(data);
    //         expect(prisma.flight.findUnique).toHaveBeenCalledTimes(1);
    //         expect(prisma.flight.findUnique).toHaveBeenCalledWith({
    //             where: {
    //                 id: data.id
    //             },
    //             include: {
    //                 airline: true,
    //                 departureTerminal: {
    //                     include: {
    //                         airport: {
    //                             include: {
    //                                 city: true,
    //                             }
    //                         }
    //                     }
    //                 },
    //                 arrivalTerminal: {
    //                     include: {
    //                         airport: {
    //                             include: {
    //                                 city: true,
    //                             }
    //                         }
    //                     }
    //                 },
    //             },
    //         });
    //     });
    // });

    describe('store', () => {
        test('should return created flight', async () => {
            prisma.flight.findFirst.mockResolvedValue(null);
            prisma.flight.create.mockResolvedValue(data);

            const result = await FlightService.store(data);

            expect(result).toEqual(data);
            expect(prisma.flight.findFirst).toHaveBeenCalledTimes(1);
            expect(prisma.flight.create).toHaveBeenCalledTimes(1);
            expect(prisma.flight.create).toHaveBeenCalledWith({
                data: {
                    ...data,
                    estimatedDuration: 1,
                    flightSeats: {
                        createMany: {
                            data: [
                                { position: 1 + 'A' },
                                { position: 1 + 'B' },
                                { position: 1 + 'C' },
                                { position: 1 + 'D' },
                                { position: 1 + 'E' },
                                { position: 1 + 'F' }
                            ]
                        }
                    }
                }
            });
        });

        test('should throw error 400', async () => {
            prisma.flight.findFirst.mockResolvedValue(data);

            try {
                await FlightService.store(data);
            } catch (error) {
                expect(error.statusCode).toBe(400);
                expect(error.message).toBe('Penerbangan sudah tersedia!');
            }
        });

    });

    describe('update', () => {
        test('should return updated flight', async () => {
            prisma.flight.findUnique.mockResolvedValue(data);
            prisma.flight.findFirst.mockResolvedValue(null);
            prisma.flight.update.mockResolvedValue(data);

            const result = await FlightService.update(data.id, data);

            expect(result).toEqual(data);
            expect(prisma.flight.findUnique).toHaveBeenCalledTimes(1);
            expect(prisma.flight.findFirst).toHaveBeenCalledTimes(1);
            expect(prisma.flight.update).toHaveBeenCalledTimes(1);
            expect(prisma.flight.update).toHaveBeenCalledWith({
                where: {
                    id: data.id
                },
                data
            });
        });

        test('should throw error 404 when flight is not found', async () => {
            prisma.flight.findUnique.mockResolvedValue(null);

            try {
                await FlightService.update(data.id, data);
            } catch (error) {
                expect(error.statusCode).toBe(404);
                expect(error.message).toBe('Penerbangan tidak ditemukan!');
            }
        });

        test('should thwo error 400 when flight is duplicate', async () => {
            prisma.flight.findUnique.mockResolvedValue(data);
            prisma.flight.findFirst.mockResolvedValue(data);

            try {
                await FlightService.update(data.id, data);
            } catch (error) {
                expect(error.statusCode).toBe(400);
                expect(error.message).toBe('Penerbangan sudah tersedia!');
            }
        });

    });

    describe('destroy', () => {
        test('should return deleted flight', async () => {
            prisma.flight.findUnique.mockResolvedValue(data);
            prisma.flight.delete.mockResolvedValue(data);

            const result = await FlightService.destroy(data.id);

            expect(result).toEqual(data);
            expect(prisma.flight.findUnique).toHaveBeenCalledTimes(1);
            expect(prisma.flight.delete).toHaveBeenCalledTimes(1);
            expect(prisma.flight.delete).toHaveBeenCalledWith({
                where: {
                    id: data.id
                }
            });
        });

        test('should throw error 404 when flight is not found', async () => {
            prisma.flight.findUnique.mockResolvedValue(null);

            try {
                await FlightService.destroy(data.id);
            } catch (error) {
                expect(error.statusCode).toBe(404);
                expect(error.message).toBe('Penerbangan tidak ditemukan!');
            }
        });

    });

    describe('getAvailableFlight', () => {
        test('should return available flights', async () => {
            const data = {
                route: ['JKT', 'JOG'],
                seatClass: 'Economy',
                schedule: ['2024-12-13T11:30:00.000Z'],
                passengers: 1
            };

            prisma.flight.findMany.mockResolvedValue([data]);

            const result = await FlightService.getAvailableFlight(data);

            expect(result).toEqual({ outboundFlights: [data], returnFlights: [] });
            expect(prisma.flight.findMany).toHaveBeenCalledTimes(2);
        });

        test('should return available flights with return schedule', async () => {
            const data = {
                route: ['JKT', 'JOG'],
                seatClass: 'Economy',
                schedule: ['2024-12-13T11:30:00.000Z', '2024-12-13T12:00:00.000Z'],
                passengers: 1
            };

            prisma.flight.findMany.mockResolvedValue([data]);

            const result = await FlightService.getAvailableFlight(data);

            expect(result).toEqual({ outboundFlights: [data], returnFlights: [data] });
            expect(prisma.flight.findMany).toHaveBeenCalledTimes(2);
        });

        test('should return empty array', async () => {
            const data = {
                route: ['JKT', 'JOG'],
                seatClass: 'Economy',
                schedule: ['2024-12-13T11:30:00.000Z'],
                passengers: 1
            };

            prisma.flight.findMany.mockResolvedValue([]);

            const result = await FlightService.getAvailableFlight(data);

            expect(result).toEqual({ outboundFlights: [], returnFlights: [] });
            expect(prisma.flight.findMany).toHaveBeenCalledTimes(2);
        });
    });

});