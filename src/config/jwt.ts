import { env } from './env';

export const jwt = {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET || env.JWT_SECRET,
    accessToken: {
        expiresIn: '15m',
        algorithm: 'HS256' as const,
    },
    refreshToken: {
        expiresIn: '7d',
        algorithm: 'HS256' as const,
    },
    cookie: {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
};
