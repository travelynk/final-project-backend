import { jest, beforeEach, describe, test, expect, afterEach } from "@jest/globals";
import * as FlightService from "../../services/flight.service.js";
import * as FlightValidation from "../../validations/flight.validation.js";
import { res200, res201 } from "../../utils/response.js";
import { Error404, Error400 } from "../../utils/customError.js";
import * as FlightController from "../flight.controller.js";

jest.mock("../../services/flight.service.js");
jest.mock("../../utils/response.js");
jest.mock("../../validations/flight.validation.js", () => ({
    flightSchema: {
        validate: jest.fn()
    },
    querySchema: {
        validate: jest.fn()
    }
}));

describe("Flight Controller", () => {
    let req, res, next, data;
    beforeEach(() => {
        req = {
            params: {},
            body: {
                "airlineId": 1,
                "flightNum": "GA004",
                "departureAirportId": 1,
                "arrivalAirportId": 5,
                "departureTime": "2021-08-01T01:00:00.000Z",
                "arrivalTime": "2021-08-01T01:30:00.000Z",
                "estimatedDuration": 60,
                "seatClass": "Economy",
                "seatCapacity": 60,
                "facility": "WIFI",
                "price": 1000000
            }
        };
        res = {};
        next = jest.fn();
        data = {
            "id": 1,
            "airlineId": 1,
            "flightNum": "GA001",
            "departureAirportId": 1,
            "arrivalAirportId": 2,
            "departureTime": "2021-08-01T00:00:00.000Z",
            "arrivalTime": "2021-08-01T01:00:00.000Z",
            "estimatedDuration": 1,
            "seatClass": "Economy",
            "seatCapacity": 80,
            "facility": "WIFI",
            "price": 1000000
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getFlights", () => {
        test("should return all flight", async () => {
            FlightService.getAll.mockResolvedValue([data]);

            await FlightController.getFlights(req, res, next);

            expect(FlightService.getAll).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengambil semua data penerbangan",
                [data],
                res
            );
        });

        test("should return error", async () => {
            const error = new Error("error message");
            FlightService.getAll.mockRejectedValue(error);

            await FlightController.getFlights(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getFlight", () => {
        test("should return one flight", async () => {
            req.params = { id: 1 };
            FlightService.getOne.mockResolvedValue(data);

            await FlightController.getFlight(req, res, next);

            expect(FlightService.getOne).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengambil data penerbangan",
                data,
                res
            );
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            FlightService.getOne.mockRejectedValue(error);

            await FlightController.getFlight(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

        test("should return error 404", async () => {
            req.params = { id: 1 };
            FlightService.getOne.mockResolvedValue(null);

            await FlightController.getFlight(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error404("Data penerbangan tidak ditemukan"));
        });
    });

    describe("storeFlight", () => {
        test('calls res201 on successful data creation', async () => {
            const storedData = { id: 1, ...req.body };
            FlightValidation.flightSchema.validate.mockReturnValue({ value: req.body });
            FlightService.store.mockResolvedValue(storedData);

            await FlightController.storeFlight(req, res, next);

            expect(FlightService.store).toHaveBeenCalledWith(req.body);
            expect(res201).toHaveBeenCalledWith(
                'Berhasil menambahkan data penerbangan',
                storedData,
                res
            );
        });

        test('calls next with Error400 if validation fails', async () => {
            // Mock validasi gagal
            const validationError = { details: [{ message: 'Validation error' }] };
            FlightValidation.flightSchema.validate.mockReturnValue({ error: validationError });

            await FlightController.storeFlight(req, res, next);

            expect(FlightService.store).not.toHaveBeenCalled();
            expect(res201).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error400);
            expect(next.mock.calls[0][0].message).toBe('Validation error');
        });

        test('calls next with an error if FlightService.store throws an error', async () => {
            // Mock validasi berhasil, tapi service gagal
            const validatedValue = {
                "flightNum": "JKT"
            };
            const serviceError = new Error('Service error');
            FlightValidation.flightSchema.validate.mockReturnValue({ value: validatedValue });
            FlightService.store.mockRejectedValue(serviceError);

            await FlightController.storeFlight(req, res, next);

            expect(next).toHaveBeenCalledWith(serviceError);
        });

    });

    describe("updateFlight", () => {
        test("should update one flight", async () => {
            req.params = { id: 1 };
            FlightValidation.flightSchema.validate.mockReturnValue({ value: req.body });
            FlightService.update.mockResolvedValue(data);

            await FlightController.updateFlight(req, res, next);

            expect(FlightValidation.flightSchema.validate).toHaveBeenCalledTimes(1);
            expect(FlightValidation.flightSchema.validate).toHaveBeenCalledWith(req.body);
            expect(FlightService.update).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengubah data penerbangan",
                data,
                res
            );
        });

        test('calls next with Error400 if validation fails', async () => {
            // Mock validasi gagal
            const validationError = { details: [{ message: 'Validation error' }] };
            FlightValidation.flightSchema.validate.mockReturnValue({ error: validationError });

            await FlightController.updateFlight(req, res, next);

            expect(FlightService.update).not.toHaveBeenCalled();
            expect(res201).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error400);
            expect(next.mock.calls[0][0].message).toBe('Validation error');
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            FlightValidation.flightSchema.validate.mockReturnValue({ value: req.body });
            FlightService.update.mockRejectedValue(error);

            await FlightController.updateFlight(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

    });

    describe("destroyFlight", () => {
        test("should delete one flight", async () => {
            req.params = { id: 1 };
            FlightService.destroy.mockResolvedValue(data);

            await FlightController.destroyFlight(req, res, next);

            expect(FlightService.destroy).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil menghapus data penerbangan",
                data,
                res
            );
        });

        test("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            FlightService.destroy.mockRejectedValue(error);

            await FlightController.destroyFlight(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getAvailableFlight", () => {
        test("should return available flight", async () => {
            req.query = {
                rf: "1.2",
                dt: "2021-08-01T00:00:00.000Z.2021-08-01T01:00:00.000Z",
                ps: "1.2",
                sc: "Economy"
            };
            FlightValidation.querySchema.validate.mockReturnValue({ value: req.query });
            FlightService.getAvailableFlight.mockResolvedValue([data]);

            await FlightController.getAvailableFlight(req, res, next);

            expect(FlightValidation.querySchema.validate).toHaveBeenCalledTimes(1);
            expect(FlightValidation.querySchema.validate).toHaveBeenCalledWith(req.query);
            expect(FlightService.getAvailableFlight).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengambil data penerbangan yang tersedia",
                [data],
                res
            );
        });

        test('calls next with Error400 if validation fails', async () => {
            // Mock validasi gagal
            const validationError = { details: [{ message: 'Validation error' }] };
            FlightValidation.querySchema.validate.mockReturnValue({ error: validationError });

            await FlightController.getAvailableFlight(req, res, next);

            expect(FlightService.getAvailableFlight).not.toHaveBeenCalled();
            expect(res200).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(1);
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error400);
            expect(next.mock.calls[0][0].message).toBe('Validation error');
        });

        test("should return error", async () => {
            req.query = {
                rf: "1.2",
                dt: "2021-08-01T00:00:00.000Z.2021-08-01T01:00:00.000Z",
                ps: "1.2",
                sc: "Economy"
            };
            const error = new Error("error message");
            FlightValidation.querySchema.validate.mockReturnValue({ value: req.query });
            FlightService.getAvailableFlight.mockRejectedValue(error);

            await FlightController.getAvailableFlight(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

    });

});