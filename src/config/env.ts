import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    PORT: z.coerce.number().default(3000),
    MONGO_URI: z.string().url(),
    JWT_SECRET: z.string().min(10),
    EMAIL_HOST: z.string(),
    EMAIL_PORT: z.coerce.number(),
    EMAIL_USER: z.string(),
    EMAIL_PASS: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = _env.data;
