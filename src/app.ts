import express, { Express } from 'express';
import http, { Server as HttpServer } from 'http';
import https, { Server as HttpsServer } from 'https';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

import { fastRouteLoader } from './utils/autoRouter';
import { errorHandler, notFound } from './middlewares/errorsMiddleware';
import { config } from './config';

const app: Express = express();

// ---------- Middleware & Security ----------
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
        crossOriginEmbedderPolicy: false,
    })
);

app.use(
    cors({
        origin:
            config.env.NODE_ENV === 'production'
                ? [config.env.FRONTEND_URL || 'http://localhost:3000']
                : true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
);

app.use(morgan(config.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    skip: (req) => req.path === '/health',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ---------- Routes ----------
fastRouteLoader(app);
app.use('*', notFound);
app.use(errorHandler);

// ---------- Server ----------
const httpsOptions = config.getHttpsKeys();
const server: HttpServer | HttpsServer = httpsOptions?.key && httpsOptions?.cert
    ? https.createServer(httpsOptions, app)
    : http.createServer(app);


export default server;
