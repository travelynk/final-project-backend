import { jest, beforeEach, describe, test, expect, afterEach } from "@jest/globals";
import * as CountryService from "../../services/country.service.js";
import * as CountryValidation from "../../validations/country.validation.js";
import { Error404, Error400 } from "../../utils/customError.js";
import * as CountryController from "../country.controller.js";

jest.mock("../../services/country.service.js");
jest.mock("../../validations/country.validation.js", () => ({
    payload: {
        validate: jest.fn()
    },
    payloadUpdate: {
        validate: jest.fn()
    }
}));

describe("Country Controller", () => {
    let req, res, next, data;
    beforeEach(() => {
        req = {
            params: {},
            body: {
                "code": "ID",
                "name": "Indonesia",
                "region": "Asia"
            }
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
        data = {
            "code": "ID",
            "name": "Indonesia",
            "region": "Asia"
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getCountres", () => {
        test("should return all country", async () => {
            CountryService.getAll.mockResolvedValue([data]);

            await CountryController.getCountries(req, res, next);

            expect(CountryService.getAll).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: {
                    code: 200,
                    message: "Berhasil mengambil semua data negara",
                },
                data: [data]
            });
        });

        test("should return error", async () => {
            const error = new Error("error message");
            CountryService.getAll.mockRejectedValue(error);

            await CountryController.getCountries(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getCountry", () => {
        test("should return one country", async () => {
            req.params = { id: 1 };
            CountryService.getOne.mockResolvedValue(data);

            await CountryController.getCountry(req, res, next);

            expect(CountryService.getOne).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: {
                    code: 200,
                    message: "Berhasil mengambil satu data negara",
                },
                data: data
            });
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            CountryService.getOne.mockRejectedValue(error);

            await CountryController.getCountry(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

        test("should return error 404", async () => {
            req.params = { id: 1 };
            CountryService.getOne.mockResolvedValue(null);

            await CountryController.getCountry(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error404("Data negara tidak ditemukan"));
        });
    });

    describe("storeCountry", () => {
        test('calls res201 on successful data creation', async () => {
            const storedData = { id: 1, ...req.body };
            CountryValidation.payload.validate.mockReturnValue({ value: req.body });
            CountryService.store.mockResolvedValue(storedData);

            await CountryController.storeCountry(req, res, next);

            expect(CountryService.store).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: {
                    code: 201,
                    message: "Berhasil menambahkan data negara baru",
                },
                data: storedData
            });
        });

        test('calls next with Error400 if validation fails', async () => {
            // Mock validasi gagal
            const validationError = { details: [{ message: 'Validation error' }] };
            CountryValidation.payload.validate.mockReturnValue({ error: validationError });

            await CountryController.storeCountry(req, res, next);

            expect(CountryService.store).not.toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error400);
            expect(next.mock.calls[0][0].message).toBe('Validation error');
        });

        test('calls next with an error if CountryService.store throws an error', async () => {
            // Mock validasi berhasil, tapi service gagal
            const validatedValue = {
                "code": "JKT"
            };
            const serviceError = new Error('Service error');
            CountryValidation.payload.validate.mockReturnValue({ value: validatedValue });
            CountryService.store.mockRejectedValue(serviceError);

            await CountryController.storeCountry(req, res, next);

            expect(next).toHaveBeenCalledWith(serviceError);
        });

        test('calls next with Error400 if CountryService.store throws an error with code P2002', async () => {
            // Mock validasi berhasil, tapi service gagal
            const validatedValue = {
                "code": "JKT"
            };
            const serviceError = new Error('Service error');
            serviceError.code = 'P2002';
            CountryValidation.payload.validate.mockReturnValue({ value: validatedValue });
            CountryService.store.mockRejectedValue(serviceError);

            await CountryController.storeCountry(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error400));
            expect(next.mock.calls[0][0].message).toBe('Kode negara sudah digunakan');
        });

    });

    describe("updateCountry", () => {
        test("should update one country", async () => {
            req.params = { id: 1 };
            delete req.body.code;
            CountryValidation.payloadUpdate.validate.mockReturnValue({ value: req.body });
            CountryService.update.mockResolvedValue(data);

            await CountryController.updateCountry(req, res, next);

            expect(CountryValidation.payloadUpdate.validate).toHaveBeenCalledTimes(1);
            expect(CountryValidation.payloadUpdate.validate).toHaveBeenCalledWith(req.body);
            expect(CountryService.update).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: {
                    code: 200,
                    message: "Berhasil mengubah data negara",
                },
                data: data
            });
        });

        test('calls next with Error400 if validation fails', async () => {
            // Mock validasi gagal
            const validationError = { details: [{ message: 'Validation error' }] };
            CountryValidation.payloadUpdate.validate.mockReturnValue({ error: validationError });

            await CountryController.updateCountry(req, res, next);

            expect(CountryService.update).not.toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error400);
            expect(next.mock.calls[0][0].message).toBe('Validation error');
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            CountryValidation.payloadUpdate.validate.mockReturnValue({ value: req.body });
            CountryService.update.mockRejectedValue(error);

            await CountryController.updateCountry(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

        test("should return error 400", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            error.code = "P2002";
            CountryValidation.payloadUpdate.validate.mockReturnValue({ value: req.body });
            CountryService.update.mockRejectedValue(error);

            await CountryController.updateCountry(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error400("Kode negara sudah digunakan"));
        });

    });

    describe("destroyCountry", () => {
        test("should delete one country", async () => {
            req.params = { id: 1 };
            CountryService.destroy.mockResolvedValue(data);

            await CountryController.destroyCountry(req, res, next);

            expect(CountryService.destroy).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: {
                    code: 200,
                    message: "Berhasil menghapus negara",
                },
                data: data
            });

        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            CountryService.destroy.mockRejectedValue(error);

            await CountryController.destroyCountry(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

});