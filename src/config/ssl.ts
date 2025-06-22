import fs from 'fs';
import path from 'path';

export const getHttpsKeys = () => {
    try {
        const keyPath = path.join(__dirname, '../../ssl/key.pem');
        const certPath = path.join(__dirname, '../../ssl/cert.pem');

        const key = fs.readFileSync(keyPath, 'utf-8');
        const cert = fs.readFileSync(certPath, 'utf-8');

        return { key, cert };
    } catch (error) {
        console.warn('🔒 SSL key/cert not found, falling back to HTTP.');
        return null;
    }
};
