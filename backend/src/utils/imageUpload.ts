import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import sharp, { type FitEnum } from 'sharp';

import { env } from '../config/env';
import { AppError } from '../middlewares/error.middleware';

const uploadsRoot = path.resolve(process.cwd(), 'src/uploads');
const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const cloudinaryFolderRoot = 'portal-hormezinda';

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

type PreparedFile = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
};

type CloudinaryResult = {
  bytes: number;
  publicId: string;
  secureUrl: string;
};

const imageSettings: Record<
  ImageVariant,
  { fit: keyof FitEnum; height?: number; quality: number; width: number }
> = {
  avatar: { fit: 'cover', height: 512, quality: 82, width: 512 },
  banner: { fit: 'cover', height: 720, quality: 82, width: 1600 },
  feed: { fit: 'inside', quality: 84, width: 1440 },
  menu: { fit: 'cover', height: 900, quality: 84, width: 1440 },
  menuThumb: { fit: 'cover', height: 360, quality: 78, width: 480 },
  notice: { fit: 'inside', quality: 82, width: 1440 }
};

const hasCloudinaryConfig = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

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

async function optimizeImage(
  file: Express.Multer.File,
  variant: ImageVariant
): Promise<PreparedFile> {
  const settings = imageSettings[variant];
  const image = sharp(file.buffer, { animated: false, failOn: 'none', limitInputPixels: 40_000_000 })
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

async function prepareFile(
  file: Express.Multer.File,
  imageVariant?: ImageVariant
): Promise<PreparedFile> {
  if (isImageMimeType(file.mimetype)) {
    return optimizeImage(file, imageVariant ?? 'feed');
  }

  return {
    buffer: file.buffer,
    filename: getSafeOriginalFilename(file),
    mimeType: file.mimetype
  };
}

async function saveToCloudinary(
  prepared: PreparedFile,
  originalName: string,
  folderName: string
): Promise<CloudinaryResult> {
  const isImage = isImageMimeType(prepared.mimeType);
  const extension = isImage ? '' : path.extname(originalName).toLowerCase();
  const publicId = `${Date.now()}-${randomUUID()}${extension}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${cloudinaryFolderRoot}/${folderName}`,
        public_id: publicId,
        resource_type: isImage ? 'image' : 'raw',
        overwrite: false
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary nao retornou resultado'));
          return;
        }

        resolve({
          bytes: result.bytes,
          publicId: result.public_id,
          secureUrl: result.secure_url
        });
      }
    );

    stream.end(prepared.buffer);
  });
}

function parseCloudinaryAsset(
  publicUrl: string
): { publicId: string; resourceType: 'image' | 'raw' | 'video' } | undefined {
  try {
    const parsedUrl = new URL(publicUrl);

    if (parsedUrl.hostname !== 'res.cloudinary.com') {
      return undefined;
    }

    const parts = parsedUrl.pathname.split('/').filter(Boolean);
    const uploadIndex = parts.indexOf('upload');

    if (uploadIndex < 2 || uploadIndex >= parts.length - 1) {
      return undefined;
    }

    const rawResourceType = parts[uploadIndex - 1];

    if (!['image', 'raw', 'video'].includes(rawResourceType)) {
      return undefined;
    }

    const assetParts = parts.slice(uploadIndex + 1);

    if (assetParts[0] && /^v\d+$/.test(assetParts[0])) {
      assetParts.shift();
    }

    if (!assetParts.length) {
      return undefined;
    }

    let publicId = decodeURIComponent(assetParts.join('/'));

    if (rawResourceType !== 'raw') {
      publicId = publicId.replace(/\.[a-zA-Z0-9]+$/, '');
    }

    return {
      publicId,
      resourceType: rawResourceType as 'image' | 'raw' | 'video'
    };
  } catch {
    return undefined;
  }
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

      return callback(null, true);
    }
  });
}

export function createImageUpload(
  folderName: string,
  options: Omit<UploadOptions, 'allowedTypes'> = {}
) {
  return createFileUpload(folderName, {
    ...options,
    allowedTypes: allowedImageMimeTypes
  });
}

export async function saveUploadedFile(
  file: Express.Multer.File,
  options: SaveUploadedFileOptions
): Promise<SavedUploadedFile> {
  const prepared = await prepareFile(file, options.imageVariant);

  if (hasCloudinaryConfig) {
    const uploaded = await saveToCloudinary(prepared, file.originalname, options.folderName);

    return {
      filename: uploaded.publicId.split('/').pop() ?? prepared.filename,
      mimeType: prepared.mimeType,
      originalName: file.originalname,
      publicUrl: uploaded.secureUrl,
      size: uploaded.bytes || prepared.buffer.length
    };
  }

  const uploadDirectory = await ensureUploadDirectory(options.folderName);
  const filePath = path.join(uploadDirectory, prepared.filename);
  await fs.writeFile(filePath, prepared.buffer);

  return {
    filename: prepared.filename,
    mimeType: prepared.mimeType,
    originalName: file.originalname,
    publicUrl: getPublicUrl(options.folderName, prepared.filename),
    size: prepared.buffer.length
  };
}

export async function removeUploadedFile(publicUrl?: string): Promise<void> {
  if (!publicUrl) {
    return;
  }

  if (hasCloudinaryConfig) {
    const cloudAsset = parseCloudinaryAsset(publicUrl);

    if (cloudAsset) {
      try {
        await cloudinary.uploader.destroy(cloudAsset.publicId, {
          resource_type: cloudAsset.resourceType,
          invalidate: true
        });
      } catch {
        // Falha de limpeza remota nao deve derrubar a operacao principal.
      }

      return;
    }
  }

  if (!publicUrl.startsWith('/uploads/')) {
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

export async function removeUploadedFiles(
  publicUrls: Array<string | undefined>
): Promise<void> {
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
