import imageCompression from 'browser-image-compression';

/** Shown in UI when in-browser compression fails. */
export const IMAGE_COMPRESS_FAILED = 'IMAGE_COMPRESS_FAILED';

const MAX_WIDTH_OR_HEIGHT = 1920;
const MAX_SIZE_MB = 0.85;
const SKIP_BELOW_BYTES = 180_000;

/** Shrinks photos in the browser before upload. */
export async function compressImageFileForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file;
  }
  if (file.size < SKIP_BELOW_BYTES) {
    return file;
  }
  try {
    return await imageCompression(file, {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
      useWebWorker: true,
      fileType: 'image/jpeg' as const,
    });
  } catch {
    throw new Error(IMAGE_COMPRESS_FAILED);
  }
}
