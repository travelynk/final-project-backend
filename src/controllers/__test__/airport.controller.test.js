import { jest, beforeEach, describe, test, expect, afterEach } from "@jest/globals";
import * as AirportService from "../../services/airport.service.js";
import * as AirportValidation from "../../validations/airport.validation.js";
import { res200, res201 } from "../../utils/response.js";
import { Error404, Error400 } from "../../utils/customError.js";
import * as AirportController from "../airport.controller.js";

jest.mock("../../services/airport.service.js");
jest.mock("../../utils/response.js");
// jest.mock("../../utils/customError.js");
jest.mock("../../validations/airport.validation.js", () => ({
    payload: {
        validate: jest.fn()
      }
}));

describe("Airport Controller", () => {
    let req, res, next, data;
    beforeEach(() => {
        req = {};
        res = {};
        next = jest.fn();
        data = {
            "id": 1,
            "code": "CGK",
            "name": "Soekarno-Hatta International Airport",
            "cityCode": "JKT"
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getAirports", () => {
        test("should return all airports", async () => {
            AirportService.getAll.mockResolvedValue([data]);

            await AirportController.getAirports(req, res, next);

            expect(AirportService.getAll).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengambil semua data bandara",
                [data],
                res
            );
        });

        test("should return error", async () => {
            const error = new Error("error message");
            AirportService.getAll.mockRejectedValue(error);

            await AirportController.getAirports(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getAirport", () => {
        test("should return one airport", async () => {
            req.params = { id: 1 };
            AirportService.getOne.mockResolvedValue(data);

            await AirportController.getAirport(req, res, next);

            expect(AirportService.getOne).toHaveBeenCalledTimes(1);
            expect(AirportService.getOne).toHaveBeenCalledWith(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengambil data bandara",
                data,
                res
            );
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            AirportService.getOne.mockRejectedValue(error);

            await AirportController.getAirport(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

        test("should return error 404", async () => {
            req.params = { id: 1 };
            AirportService.getOne.mockResolvedValue(null);

            await AirportController.getAirport(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error404("Data bandara tidak ditemukan"));
        });
    });
    
    describe("storeAirport", () => {
        test('calls res201 on successful data creation', async () => {
            // Mock validasi dan service berhasil
            const validatedValue = { name: 'Bandara A', code: 'BAA', cityCode: 'JKT' };
            const storedData = { id: 1, ...validatedValue };
            AirportValidation.payload.validate.mockReturnValue({ value: validatedValue });
            AirportService.store.mockResolvedValue(storedData);
        
            await AirportController.storeAirport(req, res, next);

            expect(AirportService.store).toHaveBeenCalledWith(validatedValue);
            expect(res201).toHaveBeenCalledWith(
              'Berhasil menambahkan data bandara',
              storedData,
              res
            );
          });

          test('calls next with Error400 if validation fails', async () => {
            // Mock validasi gagal
            const validationError = { details: [{ message: 'Validation error' }] };
            AirportValidation.payload.validate.mockReturnValue({ error: validationError });
        
            await AirportController.storeAirport(req, res, next);

            expect(AirportService.store).not.toHaveBeenCalled();
            expect(res201).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error400);
            expect(next.mock.calls[0][0].message).toBe('Validation error');
          });
        
          test('calls next with an error if AirportService.store throws an error', async () => {
            // Mock validasi berhasil, tapi service gagal
            const validatedValue = { name: 'Bandara A', code: 'BAA' };
            const serviceError = new Error('Service error');
            AirportValidation.payload.validate.mockReturnValue({ value: validatedValue });
            AirportService.store.mockRejectedValue(serviceError);
        
            await AirportController.storeAirport(req, res, next);
        
            expect(next).toHaveBeenCalledWith(serviceError);
          });

    });

    describe("updateAirport", () => {
        test("should update one airport", async () => {
            req.params = { id: 1 };
            req.body = { name: "Bandara A", code: "BAA", cityCode: "JKT" };
            AirportValidation.payload.validate.mockReturnValue({ value: req.body });
            AirportService.update.mockResolvedValue(data);

            await AirportController.updateAirport(req, res, next);

            expect(AirportValidation.payload.validate).toHaveBeenCalledTimes(1);
            expect(AirportValidation.payload.validate).toHaveBeenCalledWith(req.body);
            expect(AirportService.update).toHaveBeenCalledTimes(1);
            expect(AirportService.update).toHaveBeenCalledWith(1, req.body);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengubah data bandara",
                data,
                res
            );
        });

        test('calls next with Error400 if validation fails', async () => {
            // Mock validasi gagal
            const validationError = { details: [{ message: 'Validation error' }] };
            AirportValidation.payload.validate.mockReturnValue({ error: validationError });
        
            await AirportController.updateAirport(req, res, next);

            expect(AirportService.update).not.toHaveBeenCalled();
            expect(res201).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error400);
            expect(next.mock.calls[0][0].message).toBe('Validation error');
          });

        test("should return error", async () => {
            req.params = { id: 1 };
            req.body = { name: "Bandara A", code: "BAA", cityCode: "JKT" };
            const error = new Error("error message");
            AirportValidation.payload.validate.mockReturnValue({ value: req.body });
            AirportService.update.mockRejectedValue(error);

            await AirportController.updateAirport(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

    });

    describe("destroyAirport", () => {
        test("should delete one airport", async () => {
            req.params = { id: 1 };
            AirportService.destroy.mockResolvedValue(data);

            await AirportController.destroyAirport(req, res, next);

            expect(AirportService.destroy).toHaveBeenCalledTimes(1);
            expect(AirportService.destroy).toHaveBeenCalledWith(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil menghapus data bandara",
                data,
                res
            );
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            AirportService.destroy.mockRejectedValue(error);

            await AirportController.destroyAirport(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

});