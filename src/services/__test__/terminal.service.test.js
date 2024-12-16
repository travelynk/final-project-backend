import { jest, beforeEach, describe, test, expect } from '@jest/globals';
import prisma from '../../configs/database.js';
import * as terminalService from '../terminal.service.js';

jest.mock('../../configs/database.js', () => ({
    __esModule: true,
    default: {
        terminal: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('Terminal Service', () => {
    let data;
    beforeEach(() => {
        jest.clearAllMocks();
        data = {
            "id": 61,
            "name": "Terminal Utama",
            "category": "Multi",
            "airport": {
                "code": "ADL",
                "name": "Adelaide International Airport"
            },
            "city": {
                "code": "ADL",
                "name": "Adelaide"
            },
            "country": {
                "code": "AU",
                "name": "Australia"
            }
        };
    });

    describe('getAll', () => {
        // test('should return all terminals', async () => {
        //     prisma.terminal.findMany.mockResolvedValue([data]);

        //     const result = await terminalService.getAll();
            
        //     expect(prisma.terminal.findMany).toHaveBeenCalledTimes(1);
        //     expect(result).toEqual([data]);
        // });

        test('should return empty array', async () => {
            prisma.terminal.findMany.mockResolvedValue([]);

            const result = await terminalService.getAll();

            expect(result).toEqual([]);
            expect(prisma.terminal.findMany).toHaveBeenCalledTimes(1);
        });
    });

    describe('getOne', () => {
        test('should return one terminal', async () => {
            prisma.terminal.findUnique.mockResolvedValue(data);

            await terminalService.getOne(data.id);

            expect(prisma.terminal.findUnique).toHaveBeenCalledTimes(1);
            expect(prisma.terminal.findUnique).toHaveBeenCalledWith({
                where: {
                    id: parseInt(data.id)
                },
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
                }
            });

            // expect(result).toEqual(data);
        });
    });

    describe('store', () => {
        test('should return new terminal', async () => {
            prisma.terminal.create.mockResolvedValue(data);

            const result = await terminalService.store(data);

            expect(result).toEqual(data);
            expect(prisma.terminal.create).toHaveBeenCalledTimes(1);
            expect(prisma.terminal.create).toHaveBeenCalledWith({
                data
            });
        });
    });

    describe('update', () => {
        test('should return updated terminal', async () => {
            prisma.terminal.update.mockResolvedValue(data);

            const result = await terminalService.update(data.id, data);

            expect(result).toEqual(data);
            expect(prisma.terminal.update).toHaveBeenCalledTimes(1);
            expect(prisma.terminal.update).toHaveBeenCalledWith({
                where: {
                    id: data.id
                },
                data
            });
        });
    });

    describe('destroy', () => {
        test('should return deleted terminal', async () => {
            prisma.terminal.delete.mockResolvedValue(data);

            const result = await terminalService.destroy(data.id);

            expect(result).toEqual(data);
            expect(prisma.terminal.delete).toHaveBeenCalledTimes(1);
            expect(prisma.terminal.delete).toHaveBeenCalledWith({
                where: {
                    id: data.id
                }
            });
        });
    });

});