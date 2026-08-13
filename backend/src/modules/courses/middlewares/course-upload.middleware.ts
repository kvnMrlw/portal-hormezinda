import { createFileUpload } from '../../../utils/imageUpload';

const allowedCourseFileTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm'
]);

export const courseUpload = createFileUpload('courses', {
  allowedTypes: allowedCourseFileTypes,
  maxFileSize: 60 * 1024 * 1024
});
