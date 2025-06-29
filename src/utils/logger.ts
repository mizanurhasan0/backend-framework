import { config } from '../config';

// Performance monitoring
const performanceMarks = new Map<string, number>();

export const logger = {
    info: (message: string, ...args: any[]) => {
        if (config.env.LOG_LEVEL === 'info' || config.env.LOG_LEVEL === 'debug') {
            console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
        }
    },

    warn: (message: string, ...args: any[]) => {
        if (['warn', 'info', 'debug'].includes(config.env.LOG_LEVEL)) {
            console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
        }
    },

    error: (message: string, ...args: any[]) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
    },

    debug: (message: string, ...args: any[]) => {
        if (config.env.LOG_LEVEL === 'debug') {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
        }
    },

    // Performance monitoring methods
    startTimer: (name: string) => {
        performanceMarks.set(name, Date.now());
        logger.debug(`⏱️ Started timer: ${name}`);
    },

    endTimer: (name: string) => {
        const startTime = performanceMarks.get(name);
        if (startTime) {
            const duration = Date.now() - startTime;
            logger.info(`⏱️ ${name} completed in ${duration}ms`);
            performanceMarks.delete(name);
            return duration;
        }
        logger.warn(`⏱️ Timer ${name} not found`);
        return 0;
    },

    // Startup performance tracking
    logStartupStep: (step: string, duration?: number) => {
        if (duration) {
            logger.info(`🚀 ${step} (${duration}ms)`);
        } else {
            logger.info(`🚀 ${step}`);
        }
    },

    // Memory usage logging
    logMemoryUsage: () => {
        const usage = process.memoryUsage();
        logger.debug('Memory Usage:', {
            rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(usage.external / 1024 / 1024)}MB`
        });
    }
}; 