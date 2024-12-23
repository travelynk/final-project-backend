import { Error401, Error403 } from '../utils/customError.js';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (req, res, next) => {
    try {
        // Extract Authorization header
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            throw new Error401('Token missing. Please log in again.');
        }

        // Extract token from the header
        const token = bearerToken.split('Bearer ')[1];

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const payload = {
            id: decoded.id,
            role: decoded.role,
        };

        req.user = payload;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            next(new Error401('Token expired. Please log in again.'));
        } else if (error.name === 'JsonWebTokenError') {
            next(new Error401('Invalid token. Please log in again.'));
        } else {
            next(error);
        }
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        next(new Error403('Forbidden. Admin access only.'));
    }
    next();
};
