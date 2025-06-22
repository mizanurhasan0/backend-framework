import { db } from "./db";
import { env } from "./env";
import { jwt } from "./jwt";
import { mail } from "./mail";

export const config = {
    env,
    db,
    mail,
    jwt
}