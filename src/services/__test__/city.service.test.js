import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import prisma from '../../configs/database.js';
import * as cityService from '../city.service.js';

jest.mock('../../configs/database.js', () => ({
    __esModule: true,
    default: {
        city: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('City Service', () => {
    let data;
    beforeEach(() => {
        jest.clearAllMocks();
        data = {
            "code": "JKT ",
            "name": "Jakarta",
            "countryCode": "ID"
        };
    });

    describe('getAll', () => {
        test('should return all cities', async () => {
            prisma.city.findMany.mockResolvedValue([data]);
            const result = await cityService.getAll();
            expect(result).toEqual([data]);
        });
    });

    describe('getOne', () => {
        test('should return city', async () => {
            prisma.city.findUnique.mockResolvedValue(data);
            const result = await cityService.getOne(data.code);
            expect(result).toEqual(data);
        });
    });

    describe('store', () => {
        test('should return new city', async () => {
            prisma.city.create.mockResolvedValue(data);
            const result = await cityService.store(data);
            expect(result).toEqual(data);
        });
    });

    describe('update', () => {
        test('should return updated city', async () => {
            prisma.city.update.mockResolvedValue(data);
            const result = await cityService.update(data.code, data);
            expect(result).toEqual(data);
        });
    });

    describe('destroy', () => {
        test('should return deleted city', async () => {
            prisma.city.delete.mockResolvedValue(data);
            const result = await cityService.destroy(data.code);
            expect(result).toEqual(data);
        });
    });

});