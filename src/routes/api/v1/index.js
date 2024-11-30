import { readFileSync } from 'fs';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import * as IndexController from '../../../controllers/index.js';
import authRouter from './auth.route.js';
import profileRouter from './profile.route.js';
import countryRouter from './country.route.js';
import cityRoute from './city.route.js';
import airportRoute from './airport.route.js';
import terminalRoute from './terminal.route.js';
import airlineRoute from './airline.route.js';
import flightRoute from './flight.route.js';
import seatRouter from './seat.route.js';

const swaggerDocument = JSON.parse(readFileSync(new URL('../../../docs/api-v1.json', import.meta.url), 'utf-8'));

export default (app) => {
    const router = Router();

    // prefix all routes
    app.use('/api/v1', router);
    app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    router.get('/', IndexController.index);

    // all main routers
    authRouter(router);
    profileRouter(router);
    countryRouter(router);
    cityRoute(router);
    airportRoute(router);
    terminalRoute(router);
    airlineRoute(router);
    flightRoute(router);
    seatRouter(router);

};