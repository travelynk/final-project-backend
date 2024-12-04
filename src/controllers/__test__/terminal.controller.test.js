import { jest, beforeEach, describe, test, expect, afterEach } from "@jest/globals";
import * as TerminalService from "../../services/terminal.service.js";
import * as TerminalValidation from "../../validations/terminal.validation.js";
import { res200, res201 } from "../../utils/response.js";
import { Error404, Error400 } from "../../utils/customError.js";
import * as TerminalController from "../terminal.controller.js";

jest.mock("../../services/terminal.service.js");
jest.mock("../../utils/response.js");
jest.mock("../../validations/terminal.validation.js", () => ({
    payload: {
        validate: jest.fn()
    }
}));

describe("Terminal Controller", () => {
    let req, res, next, data;
    beforeEach(() => {
        req = {
            params: {},
            body: {
                "name": "Terminal 1As",
                "airportId": "1",
                "category" : "Internasional"
            }
        };
        res = {};
        next = jest.fn();
        data = {
            "id": 1,
            "name": "Terminal 1A",
            "airportId": 1,
            "category": "Internasional"
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getTerminal", () => {
        test("should return all terminal", async () => {
            TerminalService.getAll.mockResolvedValue([data]);

            await TerminalController.getTerminals(req, res, next);

            expect(TerminalService.getAll).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengambil semua data terminal",
                [data],
                res
            );
        });

        test("should return error", async () => {
            const error = new Error("error message");
            TerminalService.getAll.mockRejectedValue(error);

            await TerminalController.getTerminals(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getTerminal", () => {
        test("should return one terminal", async () => {
            req.params = { id: 1 };
            TerminalService.getOne.mockResolvedValue(data);

            await TerminalController.getTerminal(req, res, next);

            expect(TerminalService.getOne).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengambil data terminal",
                data,
                res
            );
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            TerminalService.getOne.mockRejectedValue(error);

            await TerminalController.getTerminal(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

        test("should return error 404", async () => {
            req.params = { id: 1 };
            TerminalService.getOne.mockResolvedValue(null);

            await TerminalController.getTerminal(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error404("Data terminal tidak ditemukan"));
        });
    });

    describe("storeTerminal", () => {
        test('calls res201 on successful data creation', async () => {

            const storedData = { id: 1, ...req.body };
            TerminalValidation.payload.validate.mockReturnValue({ value: req.body });
            TerminalService.store.mockResolvedValue(storedData);

            await TerminalController.storeTerminal(req, res, next);

            expect(TerminalService.store).toHaveBeenCalledWith(req.body);
            expect(res201).toHaveBeenCalledWith(
                'Berhasil menambahkan data terminal',
                storedData,
                res
            );
        });

        test('calls next with Error400 if validation fails', async () => {
            // Mock validasi gagal
            const validationError = { details: [{ message: 'Validation error' }] };
            TerminalValidation.payload.validate.mockReturnValue({ error: validationError });

            await TerminalController.storeTerminal(req, res, next);

            expect(TerminalService.store).not.toHaveBeenCalled();
            expect(res201).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error400);
            expect(next.mock.calls[0][0].message).toBe('Validation error');
        });

        test('calls next with an error if TerminalService.store throws an error', async () => {
            const serviceError = new Error('Service error');
            TerminalValidation.payload.validate.mockReturnValue({ value: req.body });
            TerminalService.store.mockRejectedValue(serviceError);

            await TerminalController.storeTerminal(req, res, next);

            expect(next).toHaveBeenCalledWith(serviceError);
        });

    });

    describe("updateTerminal", () => {
        test("should update one terminal", async () => {
            req.params = { id: 1 };
            TerminalValidation.payload.validate.mockReturnValue({ value: req.body });
            TerminalService.update.mockResolvedValue(data);

            await TerminalController.updateTerminal(req, res, next);

            expect(TerminalValidation.payload.validate).toHaveBeenCalledTimes(1);
            expect(TerminalValidation.payload.validate).toHaveBeenCalledWith(req.body);
            expect(TerminalService.update).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengubah data terminal",
                data,
                res
            );
        });

        test('calls next with Error400 if validation fails', async () => {
            // Mock validasi gagal
            const validationError = { details: [{ message: 'Validation error' }] };
            TerminalValidation.payload.validate.mockReturnValue({ error: validationError });

            await TerminalController.updateTerminal(req, res, next);

            expect(TerminalService.update).not.toHaveBeenCalled();
            expect(res201).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error400);
            expect(next.mock.calls[0][0].message).toBe('Validation error');
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            TerminalValidation.payload.validate.mockReturnValue({ value: req.body });
            TerminalService.update.mockRejectedValue(error);

            await TerminalController.updateTerminal(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

    });

    describe("destroyTerminal", () => {
        test("should delete one terminal", async () => {
            req.params = { id: 1 };
            TerminalService.destroy.mockResolvedValue(data);

            await TerminalController.destroyTerminal(req, res, next);

            expect(TerminalService.destroy).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil menghapus data terminal",
                data,
                res
            );
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            TerminalService.destroy.mockRejectedValue(error);

            await TerminalController.destroyTerminal(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

});