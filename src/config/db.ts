import { env } from './env';

export const db = {
    uri: env.MONGO_URI,
};
