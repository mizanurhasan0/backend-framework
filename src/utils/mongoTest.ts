import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from './logger';

export const testMongoConnection = async (): Promise<boolean> => {
    try {
        logger.info('🧪 Testing MongoDB connection...');

        // Test with minimal options first
        const testOptions = {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        };

        await mongoose.connect(config.db.uri, testOptions);
        logger.info('✅ MongoDB connection test successful');

        // Disconnect after test
        await mongoose.disconnect();
        logger.info('🔌 MongoDB test connection closed');

        return true;
    } catch (error) {
        logger.error('❌ MongoDB connection test failed:', error);
        return false;
    }
};

export const getMongoUriInfo = (): void => {
    const uri = config.db.uri;
    logger.info('🔍 MongoDB URI Analysis:');
    logger.info(`   URI length: ${uri.length} characters`);
    logger.info(`   Contains 'mongodb://': ${uri.includes('mongodb://')}`);
    logger.info(`   Contains 'mongodb+srv://': ${uri.includes('mongodb+srv://')}`);
    logger.info(`   Contains '@': ${uri.includes('@')}`);
    logger.info(`   Contains 'localhost': ${uri.includes('localhost')}`);

    // Don't log the full URI for security
    const sanitizedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    logger.info(`   Sanitized URI: ${sanitizedUri}`);
}; 