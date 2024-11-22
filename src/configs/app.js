import express, { json, urlencoded } from "express";
import morgan from 'morgan';
import apiV1 from '../routes/api/v1/index.js';
import * as ErrorHandler from '../middlewares/errorHandler.js';

export const app = express();

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(morgan('dev'));

apiV1(app);

app.use(ErrorHandler.handleNotFound);
app.use(ErrorHandler.handleOther);