import { env } from './env';

export const mail = {
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
    },
    // Additional SMTP options
    pool: true, // use pooled connection
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14, // limit to 14 emails per second
    // TLS options
    tls: {
        rejectUnauthorized: env.NODE_ENV === 'production',
    },
    // DKIM and other security options
    dkim: {
        domainName: env.EMAIL_HOST.split('.').slice(-2).join('.'),
        keySelector: 'default',
        privateKey: process.env.DKIM_PRIVATE_KEY,
    },
};
