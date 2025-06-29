// server.ts
import mongoose, { ConnectOptions } from 'mongoose';
import server from './app';
import { logger } from './utils/logger';
import { config } from './config';

const port = config.env.PORT;

const startServer = async () => {
  try {
    server.listen(port, async () => {
      logger.info(`🚀 Server running on port ${port}`);
      await mongoose.connect(config.db.uri, config.db.options as ConnectOptions);
      logger.info('✅ MongoDB connected');
    });
    // ---------- Graceful Shutdown ----------
    ['SIGINT', 'SIGTERM'].forEach(signal =>
      process.on(signal, () => {
        console.log(`${signal} received. Shutting down gracefully...`);
        server.close(() => {
          console.log('✅ Server closed');
          process.exit(0);
        });
      })
    );

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
