import * as response from '../utils/response.js';

export const handleNotFound = (req, res) => {
    response.res404('Resource not found!', res);
};

export const handleOther = (err, req, res, next) => {
    if (!err) {
        return next();
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode);

    if (process.env.NODE_ENV === 'development') {
        console.log(err.message);
    } else if (statusCode === 500) {
        console.log(err.message);
    }

    const message = statusCode === 500 ? 'Internal Server Error' : err.message;

    res.json({
        status: err.status || false,
        message,
        data: err.data || null,
    });
};
