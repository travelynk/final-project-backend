import * as response from '../utils/response.js';
// import { Error400 } from '../utils/customError.js';

export const handleNotFound = (req, res) => {
    response.res404('Resource not found!', res);
};

export const handleOther = (err, req, res, next) => {
    if (!err) {
        return next(); 
    }
    const statusCode = err.statusCode || 500;
    res.statusCode = statusCode;

    // if (statusCode >= 500 && statusCode < 600) { 
    //     Sentry.withScope((scope) => {
    //         scope.setTag("status_code", statusCode);
    //         Sentry.captureException(err);
    //     });
    // }

    res.status(statusCode).json({
        status: err.status || false,
        message: err.message || "Internal Server Error",
        data: err.data || null,
        // sentryId: res.sentry,
    });
};

// nanti sesuaiin lagi aja ini contoh aja