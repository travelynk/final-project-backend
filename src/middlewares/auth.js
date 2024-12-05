import { res401, res500 } from '../utils/response.js';
import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    try {
        // Extract Authorization header
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return res401('Token expired. Please log in again.', res); 
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
            return res401('Token expired. Please log in again.', res); 
        } else if (error.name === 'JsonWebTokenError') {
            return res401('Invalid token. Please log in again.', res); 
        } else {
            // console.error(`Authentication error: ${error.message}`);
            return res500('Internal Server Error', res); 
        }
    }
};

export default authMiddleware;
