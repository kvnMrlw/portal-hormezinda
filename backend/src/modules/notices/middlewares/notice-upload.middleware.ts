import { createFileUpload } from '../../../utils/imageUpload';

const allowedNoticeFileTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
]);

export const noticeUpload = createFileUpload('notices', {
  allowedTypes: allowedNoticeFileTypes,
  maxFileSize: 10 * 1024 * 1024
});
