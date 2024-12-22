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

describe("Terminal Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTerminalData = {
    id: 1,
    name: "Terminal 1",
    category: "Domestic",
    airport: {
      id: 1,
      code: "ABC",
      name: "Airport A",
      city: {
        code: "CTY",
        name: "City A",
        country: { code: "CTR", name: "Country A" },
      },
    },
  };

  describe("getAll", () => {
    test("should return a list of terminals", async () => {
      prisma.terminal.findMany.mockResolvedValue([mockTerminalData]);

      const result = await terminalService.getAll();

      expect(prisma.terminal.findMany).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 1,
          name: "Terminal 1",
          category: "Domestic",
          airport: { id: 1, code: "ABC", name: "Airport A" },
          city: { code: "CTY", name: "City A" },
          country: { code: "CTR", name: "Country A" },
        },
      ]);
    });
  });

  describe("getOne", () => {
    test("should return a single terminal by id", async () => {
      prisma.terminal.findUnique.mockResolvedValue(mockTerminalData);

      const result = await terminalService.getOne(1);

      expect(prisma.terminal.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.anything(),
      });
      expect(result).toEqual({
        id: 1,
        name: "Terminal 1",
        category: "Domestic",
        airport: { id: 1, code: "ABC", name: "Airport A" },
        city: { code: "CTY", name: "City A" },
        country: { code: "CTR", name: "Country A" },
      });
    });
  });

  describe("store", () => {
    test("should create a new terminal", async () => {
      const inputData = { name: "Terminal 1", category: "Domestic" };
      const mockData = { id: 1, ...inputData };

      prisma.terminal.create.mockResolvedValue(mockData);

      const result = await terminalService.store(inputData);

      expect(prisma.terminal.create).toHaveBeenCalledWith({ data: inputData });
      expect(result).toEqual(mockData);
    });
  });

  describe("update", () => {
    test("should update an existing terminal", async () => {
      const inputData = { name: "Updated Terminal" };
      const mockData = { id: 1, name: "Updated Terminal", category: "Domestic" };

      prisma.terminal.update.mockResolvedValue(mockData);

      const result = await terminalService.update(1, inputData);

      expect(prisma.terminal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: inputData,
      });
      expect(result).toEqual(mockData);
    });
  });

  describe("destroy", () => {
    test("should delete an existing terminal", async () => {
      prisma.terminal.delete.mockResolvedValue(mockTerminalData);

      const result = await terminalService.destroy(1);

      expect(prisma.terminal.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockTerminalData);
    });
  });
});
