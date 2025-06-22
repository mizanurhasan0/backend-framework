import express from 'express';
import http from 'http';
// import https from 'https';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import formData from 'express-form-data';
// import fs from 'fs';
// Load Routes Automatically
import { autoLoadRoutes } from './utils/autoRouter';
import { initSocketIO } from './sockets';
import { errorHandler, notFound } from './middlewares/ErrorsMiddleware';

dotenv.config();

const app = express();
const server = http.createServer(app);
initSocketIO(server); // <--- initialize socket with server

// Middleware
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(formData.parse());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


autoLoadRoutes(app);
// After all routes
app.use(notFound);
app.use(errorHandler);


export { app, server };
