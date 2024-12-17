import { jest, describe, beforeEach, afterEach, it, expect } from "@jest/globals";
import { fileFilter, uploadImage, handleUploadError } from "../multer.js";
import multer from "multer";
import { Error400 } from "../../utils/customError.js";

jest.mock("multer");

describe("Multer Middleware", () => {
    let req;
    let res;
    let next;

    const allowedMimesTypes = ["image/jpeg", "image/png", "image/png"];

    beforeEach(() => {
        req = {};
        res = {};
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("fileFilter", () => {
        it("should call cb with Error400 if file type is not allowed", () => {
            const file = {
                mimetype: "image/gif",
            };
            const cb = jest.fn();
            fileFilter(req, file, cb);
            expect(cb).toHaveBeenCalledWith(new Error400(`Hanya ${allowedMimesTypes.join(", ")} yang diizinkan untuk diunggah`), false);
        });

        it("should call cb with null if file type is allowed", () => {
            const file = {
                mimetype: "image/jpeg",
            };
            const cb = jest.fn();
            fileFilter(req, file, cb);
            expect(cb).toHaveBeenCalledWith(null, true);
        });

    });

    describe("uploadImage", () => {
        it("should return multer object", () => {
            const destination = "public/images/profiles";
            const multerObject = uploadImage(destination);
            expect(multer).toHaveBeenCalled(multerObject);
        });

        it("should return Error 400 if file type is not allowed", () => {
            multer.mockImplementation(() => ({
                fileFilter: (req, file, cb) => {
                    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
                        return cb(new Error400(`Hanya image/jpeg, image/png yang diizinkan untuk diunggah`), false);
                    }
                    cb(null, true);
                }
            }));
            const file = {
                mimetype: "image/gif",
            };
            const cb = jest.fn();
            const multerObject = uploadImage("public/images/profiles");
            multerObject.fileFilter(req, file, cb);
            expect(cb).toHaveBeenCalledWith(new Error400(`Hanya image/jpeg, image/png yang diizinkan untuk diunggah`), false);
        });

    });

    describe("handleUploadError", () => {
        it("should call next with Error400 if error is instance of MulterError and code is LIMIT_FILE_SIZE", () => {
            const err = new multer.MulterError("LIMIT_FILE_SIZE");
            err.code = "LIMIT_FILE_SIZE";
            handleUploadError(err, req, res, next);
            expect(next).toHaveBeenCalledWith(new Error400("Ukuran file terlalu besar. Ukuran maksimum adalah 3MB."));
        });

        it("should call next with error if error is not instance of MulterError", () => {
            const err = new Error("error");
            handleUploadError(err, req, res, next);
            expect(next).toHaveBeenCalledWith(err);
        });

        it("should call next if no error", () => {
            handleUploadError(null, req, res, next);
            expect(next).toHaveBeenCalled();
        });

    });

});