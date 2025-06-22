import { env } from './env';

export const jwt = {
    secret: env.JWT_SECRET,
    expiresIn: '1d',
};
