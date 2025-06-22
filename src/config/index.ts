import { db } from './db';
import { env } from './env';
import { jwt } from './jwt';
import { mail } from './mail';
import { getHttpsKeys } from './ssl';

export const config = {
    env,
    db,
    mail,
    jwt,
    getHttpsKeys
};