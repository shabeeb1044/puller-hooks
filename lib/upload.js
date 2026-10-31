import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 5 * 1024 * 1024;

export async function saveUploadedImage(file) {
  if (!file || typeof file === 'string' || !file.size) {
    return { error: 'No image file provided.' };
  }
  if (!ALLOWED.has(file.type)) {
    return { error: 'Invalid image type. Use JPEG, PNG, WebP, or GIF.' };
  }
  if (file.size > MAX_BYTES) {
    return { error: 'Image must be 5MB or smaller.' };
  }

  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return { url: `/uploads/${filename}` };
}
