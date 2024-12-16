import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import prisma from '../../configs/database.js';
import * as airportService from '../airport.service.js';

jest.mock('../../configs/database.js', () => ({
    __esModule: true,
    default: {
        airport: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('Airport Service', () => {
    let data;
    beforeEach(() => {
        jest.clearAllMocks();
        data = {
            "id": 45,
            "code": "ADL",
            "name": "Adelaide International Airport",
            "lat": -34.944891,
            "long": -34.944891,
            "city": {
                "code": "ADL",
                "name": "Adelaide",
                "country": {
                    "code": "AU",
                    "name": "Australia"
                }
            }
        };
    });

    describe('getAll', () => {
        test('should return all airports', async () => {
            prisma.airport.findMany.mockResolvedValue([data]);

            const airports = await airportService.getAll();

            expect(airports).toEqual([data]);
            expect(prisma.airport.findMany).toHaveBeenCalledTimes(1);
        });

        test('should return empty array', async () => {
            prisma.airport.findMany.mockResolvedValue([]);

            const airports = await airportService.getAll();

            expect(airports).toEqual([]);
            expect(prisma.airport.findMany).toHaveBeenCalledTimes(1);
        });
    });

    describe('getOne', () => {
        test('should return one airport', async () => {
            prisma.airport.findUnique.mockResolvedValue(data);

            const airport = await airportService.getOne(1);

            expect(airport).toEqual(data);
            expect(prisma.airport.findUnique).toHaveBeenCalledTimes(1);
            expect(prisma.airport.findUnique).toHaveBeenCalledWith({
                where: {
                    id: 1
                },
                include: {
                    city: {
                        include: {
                            country: true
                        }
                    }
                },
            });
        });
    });

    describe('store', () => {
        test('should create one airport', async () => {
            prisma.airport.create.mockResolvedValue(data);

            const airport = await airportService.store(data);

            expect(airport).toEqual(data);
            expect(prisma.airport.create).toHaveBeenCalledTimes(1);
            expect(prisma.airport.create).toHaveBeenCalledWith({
                data
            });
        });
    });

    describe('update', () => {
        test('should update one airport', async () => {
            prisma.airport.update.mockResolvedValue(data);

            const airport = await airportService.update(1, data);

            expect(airport).toEqual(data);
            expect(prisma.airport.update).toHaveBeenCalledTimes(1);
            expect(prisma.airport.update).toHaveBeenCalledWith({
                where: {
                    id: 1
                },
                data
            });
        });
    });

    describe('destroy', () => {
        test('should delete one airport', async () => {
            prisma.airport.delete.mockResolvedValue(data);

            const airport = await airportService.destroy(1);

            expect(airport).toEqual(data);
            expect(prisma.airport.delete).toHaveBeenCalledTimes(1);
            expect(prisma.airport.delete).toHaveBeenCalledWith({
                where: {
                    id: 1
                }
            });
        });
    });
        

});