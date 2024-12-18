import multer from "multer";
import { Error400 } from "../utils/customError.js";

const allowedMimesTypes = ["image/jpeg", "image/png", "image/png"];
const MAX_FILE_SIZE = 1024 * 1024 * 3; // 3MB

export const fileFilter = (req, file, cb) => {
    if (allowedMimesTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const err = new Error400(`Hanya ${allowedMimesTypes.join(", ")} yang diizinkan untuk diunggah`);
        cb(err, false);
    }
};

export const uploadImage = () => {
    return multer({
        fileFilter,
        limits: {
            fileSize: MAX_FILE_SIZE,
        },
    });
};

export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return next(new Error400('Ukuran file terlalu besar. Ukuran maksimum adalah 3MB.'));
    } else if (err) {
        return next(err);
    }
    next();
};