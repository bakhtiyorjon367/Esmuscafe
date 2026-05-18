import { postFormData } from '@/lib/api';
import { compressImageFileForUpload } from '@/lib/compress-image-for-upload';

export async function uploadProductImage(productId: string, file: File): Promise<string> {
  const compressed = await compressImageFileForUpload(file);
  const formData = new FormData();
  formData.append('image', compressed);
  const res = await postFormData<{ data: { url: string } }>(`/products/${productId}/image`, formData);
  return res.data.url;
}
