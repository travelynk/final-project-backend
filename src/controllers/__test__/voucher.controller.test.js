import { jest, beforeEach, describe, test, expect, afterEach } from "@jest/globals";
import * as VoucherService from "../../services/voucher.service.js";
import * as VoucherValidation from "../../validations/voucher.validation.js";
import { res200 } from "../../utils/response.js";
import { Error400 } from "../../utils/customError.js";
import * as VoucherController from "../voucher.controller.js";

jest.mock("../../services/voucher.service.js");
jest.mock("../../utils/response.js");
jest.mock("../../validations/voucher.validation.js", () => ({
    getVoucherById: {
        validate: jest.fn(),
    },
    getVoucherByCodeBody: {
        validate: jest.fn(),
    },
    getVoucherByCodeParams: {
        validate: jest.fn(),
    },
    storeVoucher: {
        validate: jest.fn(),
    },
    updateVoucherBody: {
        validate: jest.fn(),
    },
    updateVoucherParams: {
        validate: jest.fn(),
    }
}));

describe("Voucher Controller", () => {
    let req, res, next, data;

    beforeEach(() => {
        req = { params: {}, body: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        data = {
            id: 1,
            code: "DISC2025",
            type: "Percentage",
            value: 10,
            minPurchase: 100,
            maxVoucher: 10,
            startDate: "2024-12-01T00:00:00.000Z",
            endDate: "2024-12-31T23:59:59.000Z",
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    describe("getVouchers", () => {
        test("should return all vouchers", async () => {
            VoucherService.getVouchers.mockResolvedValue([data]);

            await VoucherController.getVouchers(req, res, next);

            expect(VoucherService.getVouchers).toHaveBeenCalledTimes(1);
            expect(res200).toHaveBeenCalledWith(
                "Berhasil mengambil semua data voucher",
                [data],
                res
            );
        });

        test("should return error", async () => {
            const error = new Error("error message");
            VoucherService.getVouchers.mockRejectedValue(error);

            await VoucherController.getVouchers(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getVoucherById", () => {
        test("should return one voucher if validation passes", async () => {
            req.params = { id: 1 };
            VoucherValidation.getVoucherById.validate.mockReturnValueOnce({ error: null, value: { id: 1 } });
            VoucherService.getVoucherById.mockResolvedValueOnce(data);

            await VoucherController.getVoucherById(req, res, next);

            expect(VoucherValidation.getVoucherById.validate).toHaveBeenCalledWith(req.params);
            expect(VoucherService.getVoucherById).toHaveBeenCalledWith(1);
            expect(res200).toHaveBeenCalledWith("Berhasil", data, res);
        });

        test("should return validation error if params are invalid", async () => {
            req.params = { id: "invalid" };
            const validationError = { message: "Invalid ID format" };
            VoucherValidation.getVoucherById.validate.mockReturnValueOnce({ error: validationError });

            await VoucherController.getVoucherById(req, res, next);

            expect(VoucherValidation.getVoucherById.validate).toHaveBeenCalledWith(req.params);
            expect(next).toHaveBeenCalledWith(new Error400(validationError.message));
        });

        test("should return error if voucher service throws an error", async () => {
            req.params = { id: 1 };
            const serviceError = new Error("Service error");
            VoucherValidation.getVoucherById.validate.mockReturnValueOnce({ error: null, value: { id: 1 } });
            VoucherService.getVoucherById.mockRejectedValueOnce(serviceError);

            await VoucherController.getVoucherById(req, res, next);

            expect(VoucherValidation.getVoucherById.validate).toHaveBeenCalledWith(req.params);
            expect(VoucherService.getVoucherById).toHaveBeenCalledWith(1);
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });

    describe("Voucher Controller - getVoucherByCode", () => {
        test("should return error when only validationBody fails", async () => {
            req.params = { code: "DISC2025" };
            req.body = { totalPrice: "invalid" };

            const validationBodyError = { message: "Invalid total price" };
            const validationParamsSuccess = { error: null, value: req.params };

            VoucherValidation.getVoucherByCodeParams.validate.mockReturnValue(validationParamsSuccess);
            VoucherValidation.getVoucherByCodeBody.validate.mockReturnValue({
                error: validationBodyError,
                value: req.body,
            });

            await VoucherController.getVoucherByCode(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error400("Invalid total price"));
        });


        test("should return error when only validationParams fails", async () => {
            req.params = { code: "INVALIDCODE" };
            req.body = { totalPrice: 200 };

            const validationParamsError = { message: "Invalid code" };
            const validationBodySuccess = { error: null, value: req.body };

            VoucherValidation.getVoucherByCodeParams.validate.mockReturnValue({
                error: validationParamsError,
                value: req.params,
            });
            VoucherValidation.getVoucherByCodeBody.validate.mockReturnValue(validationBodySuccess);

            await VoucherController.getVoucherByCode(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error400("Invalid code"));
        });


        test("should return combined error message when both validationParams and validationBody fail", async () => {
            req.params = { code: "INVALIDCODE" };
            req.body = { totalPrice: "invalid" };

            const validationParamsError = { message: "Invalid code" };
            const validationBodyError = { message: "Invalid total price" };

            VoucherValidation.getVoucherByCodeParams.validate.mockReturnValue({
                error: validationParamsError,
                value: req.params,
            });
            VoucherValidation.getVoucherByCodeBody.validate.mockReturnValue({
                error: validationBodyError,
                value: req.body,
            });

            await VoucherController.getVoucherByCode(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error400("Invalid code, Invalid total price"));
        });


        test("should return voucher data if validation passes and voucher exists", async () => {
            VoucherValidation.getVoucherByCodeParams.validate.mockReturnValue({
                error: null,
                value: { code: "DISC2025" },
            });
            VoucherValidation.getVoucherByCodeBody.validate.mockReturnValue({
                error: null,
                value: { totalPrice: 200 },
            });
            VoucherService.getVoucherByCode.mockResolvedValue(data);

            await VoucherController.getVoucherByCode(req, res, next);

            expect(VoucherValidation.getVoucherByCodeParams.validate).toHaveBeenCalledWith(req.params);
            expect(VoucherValidation.getVoucherByCodeBody.validate).toHaveBeenCalledWith(req.body);
            expect(VoucherService.getVoucherByCode).toHaveBeenCalledWith("DISC2025", 200);
            expect(res200).toHaveBeenCalledWith("Berhasil", data, res);
        });

        test("should return validation error if params or body are invalid", async () => {
            VoucherValidation.getVoucherByCodeParams.validate.mockReturnValue({
                error: { message: "Invalid code" },
            });
            VoucherValidation.getVoucherByCodeBody.validate.mockReturnValue({
                error: null,
            });

            await VoucherController.getVoucherByCode(req, res, next);

            expect(VoucherValidation.getVoucherByCodeParams.validate).toHaveBeenCalledWith(req.params);
            expect(next).toHaveBeenCalledWith(new Error400("Invalid code"));
        });

        test("should handle service errors gracefully", async () => {
            const serviceError = new Error("Service error");
            VoucherValidation.getVoucherByCodeParams.validate.mockReturnValue({
                error: null,
                value: { code: "DISC2025" },
            });
            VoucherValidation.getVoucherByCodeBody.validate.mockReturnValue({
                error: null,
                value: { totalPrice: 200 },
            });
            VoucherService.getVoucherByCode.mockRejectedValue(serviceError);

            await VoucherController.getVoucherByCode(req, res, next);

            expect(VoucherValidation.getVoucherByCodeParams.validate).toHaveBeenCalledWith(req.params);
            expect(VoucherValidation.getVoucherByCodeBody.validate).toHaveBeenCalledWith(req.body);
            expect(VoucherService.getVoucherByCode).toHaveBeenCalledWith("DISC2025", 200);
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });

    describe("Voucher Controller - storeVoucher", () => {
        test("should store voucher if validation passes", async () => {
            VoucherValidation.storeVoucher.validate.mockReturnValue({
                error: null,
                value: req.body,
            });
            VoucherService.storeVoucher.mockResolvedValue(data);

            await VoucherController.storeVoucher(req, res, next);

            expect(VoucherValidation.storeVoucher.validate).toHaveBeenCalledWith(req.body);
            expect(VoucherService.storeVoucher).toHaveBeenCalledWith(req.body);
            expect(res200).toHaveBeenCalledWith("Berhasil", data, res);
        });

        test("should return validation error if request body is invalid", async () => {
            const validationError = { message: "Invalid input data" };
            VoucherValidation.storeVoucher.validate.mockReturnValue({
                error: validationError,
            });

            await VoucherController.storeVoucher(req, res, next);

            expect(VoucherValidation.storeVoucher.validate).toHaveBeenCalledWith(req.body);
            expect(next).toHaveBeenCalledWith(new Error400(validationError.message));
        });

        test("should handle service errors gracefully", async () => {
            const serviceError = new Error("Service error");
            VoucherValidation.storeVoucher.validate.mockReturnValue({
                error: null,
                value: req.body,
            });
            VoucherService.storeVoucher.mockRejectedValue(serviceError);

            await VoucherController.storeVoucher(req, res, next);

            expect(VoucherValidation.storeVoucher.validate).toHaveBeenCalledWith(req.body);
            expect(VoucherService.storeVoucher).toHaveBeenCalledWith(req.body);
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });

    describe("Voucher Controller - updateVoucher", () => {
        test("should return error when only validationBody fails", async () => {
            req.params = { code: "DISC2025" };
            req.body = { totalPrice: "invalid" };

            const validationBodyError = { message: "Invalid total price" };
            const validationParamsSuccess = { error: null, value: req.params };

            VoucherValidation.updateVoucherParams.validate.mockReturnValue(validationParamsSuccess);
            VoucherValidation.updateVoucherBody.validate.mockReturnValue({
                error: validationBodyError,
                value: req.body,
            });

            await VoucherController.updateVoucher(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error400("Invalid total price"));
        });


        test("should return error when only validationParams fails", async () => {
            req.params = { code: "INVALIDCODE" };
            req.body = { totalPrice: 200 };

            const validationParamsError = { message: "Invalid code" };
            const validationBodySuccess = { error: null, value: req.body };

            VoucherValidation.updateVoucherParams.validate.mockReturnValue({
                error: validationParamsError,
                value: req.params,
            });
            VoucherValidation.updateVoucherBody.validate.mockReturnValue(validationBodySuccess);

            await VoucherController.updateVoucher(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error400("Invalid code"));
        });


        test("should return combined error message when both validationParams and validationBody fail", async () => {
            req.params = { code: "INVALIDCODE" };
            req.body = { totalPrice: "invalid" };

            const validationParamsError = { message: "Invalid code" };
            const validationBodyError = { message: "Invalid total price" };

            VoucherValidation.updateVoucherParams.validate.mockReturnValue({
                error: validationParamsError,
                value: req.params,
            });
            VoucherValidation.updateVoucherBody.validate.mockReturnValue({
                error: validationBodyError,
                value: req.body,
            });

            await VoucherController.updateVoucher(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error400("Invalid code, Invalid total price"));
        });



        test("should update voucher if validation passes", async () => {
            VoucherValidation.updateVoucherBody.validate.mockReturnValue({
                error: null,
                value: req.body,
            });
            VoucherValidation.updateVoucherParams.validate.mockReturnValue({
                error: null,
                value: req.params,
            });
            VoucherService.updateVoucher.mockResolvedValue(data);

            await VoucherController.updateVoucher(req, res, next);

            expect(VoucherValidation.updateVoucherBody.validate).toHaveBeenCalledWith(req.body);
            expect(VoucherValidation.updateVoucherParams.validate).toHaveBeenCalledWith(req.params);
            expect(VoucherService.updateVoucher).toHaveBeenCalledWith(req.params.code, req.body);
            expect(res200).toHaveBeenCalledWith("Berhasil", data, res);
        });

        test("should return validation error if body or params are invalid", async () => {
            const validationErrorParams = { message: "Invalid code format" };
            const validationErrorBody = { message: "Invalid totalPrice" };

            VoucherValidation.updateVoucherParams.validate.mockReturnValue({
                error: validationErrorParams,
                value: { code: "invalidCode" },
            });
            VoucherValidation.updateVoucherBody.validate.mockReturnValue({
                error: validationErrorBody,
                value: { totalPrice: "invalidPrice" },
            });

            await VoucherController.updateVoucher(req, res, next);

            expect(VoucherValidation.updateVoucherParams.validate).toHaveBeenCalledWith(req.params);
            expect(VoucherValidation.updateVoucherBody.validate).toHaveBeenCalledWith(req.body);
            expect(next).toHaveBeenCalledWith(new Error400("Invalid code format, Invalid totalPrice"));
        });


        test("should handle service errors gracefully", async () => {
            const serviceError = new Error("Service error");
            VoucherValidation.updateVoucherBody.validate.mockReturnValue({
                error: null,
                value: req.body,
            });
            VoucherValidation.updateVoucherParams.validate.mockReturnValue({
                error: null,
                value: req.params,
            });
            VoucherService.updateVoucher.mockRejectedValue(serviceError);

            await VoucherController.updateVoucher(req, res, next);

            expect(VoucherValidation.updateVoucherBody.validate).toHaveBeenCalledWith(req.body);
            expect(VoucherValidation.updateVoucherParams.validate).toHaveBeenCalledWith(req.params);
            expect(VoucherService.updateVoucher).toHaveBeenCalledWith(req.params.code, req.body);
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });
});