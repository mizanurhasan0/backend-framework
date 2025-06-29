import express, { Express } from 'express';
import http, { Server as HttpServer } from 'http';
import https, { Server as HttpsServer } from 'https';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Internal imports
import { fastRouteLoader } from './utils/autoRouter';
import { initSocketIO } from './sockets';
import { errorHandler, notFound } from './middlewares/errorsMiddleware';
import { config } from './config';
import { logger } from './utils/logger';

class App {
    private app: Express;
    private server!: HttpServer | HttpsServer;

    constructor() {
        this.app = express();
        this.setupSecurity();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        this.createServer();
    }

    private setupSecurity(): void {
        // Security headers
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
            crossOriginEmbedderPolicy: false,
        }));

        // CORS configuration
        this.app.use(cors({
            origin: config.env.NODE_ENV === 'production'
                ? [config.env.FRONTEND_URL || 'http://localhost:3000']
                : true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: config.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
            message: {
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
        });

        // Apply rate limiting to all routes
        this.app.use(limiter);

        // Stricter rate limiting for auth routes
        const authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // limit each IP to 5 requests per windowMs
            message: {
                error: 'Too many authentication attempts, please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
        });

        this.app.use('/auth', authLimiter);
    }

    private setupMiddleware(): void {
        // Logging middleware
        this.app.use(morgan(
            config.env.NODE_ENV === 'production' ? 'combined' : 'dev',
            {
                skip: (req) => req.path === '/health' // Skip logging health checks
            }
        ));

        // Body parsing middleware
        this.app.use(express.json({
            limit: '10mb',
            verify: (req, res, buf) => {
                // Store raw body for signature verification if needed
                (req as any).rawBody = buf;
            }
        }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use(cookieParser());

        // Static files with security headers
        this.app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
            maxAge: '1d',
            etag: true,
            setHeaders: (res, path) => {
                res.set('X-Content-Type-Options', 'nosniff');
                res.set('X-Frame-Options', 'DENY');
            }
        }));

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: config.env.NODE_ENV,
                version: process.env.npm_package_version || '1.0.0',
                memory: process.memoryUsage(),
            });
        });

        // API documentation endpoint
        this.app.get('/api-docs', (req, res) => {
            res.json({
                message: 'API Documentation',
                version: '1.0.0',
                endpoints: {
                    auth: '/auth',
                    users: '/user',
                    products: '/product',
                    categories: '/category',
                    cart: '/cart',
                    orders: '/order',
                    roles: '/role'
                },
                documentation: 'See README.md for detailed API documentation'
            });
        });
    }

    private setupRoutes(): void {
        // API routes - using fast route loader
        fastRouteLoader(this.app);

        // Catch-all for non-API routes
        this.app.use('*', notFound);
    }

    private setupErrorHandling(): void {
        this.app.use(errorHandler);
    }

    private createServer(): void {
        const httpsOptions = config.getHttpsKeys();

        if (httpsOptions?.key && httpsOptions?.cert) {
            this.server = https.createServer(httpsOptions, this.app);
            console.log(`✅ HTTPS Server configured on port ${config.env.PORT}`);
        } else {
            this.server = http.createServer(this.app);
            console.warn(`⚠️  HTTP Server configured on port ${config.env.PORT} (HTTPS not available)`);
        }
    }

    public getServer(): HttpServer | HttpsServer {
        return this.server;
    }

    public getApp(): Express {
        return this.app;
    }

    public async start(): Promise<void> {
        try {
            logger.startTimer('app-initialization');

            // Initialize Socket.IO
            logger.startTimer('socket-initialization');
            initSocketIO(this.server);
            logger.endTimer('socket-initialization');

            // Test external services
            logger.startTimer('external-services-test');
            await this.testExternalServices();
            logger.endTimer('external-services-test');

            const appTime = logger.endTimer('app-initialization');
            logger.logStartupStep(`Server ready on port ${config.env.PORT}`, appTime);
            logger.logStartupStep(`📚 API Documentation: http://localhost:${config.env.PORT}/api-docs`);
            logger.logStartupStep(`💚 Health Check: http://localhost:${config.env.PORT}/health`);
        } catch (error) {
            logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    private async testExternalServices(): Promise<void> {
        try {
            // Test Elasticsearch connection
            if (config.elasticClient) {
                await config.elasticClient.ping();
                logger.info('✅ Elasticsearch connected');
            }
        } catch (error) {
            logger.warn('❌ Elasticsearch not reachable:', error);
        }
    }
}

// Create and export app instance
const appInstance = new App();
export const app = appInstance.getApp();
export const server = appInstance.getServer();

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});
