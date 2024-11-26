import { readFileSync } from 'fs';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import * as IndexController from '../../../controllers/index.js';
import AuthRouter from './auth.route.js';

const swaggerDocument = JSON.parse(readFileSync(new URL('../../../docs/api-v1.json', import.meta.url), 'utf-8'));

export default (app) => {
    const router = Router();

    // prefix all routes
    app.use('/api/v1', router);
    app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    router.get('/', IndexController.index);

    // all main routers
    AuthRouter(router);

};