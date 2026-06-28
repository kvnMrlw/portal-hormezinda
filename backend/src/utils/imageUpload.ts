import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import multer from 'multer';

import { AppError } from '../middlewares/error.middleware';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

type UploadOptions = {
  allowedTypes?: Set<string>;
  maxFileSize?: number;
};

export function createFileUpload(folderName: string, options: UploadOptions = {}) {
  const uploadDirectory = path.resolve(process.cwd(), 'src/uploads', folderName);
  const fileTypes = options.allowedTypes ?? allowedMimeTypes;

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

  return multer({
    storage,
    limits: {
      fileSize: options.maxFileSize ?? 5 * 1024 * 1024
    },
    fileFilter: (_request, file, callback) => {
      if (!fileTypes.has(file.mimetype)) {
        return callback(new AppError('Tipo de arquivo nao permitido', 400));
      }

      return callback(null, true);
    }
  });
}

export function createImageUpload(folderName: string) {
  return createFileUpload(folderName, { allowedTypes: allowedMimeTypes });
}
