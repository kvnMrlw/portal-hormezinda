import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import multer from 'multer';
import sharp, { type FitEnum } from 'sharp';

import { AppError } from '../middlewares/error.middleware';

const uploadsRoot = path.resolve(process.cwd(), 'src/uploads');
const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

type UploadOptions = {
  allowedTypes?: Set<string>;
  maxFileSize?: number;
};

export type ImageVariant = 'avatar' | 'banner' | 'feed' | 'menu' | 'menuThumb' | 'notice';

type SaveUploadedFileOptions = {
  folderName: string;
  imageVariant?: ImageVariant;
};

export type SavedUploadedFile = {
  filename: string;
  mimeType: string;
  originalName: string;
  publicUrl: string;
  size: number;
};

const imageSettings: Record<ImageVariant, { fit: keyof FitEnum; height?: number; quality: number; width: number }> = {
  avatar: { fit: 'cover', height: 512, quality: 82, width: 512 },
  banner: { fit: 'cover', height: 720, quality: 82, width: 1600 },
  feed: { fit: 'inside', quality: 84, width: 1440 },
  menu: { fit: 'cover', height: 900, quality: 84, width: 1440 },
  menuThumb: { fit: 'cover', height: 360, quality: 78, width: 480 },
  notice: { fit: 'inside', quality: 82, width: 1440 }
};

function isImageMimeType(mimeType: string): boolean {
  return allowedImageMimeTypes.has(mimeType);
}

function getUploadDirectory(folderName: string): string {
  return path.resolve(uploadsRoot, folderName);
}

function getPublicUrl(folderName: string, filename: string): string {
  return `/uploads/${folderName}/${filename}`;
}

async function ensureUploadDirectory(folderName: string): Promise<string> {
  const uploadDirectory = getUploadDirectory(folderName);
  await fs.mkdir(uploadDirectory, { recursive: true });

  return uploadDirectory;
}

async function optimizeImage(file: Express.Multer.File, variant: ImageVariant): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
  const settings = imageSettings[variant];
  const image = sharp(file.buffer, { animated: false, failOn: 'none' })
    .rotate()
    .resize({
      fit: settings.fit,
      height: settings.height,
      width: settings.width,
      withoutEnlargement: settings.fit === 'inside'
    });
  const buffer = await image.webp({ effort: 4, quality: settings.quality }).toBuffer();

  return {
    buffer,
    filename: `${Date.now()}-${randomUUID()}.webp`,
    mimeType: 'image/webp'
  };
}

function getSafeOriginalFilename(file: Express.Multer.File): string {
  const extension = path.extname(file.originalname).toLowerCase();

  return `${Date.now()}-${randomUUID()}${extension}`;
}

export function createFileUpload(folderName: string, options: UploadOptions = {}) {
  const fileTypes = options.allowedTypes ?? allowedImageMimeTypes;

  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: options.maxFileSize ?? 5 * 1024 * 1024
    },
    fileFilter: (_request, file, callback) => {
      if (!fileTypes.has(file.mimetype)) {
        return callback(new AppError('Tipo de arquivo nao permitido', 400));
      }

      void ensureUploadDirectory(folderName);

      return callback(null, true);
    }
  });
}

export function createImageUpload(folderName: string) {
  return createFileUpload(folderName, { allowedTypes: allowedImageMimeTypes });
}

export async function saveUploadedFile(file: Express.Multer.File, options: SaveUploadedFileOptions): Promise<SavedUploadedFile> {
  const uploadDirectory = await ensureUploadDirectory(options.folderName);
  const shouldOptimize = isImageMimeType(file.mimetype);
  const optimized = shouldOptimize
    ? await optimizeImage(file, options.imageVariant ?? 'feed')
    : {
        buffer: file.buffer,
        filename: getSafeOriginalFilename(file),
        mimeType: file.mimetype
      };
  const filePath = path.join(uploadDirectory, optimized.filename);

  await fs.writeFile(filePath, optimized.buffer);

  return {
    filename: optimized.filename,
    mimeType: optimized.mimeType,
    originalName: file.originalname,
    publicUrl: getPublicUrl(options.folderName, optimized.filename),
    size: optimized.buffer.length
  };
}

export async function removeUploadedFile(publicUrl?: string): Promise<void> {
  if (!publicUrl || !publicUrl.startsWith('/uploads/')) {
    return;
  }

  const relativePath = publicUrl.replace(/^\/uploads\//, '');
  const absolutePath = path.resolve(uploadsRoot, relativePath);

  if (!absolutePath.startsWith(uploadsRoot)) {
    return;
  }

  try {
    await fs.rm(absolutePath, { force: true });
  } catch {
    // A ausencia do arquivo nao deve impedir a limpeza do registro.
  }
}

export async function removeUploadedFiles(publicUrls: Array<string | undefined>): Promise<void> {
  await Promise.all(publicUrls.map((publicUrl) => removeUploadedFile(publicUrl)));
}

export function getStaticUploadOptions() {
  return {
    immutable: true,
    maxAge: '30d',
    setHeaders(response: { setHeader: (name: string, value: string) => void }) {
      response.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    }
  };
}
