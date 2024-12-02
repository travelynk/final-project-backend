import { jest, beforeEach, describe, test, expect } from '@jest/globals';
import prisma from '../../configs/database.js';
import * as countryService from '../country.service.js';

jest.mock('../../configs/database.js', () => ({
    __esModule: true,
    default: {
        country: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('Country Service', () => {
    let data;
    beforeEach(() => {
        jest.clearAllMocks();
        data = {
            "code": "ID",
            "name": "Indonesia"
        };
    });

    describe('getAll', () => {
        test('should return all countries', async () => {
            prisma.country.findMany.mockResolvedValue([data]);

            const result = await countryService.getAll();

            expect(result).toEqual([data]);
            expect(prisma.country.findMany).toHaveBeenCalledTimes(1);
        });

        test('should return empty array', async () => {
            prisma.country.findMany.mockResolvedValue([]);

            const result = await countryService.getAll();

            expect(result).toEqual([]);
            expect(prisma.country.findMany).toHaveBeenCalledTimes(1);
        });
    });

    describe('getOne', () => {
        test('should return one country', async () => {
            prisma.country.findUnique.mockResolvedValue(data);

            const result = await countryService.getOne(data.code);

            expect(result).toEqual(data);
            expect(prisma.country.findUnique).toHaveBeenCalledTimes(1);
            expect(prisma.country.findUnique).toHaveBeenCalledWith({
                where: {
                    code: data.code
                }
            });
        });
    });

    describe('store', () => {
        test('should return new country', async () => {
            prisma.country.create.mockResolvedValue(data);

            const result = await countryService.store(data);

            expect(result).toEqual(data);
            expect(prisma.country.create).toHaveBeenCalledTimes(1);
            expect(prisma.country.create).toHaveBeenCalledWith({
                data
            });
        });
    });

    describe('update', () => {
        test('should return updated country', async () => {
            prisma.country.update.mockResolvedValue(data);

            const result = await countryService.update(data.code, data);

            expect(result).toEqual(data);
            expect(prisma.country.update).toHaveBeenCalledTimes(1);
            expect(prisma.country.update).toHaveBeenCalledWith({
                where: {
                    code: data.code
                },
                data
            });
        });
    });

    describe('destroy', () => {
        test('should return deleted country', async () => {
            prisma.country.delete.mockResolvedValue(data);

            const result = await countryService.destroy(data.code);

            expect(result).toEqual(data);
            expect(prisma.country.delete).toHaveBeenCalledTimes(1);
            expect(prisma.country.delete).toHaveBeenCalledWith({
                where: {
                    code: data.code
                }
            });
        });

    });
});