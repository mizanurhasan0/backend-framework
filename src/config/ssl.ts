import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

interface SSLOptions {
    key: string;
    cert: string;
    ca?: string;
}

class SSLManager {
    private static instance: SSLManager;
    private sslOptions: SSLOptions | null = null;
    private lastCheck = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    private constructor() { }

    static getInstance(): SSLManager {
        if (!SSLManager.instance) {
            SSLManager.instance = new SSLManager();
        }
        return SSLManager.instance;
    }

    getHttpsKeys(): SSLOptions | null {
        const now = Date.now();

        // Return cached result if still valid
        if (this.sslOptions && (now - this.lastCheck) < this.CACHE_DURATION) {
            return this.sslOptions;
        }

        try {
            const sslPath = path.join(process.cwd(), 'ssl');
            const keyPath = path.join(sslPath, 'key.pem');
            const certPath = path.join(sslPath, 'cert.pem');
            const caPath = path.join(sslPath, 'ca.pem');

            // Check if SSL directory exists
            if (!fs.existsSync(sslPath)) {
                logger.warn('SSL directory not found, falling back to HTTP');
                return null;
            }

            // Check if key and cert files exist
            if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
                logger.warn('SSL key or certificate file not found, falling back to HTTP');
                return null;
            }

            const key = fs.readFileSync(keyPath, 'utf-8');
            const cert = fs.readFileSync(certPath, 'utf-8');

            const sslOptions: SSLOptions = { key, cert };

            // Add CA if exists
            if (fs.existsSync(caPath)) {
                sslOptions.ca = fs.readFileSync(caPath, 'utf-8');
            }

            // Validate SSL files
            this.validateSSLFiles(sslOptions);

            this.sslOptions = sslOptions;
            this.lastCheck = now;

            logger.info('SSL configuration loaded successfully');
            return sslOptions;

        } catch (error) {
            logger.error('Failed to load SSL configuration:', error);
            return null;
        }
    }

    private validateSSLFiles(sslOptions: SSLOptions): void {
        // Basic validation - check if files contain expected content
        if (!sslOptions.key.includes('-----BEGIN PRIVATE KEY-----') &&
            !sslOptions.key.includes('-----BEGIN RSA PRIVATE KEY-----')) {
            throw new Error('Invalid private key format');
        }

        if (!sslOptions.cert.includes('-----BEGIN CERTIFICATE-----')) {
            throw new Error('Invalid certificate format');
        }

        if (sslOptions.ca && !sslOptions.ca.includes('-----BEGIN CERTIFICATE-----')) {
            throw new Error('Invalid CA certificate format');
        }
    }

    clearCache(): void {
        this.sslOptions = null;
        this.lastCheck = 0;
    }
}

export const getHttpsKeys = (): SSLOptions | null => {
    return SSLManager.getInstance().getHttpsKeys();
};
