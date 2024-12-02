import * as response from '../utils/response.js';

export const handleNotFound = (req, res) => {
    response.res404('Resource not found!', res);
};

export const handleOther = (err, req, res, next) => {
    if (!err) {
        return next(); 
    }
  
    const statusCode = err.statusCode || 500;
    res.statusCode = statusCode;
      
    res.status(statusCode).json({
        status: err.status || false,
        message: err.message || "Internal Server Error",
        data: err.data || null,
        // sentryId: res.sentry,
    });
};