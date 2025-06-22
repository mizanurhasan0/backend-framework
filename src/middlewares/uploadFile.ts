import fs from 'fs';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';

const allowedFileTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/jpg',
    'application/pdf', 'application/msword', 'video/mp4',
];
// Define where to store uploaded files
const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        const folder = req.body.folder || 'products';
        const uploadPath = path.join(__dirname, `../uploads/${folder}`);
        // Ensure folder exists
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${file.fieldname}-${Date.now()}${ext}`;
        cb(null, uniqueName);
    },
});

// File filter — dynamic by MIME type
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = allowedFileTypes;

    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`Unsupported file type: ${file.mimetype}`));

};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max per file
    },
});
