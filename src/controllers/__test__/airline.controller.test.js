import { jest, beforeEach, describe, test, expect, afterEach } from "@jest/globals";
import * as AirlineService from "../../services/airline.service.js";
import * as AirlineValidation from "../../validations/airline.validation.js";
import { res200, res201 } from "../../utils/response.js";
import { Error404, Error400 } from "../../utils/customError.js";
import * as AirlineController from "../airline.controller.js";

jest.mock("../../services/airline.service.js");
jest.mock("../../utils/response.js");
jest.mock("../../validations/airline.validation.js", () => ({
    payload: {
        validate: jest.fn()
    }
}));

describe("Airline Controller", () => {
    let req, res, next, data;
    beforeEach(() => {
        req = {
            params: {},
            body: {
                "code": "GR",
                "name": "Garuda Air Indonesia",
                "airportId": "1"
            },
            file: { path: "uploads/garuda.jpg" }
        };
        res = {};
        next = jest.fn();
        data = {
            "id": 1,
            "code": "GR",
            "name": "Garuda Air",
            "image": "garuda.jpg",
            "airportId": 1
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getAirline", () => {
        test("should return all airline", async () => {
            AirlineService.getAll.mockResolvedValue([data]);

            await AirlineController.getAirlines(req, res, next);

            expect(AirlineService.getAll).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengambil semua data maskapai",
                [data],
                res
            );
        });

        test("should return error", async () => {
            const error = new Error("error message");
            AirlineService.getAll.mockRejectedValue(error);

            await AirlineController.getAirlines(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getAirline", () => {
        test("should return one airline", async () => {
            req.params = { id: 1 };
            AirlineService.getOne.mockResolvedValue(data);

            await AirlineController.getAirline(req, res, next);

            expect(AirlineService.getOne).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengambil data maskapai",
                data,
                res
            );
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            AirlineService.getOne.mockRejectedValue(error);

            await AirlineController.getAirline(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

        test("should return error 404", async () => {
            req.params = { id: 1 };
            AirlineService.getOne.mockResolvedValue(null);

            await AirlineController.getAirline(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error404("Data maskapai tidak ditemukan"));
        });
    });

    describe("storeAirline", () => {
        test('calls res201 on successful data creation', async () => {
            const storedData = { id: 1, ...req.body };
            AirlineValidation.payload.validate.mockReturnValue({ value: req.body });
            AirlineService.store.mockResolvedValue(storedData);

            await AirlineController.storeAirline(req, res, next);

            expect(AirlineService.store).toHaveBeenCalledWith(req.body, req.file);
            expect(res201).toHaveBeenCalledWith(
                'Berhasil menambahkan data maskapai',
                storedData,
                res
            );
        });

        test('calls next with Error400 if validation fails', async () => {
            // Mock validasi gagal
            const validationError = { details: [{ message: 'Validation error' }] };
            AirlineValidation.payload.validate.mockReturnValue({ error: validationError });

            await AirlineController.storeAirline(req, res, next);

            expect(AirlineService.store).not.toHaveBeenCalled();
            expect(res201).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error400);
            expect(next.mock.calls[0][0].message).toBe('Validation error');
        });

        test('calls next with an error if AirlineService.store throws an error', async () => {
            // Mock validasi berhasil, tapi service gagal
            const validatedValue = {
                "code": "JKT"
            };
            const serviceError = new Error('Service error');
            AirlineValidation.payload.validate.mockReturnValue({ value: validatedValue });
            AirlineService.store.mockRejectedValue(serviceError);

            await AirlineController.storeAirline(req, res, next);

            expect(next).toHaveBeenCalledWith(serviceError);
        });

        test('calls next with Error400 if no file is uploaded', async () => {
            req.file = null;

            await AirlineController.storeAirline(req, res, next);

            expect(AirlineService.store).not.toHaveBeenCalled();
            expect(res201).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error400);
            expect(next.mock.calls[0][0].message).toBe('Silakan pilih gambar untuk diunggah');
        });

    });

    describe("updateAirlineData", () => {
        test("should update one airline", async () => {
            req.params = { id: 1 };
            AirlineValidation.payload.validate.mockReturnValue({ value: req.body });
            AirlineService.update.mockResolvedValue(data);

            await AirlineController.updateAirline(req, res, next);

            expect(AirlineValidation.payload.validate).toHaveBeenCalledTimes(1);
            expect(AirlineValidation.payload.validate).toHaveBeenCalledWith(req.body);
            expect(AirlineService.update).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengubah data maskapai",
                data,
                res
            );
        });

        test('calls next with Error400 if validation fails', async () => {
            // Mock validasi gagal
            const validationError = { details: [{ message: 'Validation error' }] };
            AirlineValidation.payload.validate.mockReturnValue({ error: validationError });

            await AirlineController.updateAirline(req, res, next);

            expect(AirlineService.update).not.toHaveBeenCalled();
            expect(res201).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error400);
            expect(next.mock.calls[0][0].message).toBe('Validation error');
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            AirlineValidation.payload.validate.mockReturnValue({ value: req.body });
            AirlineService.update.mockRejectedValue(error);

            await AirlineController.updateAirline(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

    });

    describe("updateImageAirline", () => {
        test("should update image of one airline", async () => {
            req.params = { id: 1 };
            AirlineService.updateImage.mockResolvedValue(data);

            await AirlineController.updateImageAirline(req, res, next);

            expect(AirlineService.updateImage).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengubah gambar maskapai",
                data,
                res
            );
        });

        test('calls next with Error400 if no file is uploaded', async () => {
            req.file = null;

            await AirlineController.updateImageAirline(req, res, next);

            expect(AirlineService.updateImage).not.toHaveBeenCalled();
            expect(res200).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error400);
            expect(next.mock.calls[0][0].message).toBe('Silakan pilih gambar untuk diunggah');
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            AirlineService.updateImage.mockRejectedValue(error);

            await AirlineController.updateImageAirline(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("destroyAirline", () => {
        test("should delete one airline", async () => {
            req.params = { id: 1 };
            AirlineService.destroy.mockResolvedValue(data);

            await AirlineController.destroyAirline(req, res, next);

            expect(AirlineService.destroy).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil menghapus data maskapai",
                data,
                res
            );
        });

        // if (!airline) {
        //     throw new Error404('Data maskapai tidak ditemukan');
        // }

        test('calls next with Error404 if airline is not found', async () => {
            req.params = { id: 1 };
            AirlineService.destroy.mockResolvedValue(null);

            await AirlineController.destroyAirline(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error404("Data maskapai tidak ditemukan"));
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            AirlineService.destroy.mockRejectedValue(error);

            await AirlineController.destroyAirline(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

});