import { env } from './env';

export const mail = {
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
    },
};
