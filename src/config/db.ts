import mongoose from 'mongoose';
import { env } from './env';

// Optimized database configuration for Mongoose 7.0.0
export const db = {
    uri: env.MONGO_URI,
    options: {
        // Connection pool settings for better performance
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,

        // Timeout settings for faster failure detection
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,

        // Buffer settings for better performance
        bufferCommands: false,

        // Write concern for better performance
        writeConcern: {
            w: 1,
            j: false
        },

        // Read preference for better performance
        readPreference: 'primary',

        // Retry settings
        retryWrites: true,
        retryReads: true,

        // Compression
        compressors: ['zlib' as const],

        // SSL settings (if needed)
        ssl: env.NODE_ENV === 'production',
        sslValidate: env.NODE_ENV === 'production',
    },
    // Connection event handlers
    events: {
        connected: () => {
            console.log('✅ MongoDB connected');
        },
        error: (err: Error) => {
            console.error('❌ MongoDB connection error:', err);
        },
        disconnected: () => {
            console.log('⚠️ MongoDB disconnected');
        },
        reconnected: () => {
            console.log('🔄 MongoDB reconnected');
        }
    },
};
