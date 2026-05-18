import { postFormData } from '@/lib/api';
import { compressImageFileForUpload } from '@/lib/compress-image-for-upload';

export async function uploadProductImages(productId: string, files: File[]): Promise<string[]> {
  if (!files.length) return [];
  const compressed = await Promise.all(files.map((f) => compressImageFileForUpload(f)));
  const formData = new FormData();
  for (const f of compressed) {
    formData.append('images', f);
  }
  const res = await postFormData<{ data: { urls: string[] } }>(`/products/${productId}/images`, formData);
  return res.data.urls;
}
