import * as response from '../utils/response.js';
import { Error400 } from '../utils/customError.js';

export const handleNotFound = (req, res) => {
    response.res404('Resource not found!', res);
};

export const handleOther = (err, req, res, next) => {
    if (err) {
        if (err instanceof Error400) {
            console.log('Client error: ' + err.message);
            response.res400(err.message, res);
        } else {
            console.log('Server error: ' + err.message);
            response.res500(res);
        }
    } else {
        next();
    }
};

// nanti sesuaiin lagi aja ini contoh aja