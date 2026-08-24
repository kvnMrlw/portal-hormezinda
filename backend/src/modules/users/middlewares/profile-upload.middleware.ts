import { createImageUpload } from '../../../utils/imageUpload';

const PROFILE_IMAGE_MAX_BYTES = 12 * 1024 * 1024;

export const profileUpload = createImageUpload('profile', {
  maxFileSize: PROFILE_IMAGE_MAX_BYTES
});
