// import prisma from "../configs/database.js";

// export const getAll = async () => {
//     return await prisma.airport.findMany();
// };

// export const getOne = async (id) => {
//     return await prisma.airport.findUnique({
//         where: {
//             id: parseInt(id)
//         }
//     });
// };

// export const store = async (data) => {
//     return await prisma.airport.create({
//         data
//     });
// };

// export const update = async (id, data) => {
//     return await prisma.airport.update({
//         where: {
//             id: parseInt(id)
//         },
//         data
//     });
// };

// export const destroy = async (id) => {
//     return await prisma.airport.delete({
//         where: {
//             id: parseInt(id)
//         }
//     });
// };

// create unit test for airport service
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
            "id": 1,
            "code": "CGK",
            "name": "Soekarno-Hatta International Airport",
            "cityCode": "JKT"
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
                }
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