import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import * as UserController from '../user.controller.js';
import * as UserService from '../../services/user.service.js';
import * as UserValidation from '../../validations/user.validation.js';
import { res200 } from '../../utils/response.js';
import { Error400, Error404 } from '../../utils/customError.js';

jest.mock("../../services/user.service.js");
jest.mock("../../utils/response.js");
jest.mock("../../validations/user.validation.js");

describe("User Controller", () => {
    let req, res, next, data;

    beforeEach(() => {
        req = {};
        res = {};
        next = jest.fn();
        data = {
            "id": 1,
            "email": "newuser@example.com",
            "role": "buyer"
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getUsers", () => {
        it("should return all users", async () => {
            UserService.getAll.mockResolvedValue([data]);

            await UserController.getUsers(req, res, next);

            expect(UserService.getAll).toHaveBeenCalledTimes(1);
            expect(res200).toBeCalledWith(
                'Berhasil mengambil semua data user',
                [data],
                res
            );
        });

        it("should return error", async () => {
            const error = new Error("error message");
            UserService.getAll.mockRejectedValue(error);

            await UserController.getUsers(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getUser", () => {
        it("should return one user", async () => {
            req.params = { id: 1 };
            UserService.getOne.mockResolvedValue(data);

            await UserController.getUser(req, res, next);

            expect(UserService.getOne).toHaveBeenCalledTimes(1);
            expect(res200).toBeCalledWith(
                'Berhasil mengambil data user',
                data,
                res
            );
        });

        it("should return error 404", async () => {
            req.params = { id: 1 };
            UserService.getOne.mockResolvedValue(null);

            await UserController.getUser(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error404('Data user tidak ditemukan'));
        });

        it("should return error", async () => {
            req.params = { id: 1 };
            const error = new Error("error message");
            UserService.getOne.mockRejectedValue(error);

            await UserController.getUser(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("updateRoleUser", () => {
        it("should update the user's role if validation passes", async () => {
            req.params = { id: 1 };
            req.body = { role: 'admin' };

            UserValidation.schemaUpdateRole.validate.mockReturnValue({ value: req.body });
            UserService.update.mockResolvedValue(data);

            await UserController.updateRoleUser(req, res, next);

            expect(UserService.update).toHaveBeenCalledTimes(1);
            expect(res200).toBeCalledWith(
                'Berhasil mengubah role user',
                data,
                res
            );
        });

        it("should return error 404 if validation fails", async () => {
            const validationError = { details: [{ message: "Invalid Role" }] };
            UserValidation.schemaUpdateRole.validate.mockReturnValue({ error: validationError });

            await UserController.updateRoleUser(req, res, next);

            expect(UserService.update).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(new Error400("Invalid Role"));
        });

        it("should return error 404 if user not found", async () => {
            req.params = { id: 99 };
            req.body = { role: "admin" };

            UserValidation.schemaUpdateRole.validate.mockReturnValue({ error: null, value: req.body });
            UserService.update.mockRejectedValue({ code: "P2025" });

            await UserController.updateRoleUser(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error404("Data user tidak ditemukan"));
        });

        it("should return error", async () => {
            req.params = { id: 1 };
            req.body = { role: "admin" };

            const error = new Error("error message");
            UserService.update.mockRejectedValue(error);

            await UserController.updateRoleUser(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("deleteUser", () => {
        it("should delete the user", async () => {
            req.user = { id: 1 };
            UserService.destroy.mockResolvedValue();

            await UserController.deleteUser(req, res, next);

            expect(UserService.destroy).toHaveBeenCalledTimes(1);
            expect(res200).toBeCalledWith(
                'Berhasil menghapus user',
                null,
                res
            );
        });

        it("should return error 404 if user not found", async () => {
            req.user = { id: 99 };
            UserService.destroy.mockRejectedValue({ code: "P2025" });

            await UserController.deleteUser(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error404("Data user tidak ditemukan"));
        });

        it("should return error", async () => {
            req.user = { id: 1 };
            const error = new Error("error message");
            UserService.destroy.mockRejectedValue(error);

            await UserController.deleteUser(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});