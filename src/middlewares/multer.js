import multer from "multer";
import { Error400 } from "../utils/custom_error.js";

const allowedMimesTypes = ["image/jpeg", "image/png", "image/png"];
const MAX_FILE_SIZE = 1024 * 1024 * 3; // 3MB

const fileFilter = (req, file, cb) => {
    if (allowedMimesTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const err = new Error400(`Only ${allowedMimesTypes.join(", ")} are allowed to upload`);
        cb(err, false);
    }
};

const uploadImage = () => {
    return multer({
        fileFilter,
        limits: {
            fileSize: MAX_FILE_SIZE,
        },
    });
};

export const imageHandler = () => {
    const upload = uploadImage();

    return (req, res, next) => {
        upload.single('image')(req, res, (err) => {
            if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
                return next(new Error400('File size is too large. Maximum size is 3MB.'));
            } else if (err) {
                return next(err);
            }
            next();
        });
    };
};