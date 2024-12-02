import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import prisma from "../../configs/database.js";
import { imagekit } from "../../utils/imagekit.js";
import * as airlineService from "../airline.service.js";

jest.mock("../../configs/database.js", () => ({
    __esModule: true,
    default: {
        airline: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

jest.mock("../../utils/imagekit.js", () => ({
    __esModule: true,
    imagekit: {
        upload: jest.fn(),
    },
}));

describe("Airline Service", () => {
    let data;
    beforeEach(() => {
        jest.clearAllMocks();
        data = {
            "id": 1,
            "code": "GR",
            "name": "Garuda Air",
            "image": "https://ik.imagekit.io/travelynk/airlines/logo-garuda-air_fjgueYbxE.png",
            "airportId": 1
        };
    });

    describe("getAll", () => {
        test("should return all airlines", async () => {
            prisma.airline.findMany.mockResolvedValue([data]);

            const airlines = await airlineService.getAll();

            expect(airlines).toEqual([data]);
            expect(prisma.airline.findMany).toHaveBeenCalledTimes(1);
        });

        test("should return empty array", async () => {
            prisma.airline.findMany.mockResolvedValue([]);

            const airlines = await airlineService.getAll();

            expect(airlines).toEqual([]);
            expect(prisma.airline.findMany).toHaveBeenCalledTimes(1);
        });
    });

    describe("getOne", () => {
        test("should return one airline", async () => {
            prisma.airline.findUnique.mockResolvedValue(data);

            const airline = await airlineService.getOne(1);

            expect(airline).toEqual(data);
            expect(prisma.airline.findUnique).toHaveBeenCalledTimes(1);
        });

        test("should return null", async () => {
            prisma.airline.findUnique.mockResolvedValue(null);

            const airline = await airlineService.getOne(1);

            expect(airline).toEqual(null);
            expect(prisma.airline.findUnique).toHaveBeenCalledTimes(1);
        });

    });

    describe("store", () => {
        test("should return new airline", async () => {
            const file = {
                buffer: Buffer.from("image"),
                originalname: "logo-garuda-air.png"
            };

            imagekit.upload.mockResolvedValue({
                url: "https://ik.imagekit.io/travelynk/airlines/logo-garuda-air_fjgueYbxE.png"
            });

            prisma.airline.create.mockResolvedValue(data);

            const airline = await airlineService.store(data, file);

            expect(airline).toEqual(data);
            expect(prisma.airline.create).toHaveBeenCalledTimes(1);
            expect(imagekit.upload).toHaveBeenCalledTimes(1);
        });

    });

    describe("update", () => {
        test("should return updated airline", async () => {
            const updateData = {
                name: "Garuda Indonesia"
            };

            prisma.airline.update.mockResolvedValue(data);

            const airline = await airlineService.update(1, updateData);

            expect(airline).toEqual(data);
            expect(prisma.airline.update).toHaveBeenCalledTimes(1);
        });
    });

    describe("updateImage", () => {
        test("should return updated airline", async () => {
            const file = {
                buffer: Buffer.from("image"),
                originalname: "logo-garuda-air.png"
            };

            imagekit.upload.mockResolvedValue({
                url: "https://ik.imagekit.io/travelynk/airlines/logo-garuda-air_fjgueYbxE.png"
            });

            prisma.airline.update.mockResolvedValue(data);

            const airline = await airlineService.updateImage(1, file);

            expect(airline).toEqual(data);
            expect(prisma.airline.update).toHaveBeenCalledTimes(1);
            expect(imagekit.upload).toHaveBeenCalledTimes(1);
        });
    });

    describe("destroy", () => {
        test("should return deleted airline", async () => {
            prisma.airline.delete.mockResolvedValue(data);

            const airline = await airlineService.destroy(1);

            expect(airline).toEqual(data);
            expect(prisma.airline.delete).toHaveBeenCalledTimes(1);
        });
    });

});