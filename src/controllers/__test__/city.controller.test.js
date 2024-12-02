import { jest, beforeEach, describe, test, expect, afterEach } from "@jest/globals";
import * as CityService from "../../services/city.service.js";
import * as CityValidation from "../../validations/city.validation.js";
import { res200, res201 } from "../../utils/response.js";
import { Error404, Error400 } from "../../utils/customError.js";
import * as CityController from "../city.controller.js";

jest.mock("../../services/city.service.js");
jest.mock("../../utils/response.js");
jest.mock("../../validations/city.validation.js", () => ({
    createPayload: {
        validate: jest.fn()
    },
    updatePayload: {
        validate: jest.fn()
    }
}));

describe("City Controller", () => {
    let req, res, next, data;
    beforeEach(() => {
        req = {};
        res = {};
        next = jest.fn();
        data = {
            "code": "JKT",
            "name": "Jakarta",
            "countryCode": "ID"
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getCity", () => {
        test("should return all city", async () => {
            CityService.getAll.mockResolvedValue([data]);

            await CityController.getCities(req, res, next);

            expect(CityService.getAll).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengambil semua data kota",
                [data],
                res
            );
        });

        test("should return error", async () => {
            const error = new Error("error message");
            CityService.getAll.mockRejectedValue(error);

            await CityController.getCities(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getCity", () => {
        test("should return one city", async () => {
            req.params = { id: 1 };
            CityService.getOne.mockResolvedValue(data);

            await CityController.getCity(req, res, next);

            expect(CityService.getOne).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengambil data kota",
                data,
                res
            );
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            CityService.getOne.mockRejectedValue(error);

            await CityController.getCity(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

        test("should return error 404", async () => {
            req.params = { id: 1 };
            CityService.getOne.mockResolvedValue(null);

            await CityController.getCity(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error404("Data kota tidak ditemukan"));
        });
    });

    describe("storeCity", () => {
        test('calls res201 on successful data creation', async () => {
            // Mock validasi dan service berhasil
            const validatedValue = {
                "code": "JKT",
                "name": "Jakarta",
                "countryCode": "ID"
            };
            const storedData = { id: 1, ...validatedValue };
            CityValidation.createPayload.validate.mockReturnValue({ value: validatedValue });
            CityService.store.mockResolvedValue(storedData);

            await CityController.storeCity(req, res, next);

            expect(CityService.store).toHaveBeenCalledWith(validatedValue);
            expect(res201).toHaveBeenCalledWith(
                'Berhasil menambahkan data kota',
                storedData,
                res
            );
        });

        test('calls next with Error400 if validation fails', async () => {
            // Mock validasi gagal
            const validationError = { details: [{ message: 'Validation error' }] };
            CityValidation.createPayload.validate.mockReturnValue({ error: validationError });

            await CityController.storeCity(req, res, next);

            expect(CityService.store).not.toHaveBeenCalled();
            expect(res201).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error400);
            expect(next.mock.calls[0][0].message).toBe('Validation error');
        });

        test('calls next with an error if CityService.store throws an error', async () => {
            // Mock validasi berhasil, tapi service gagal
            const validatedValue = {
                "code": "JKT"
            };
            const serviceError = new Error('Service error');
            CityValidation.createPayload.validate.mockReturnValue({ value: validatedValue });
            CityService.store.mockRejectedValue(serviceError);

            await CityController.storeCity(req, res, next);

            expect(next).toHaveBeenCalledWith(serviceError);
        });

    });

    describe("updateCity", () => {
        test("should update one city", async () => {
            req.params = { id: 1 };
            req.body = {
                "code": "JKT ",
                "name": "Jakartas"
            };
            CityValidation.updatePayload.validate.mockReturnValue({ value: req.body });
            CityService.update.mockResolvedValue(data);

            await CityController.updateCity(req, res, next);

            expect(CityValidation.updatePayload.validate).toHaveBeenCalledTimes(1);
            expect(CityValidation.updatePayload.validate).toHaveBeenCalledWith(req.body);
            expect(CityService.update).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengubah data kota",
                data,
                res
            );
        });

        test('calls next with Error400 if validation fails', async () => {
            // Mock validasi gagal
            const validationError = { details: [{ message: 'Validation error' }] };
            CityValidation.updatePayload.validate.mockReturnValue({ error: validationError });

            await CityController.updateCity(req, res, next);

            expect(CityService.update).not.toHaveBeenCalled();
            expect(res201).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error400);
            expect(next.mock.calls[0][0].message).toBe('Validation error');
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            req.body = { 
                "name": "Jakartas",
                "countryCode": "ID"
             };
            const error = new Error("error message");
            CityValidation.updatePayload.validate.mockReturnValue({ value: req.body });
            CityService.update.mockRejectedValue(error);

            await CityController.updateCity(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

    });

    describe("destroyCity", () => {
        test("should delete one city", async () => {
            req.params = { id: 1 };
            CityService.destroy.mockResolvedValue(data);

            await CityController.destroyCity(req, res, next);

            expect(CityService.destroy).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil menghapus data kota",
                data,
                res
            );
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            CityService.destroy.mockRejectedValue(error);

            await CityController.destroyCity(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

});