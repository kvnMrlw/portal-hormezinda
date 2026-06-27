import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import multer from 'multer';

import { AppError } from '../../../middlewares/error.middleware';

const uploadDirectory = path.resolve(process.cwd(), 'src/uploads/feed');
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${randomUUID()}${extension}`;

    callback(null, safeName);
  }
});

export const feedUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new AppError('Tipo de imagem nao permitido', 400));
    }

    return callback(null, true);
  }
});
