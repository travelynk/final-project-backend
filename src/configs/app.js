import express, { json, urlencoded } from "express";
import morgan from 'morgan';
import cors from 'cors';
import apiV1 from '../routes/api/v1/index.js';
import * as ErrorHandler from '../middlewares/errorHandler.js';
import path from 'path';
const __dirname = path.resolve();

export const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(morgan('dev'));

// Set engine view ke EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './src/views'));

apiV1(app);



app.use(ErrorHandler.handleNotFound);
app.use(ErrorHandler.handleOther);