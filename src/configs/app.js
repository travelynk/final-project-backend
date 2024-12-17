import { readFileSync } from 'fs';
import swaggerUi from 'swagger-ui-express';
import express, { json, urlencoded } from "express";
import morgan from 'morgan';
import cors from 'cors';
import apiV1 from '../routes/api/v1/index.js';
import * as ErrorHandler from '../middlewares/errorHandler.js';
import path from 'path';
const __dirname = path.resolve();

export const app = express();
const swaggerDocument = JSON.parse(readFileSync(new URL('../docs/api-v1.json', import.meta.url), 'utf-8'));

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(morgan('dev'));

// Set engine view ke EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './src/views'));

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

apiV1(app);



app.use(ErrorHandler.handleNotFound);
app.use(ErrorHandler.handleOther);