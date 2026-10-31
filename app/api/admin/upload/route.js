import { withAdmin, jsonError, jsonOk } from '@/lib/api';
import { saveUploadedImage } from '@/lib/upload';

export async function POST(request) {
  return withAdmin(async () => {
    const form = await request.formData();
    const file = form.get('file');
    const result = await saveUploadedImage(file);
    if (result.error) return jsonError(result.error, 400);
    return jsonOk({ url: result.url });
  });
}
