import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default('3000'),
    MONGO_URI: z.string().min(1, 'MongoDB URI is required'),
    JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(10).optional(),
    EMAIL_HOST: z.string().min(1, 'Email host is required'),
    EMAIL_PORT: z.string().transform(Number).default('587'),
    EMAIL_USER: z.string().min(1, 'Email user is required'),
    EMAIL_PASS: z.string().min(1, 'Email password is required'),
    ALLOWED_ORIGINS: z.string().optional(),
    ELASTIC_NODE: z.string().url().optional(),
    ELASTIC_USER: z.string().optional(),
    ELASTIC_PASS: z.string().optional(),
    REDIS_URL: z.string().url().optional(),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    ELASTICSEARCH_URL: z.string().optional(),
    ELASTICSEARCH_USERNAME: z.string().optional(),
    ELASTICSEARCH_PASSWORD: z.string().optional(),
    SSL_KEY_PATH: z.string().optional(),
    SSL_CERT_PATH: z.string().optional(),
    FRONTEND_URL: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = _env.data;
