import mongoose, { ConnectOptions } from 'mongoose';
import { server } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { getMongoUriInfo } from './utils/mongoTest';

class Server {
  private static instance: Server;
  private isShuttingDown = false;
  private startupTime = Date.now();

  private constructor() { }

  static getInstance(): Server {
    if (!Server.instance) {
      Server.instance = new Server();
    }
    return Server.instance;
  }

  async start(): Promise<void> {
    try {
      logger.startTimer('total-startup');
      logger.logStartupStep('Starting server...');

      // Analyze MongoDB URI for debugging
      // getMongoUriInfo();

      // Connect to MongoDB with optimized settings
      logger.startTimer('database-connection');
      await this.connectToDatabase();
      const dbTime = logger.endTimer('database-connection');
      logger.logStartupStep('Database connected', dbTime);

      // Start the server
      logger.startTimer('server-startup');
      await this.startServer();
      const serverTime = logger.endTimer('server-startup');
      logger.logStartupStep('Server started', serverTime);

      // Setup graceful shutdown
      this.setupGracefulShutdown();

      const totalTime = logger.endTimer('total-startup');
      logger.logStartupStep(`Server ready on port ${config.env.PORT}`, totalTime);

      // Log memory usage
      logger.logMemoryUsage();

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private async connectToDatabase(): Promise<void> {
    try {
      logger.info('🔌 Connecting to MongoDB...');

      // Log connection options for debugging
      logger.debug('MongoDB connection options:', {
        maxPoolSize: config.db.options.maxPoolSize,
        serverSelectionTimeoutMS: config.db.options.serverSelectionTimeoutMS,
        connectTimeoutMS: config.db.options.connectTimeoutMS,
        bufferCommands: config.db.options.bufferCommands,
        // ssl: config.db.options.ssl,
        // sslValidate: config.db.options.sslValidate,
      });

      // Use optimized MongoDB connection options from config
      await mongoose.connect(config.db.uri, config.db.options as ConnectOptions);

      // Setup MongoDB connection event handlers
      mongoose.connection.on('connected', config.db.events.connected);
      mongoose.connection.on('error', config.db.events.error);
      mongoose.connection.on('disconnected', config.db.events.disconnected);
      mongoose.connection.on('reconnected', config.db.events.reconnected);

      logger.info('✅ MongoDB connected successfully');
    } catch (error) {
      logger.error('❌ MongoDB connection failed:', error);

      // Provide more detailed error information
      if (error instanceof Error) {
        logger.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 3).join('\n')
        });
      }

      throw error;
    }
  }

  private async startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        server.listen(config.env.PORT, () => {
          logger.info(`🌐 Server listening on port ${config.env.PORT}`);
          resolve();
        });

        server.on('error', (error: NodeJS.ErrnoException) => {
          if (error.syscall !== 'listen') {
            reject(error);
            return;
          }

          switch (error.code) {
            case 'EACCES':
              logger.error(`Port ${config.env.PORT} requires elevated privileges`);
              break;
            case 'EADDRINUSE':
              logger.error(`Port ${config.env.PORT} is already in use`);
              break;
            default:
              logger.error('Server error:', error);
          }
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      if (this.isShuttingDown) {
        return;
      }

      this.isShuttingDown = true;
      logger.info(`Received ${signal}, starting graceful shutdown...`);

      try {
        // Close server with timeout
        const serverClosePromise = new Promise<void>((resolve) => {
          server.close(() => {
            logger.info('HTTP server closed');
            resolve();
          });
        });

        // Close MongoDB connection
        let mongoClosePromise = Promise.resolve();
        if (mongoose.connection.readyState === 1) {
          mongoClosePromise = mongoose.connection.close().then(() => {
            logger.info('MongoDB connection closed');
          });
        }

        // Wait for both to complete with timeout
        await Promise.race([
          Promise.all([serverClosePromise, mongoClosePromise]),
          new Promise(resolve => setTimeout(resolve, 10000)) // 10 second timeout
        ]);

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Handle different shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });
  }
}

// Start the server
const serverInstance = Server.getInstance();
serverInstance.start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
