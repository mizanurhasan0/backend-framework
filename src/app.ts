import express from 'express';
import http, { Server as HttpServer } from 'http';
import https, { Server as HttpsServer } from "https";
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
import { errorHandler, notFound } from './middlewares/errorsMiddleware';
import { config } from './config';

dotenv.config();
const PORT = config.env.PORT || 3000;

const app = express();
const httpsOptions = config.getHttpsKeys();

let server: HttpServer | HttpsServer;
if (httpsOptions) {
    server = https.createServer(httpsOptions, app);
    console.log(`✅ HTTPS Server ready on https://localhost:${PORT}`);
} else {
    server = http.createServer(app);
    console.log(`⚠️  HTTP Server running on http://localhost:${PORT}`);
}

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
