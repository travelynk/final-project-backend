import * as response from '../utils/response.js';
import * as SeatValidation from '../validations/seat.validation.js';
import * as SeatService from '../services/seat.service.js';
import { Error400 } from '../utils/customError.js';


export const getSeatsByFlightID = async (req, res, next) => {
    try {

        const { error, value } = SeatValidation.getSeatsByFlightID.validate(req.params);

        if (error) {
            throw new Error400(error.message);
        };

        const { flightId } = value;

        const seats = await SeatService.getSeatsByFlightID(flightId);
        response.res200('Berhasil', seats, res);
    } catch (error) {
        next(error);
    }
}
