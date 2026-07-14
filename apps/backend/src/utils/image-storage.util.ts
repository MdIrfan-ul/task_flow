import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { diskStorage } from 'multer';
import * as fs from 'node:fs';
import { BadRequestException } from '@nestjs/common';
import { IMAGES_ROOT } from '../common/path';

type ValidFileExtension = 'png' | 'jpg' | 'jpeg';
type ValidMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';

export const validFileExtensions: ValidFileExtension[] = ['png', 'jpg', 'jpeg'];
export const validMimeTypes: ValidMimeType[] = ['image/png', 'image/jpg', 'image/jpeg'];
export const storage = (destination: string) => {
    // Create destination folder if it doesn't exist
    const fullDestination = path.join(IMAGES_ROOT, destination.replace(/^images\/?/, '')); // e.g. <root>/images/profile
    if (!fs.existsSync(fullDestination)) {
        fs.mkdirSync(fullDestination, { recursive: true });
    }

    return {
        storage: diskStorage({
            destination,
            filename: (_req, file, cb) => {
                const fileExtension = path.extname(file.originalname).toLowerCase();
                const fileName = randomUUID() + fileExtension;
                cb(null, fileName);
            },
        }),
        fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
            const mimeType = file.mimetype as ValidMimeType;
            if (validMimeTypes.includes(mimeType)) {
                cb(null, true);
            } else {
                cb(
                    new BadRequestException(
                        `Invalid file type. Allowed: ${validFileExtensions.join(', ')}`,
                    ),
                    false,
                );
            }
        },
        limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
    };
};

export const removeFile = (fullFilePath: string): void => {
    try {
        if (fs.existsSync(fullFilePath)) {
            fs.unlinkSync(fullFilePath);
        }
    } catch (err) {
        console.error('Failed to remove file:', err);
    }
};