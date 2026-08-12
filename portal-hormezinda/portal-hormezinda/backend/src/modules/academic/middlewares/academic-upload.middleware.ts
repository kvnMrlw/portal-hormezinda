import { createFileUpload } from '../../../utils/imageUpload';

const allowedAcademicFileTypes = new Set([
  'application/msword',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp'
]);

export const academicUpload = createFileUpload('academic', {
  allowedTypes: allowedAcademicFileTypes,
  maxFileSize: 20 * 1024 * 1024
});
