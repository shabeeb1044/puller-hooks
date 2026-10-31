/**
 * Rebuild site logo assets from the provided PULLER lockups.
 *
 * - Transparent lockup → logo.webp (header / footer / dealers — yellow plate in CSS)
 * - Yellow lockup → favicons, app icons, OG image
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const assetsDir = path.resolve(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-shabeeb-fish-hook-fish-hook/assets'
);

const SRC_TRANSPARENT = path.join(
  assetsDir,
  'puller_logo_main-c82c94aa-70c0-4678-baa3-ee9004bd2f92.png'
);
const SRC_YELLOW = path.join(
  assetsDir,
  'Logo_New__1_-7d435765-f677-476c-ad36-731243a75b13.png'
);

const YELLOW = { r: 247, g: 237, b: 34, alpha: 1 };
const outDirs = [path.join(root, 'images'), path.join(root, 'public', 'images')];

function ensureDirs() {
  for (const d of outDirs) fs.mkdirSync(d, { recursive: true });
}

async function writeAll(filename, buffer) {
  for (const d of outDirs) {
    const dest = path.join(d, filename);
    fs.writeFileSync(dest, buffer);
    console.log('  wrote', path.relative(root, dest), `(${buffer.length} bytes)`);
  }
}

async function contentBounds(input, minAlpha = 18) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * c + 3] >= minAlpha) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) return { left: 0, top: 0, width: w, height: h };
  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

async function fishBounds(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * c;
      const rr = data[i];
      const gg = data[i + 1];
      const bb = data[i + 2];
      const aa = data[i + 3];
      if (aa < 40) continue;
      // Strict blue fish only — avoid red PULLER box / grey arrow spill
      const isBlue = bb > 90 && bb > rr + 25 && bb > gg && rr < 100;
      if (isBlue) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) {
    return { left: Math.floor(w / 2), top: 0, width: Math.ceil(w / 2), height: h };
  }
  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

function padRect(rect, pad, maxW, maxH) {
  const left = Math.max(0, rect.left - pad);
  const top = Math.max(0, rect.top - pad);
  const right = Math.min(maxW, rect.left + rect.width + pad);
  const bottom = Math.min(maxH, rect.top + rect.height + pad);
  return { left, top, width: right - left, height: bottom - top };
}

async function squareOnYellow(srcBuf, size, padPct = 8) {
  const meta = await sharp(srcBuf).metadata();
  const pad = Math.round((size * padPct) / 100);
  const box = size - pad * 2;
  const scale = Math.min(box / meta.width, box / meta.height);
  const dw = Math.max(1, Math.round(meta.width * scale));
  const dh = Math.max(1, Math.round(meta.height * scale));
  const dx = Math.floor((size - dw) / 2);
  const dy = Math.floor((size - dh) / 2);
  const resized = await sharp(srcBuf).resize(dw, dh, { fit: 'fill' }).png().toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: YELLOW },
  })
    .composite([{ input: resized, left: dx, top: dy }])
    .png()
    .toBuffer();
}

/** Build a multi-size ICO from PNG buffers. */
function buildIco(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const headerSize = 6 + 16 * count;
  let offset = headerSize;
  const entries = [];
  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const png = pngBuffers[i];
    entries.push({ size, png, offset });
    offset += png.length;
  }
  const out = Buffer.alloc(offset);
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(count, 4);
  for (let i = 0; i < count; i++) {
    const e = entries[i];
    const o = 6 + i * 16;
    out.writeUInt8(e.size >= 256 ? 0 : e.size, o);
    out.writeUInt8(e.size >= 256 ? 0 : e.size, o + 1);
    out.writeUInt8(0, o + 2);
    out.writeUInt8(0, o + 3);
    out.writeUInt16LE(1, o + 4);
    out.writeUInt16LE(32, o + 6);
    out.writeUInt32LE(e.png.length, o + 8);
    out.writeUInt32LE(e.offset, o + 12);
  }
  for (const e of entries) e.png.copy(out, e.offset);
  return out;
}

async function main() {
  if (!fs.existsSync(SRC_TRANSPARENT)) throw new Error('Missing transparent logo: ' + SRC_TRANSPARENT);
  if (!fs.existsSync(SRC_YELLOW)) throw new Error('Missing yellow logo: ' + SRC_YELLOW);

  ensureDirs();
  console.log('Sources:');
  console.log('  transparent', SRC_TRANSPARENT);
  console.log('  yellow     ', SRC_YELLOW);

  const transparentMeta = await sharp(SRC_TRANSPARENT).metadata();
  const yellowMeta = await sharp(SRC_YELLOW).metadata();
  console.log(`Transparent ${transparentMeta.width}x${transparentMeta.height}`);
  console.log(`Yellow      ${yellowMeta.width}x${yellowMeta.height}`);

  // --- Main site logo (transparent, cropped) ---
  const bounds = await contentBounds(SRC_TRANSPARENT, 18);
  const croppedRect = padRect(bounds, 8, transparentMeta.width, transparentMeta.height);
  console.log('Content bounds:', bounds, '→ crop', croppedRect);

  const logoPng = await sharp(SRC_TRANSPARENT)
    .extract(croppedRect)
    .png()
    .toBuffer();

  // Keep similar footprint to previous 640×320 asset for layout stability
  const logoWebp = await sharp(logoPng)
    .resize({ width: 640, height: 320, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 92, alphaQuality: 100 })
    .toBuffer();
  await writeAll('logo.webp', logoWebp);

  const logoPngOut = await sharp(logoPng)
    .resize({ width: 640, height: 320, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await writeAll('logo.png', logoPngOut);

  // Yellow plate crop for reference / dark surfaces if needed
  const yellowBounds = await contentBounds(SRC_YELLOW, 18);
  const yellowCrop = padRect(yellowBounds, 8, yellowMeta.width, yellowMeta.height);
  const plate = await sharp(SRC_YELLOW).extract(yellowCrop).png().toBuffer();
  await writeAll('logo-on-yellow.png', plate);

  // Transparent mark used for composing icons
  const mark = logoPng;

  // Fish crop for tiny favicons
  const fish = await fishBounds(SRC_TRANSPARENT);
  const fishRect = padRect(fish, 10, transparentMeta.width, transparentMeta.height);
  console.log('Fish bounds:', fish, '→ crop', fishRect);
  const fishBmp = await sharp(SRC_TRANSPARENT).extract(fishRect).png().toBuffer();

  const icon512 = await squareOnYellow(mark, 512, 8);
  await writeAll('icon-512.png', icon512);
  const icon192 = await squareOnYellow(mark, 192, 8);
  await writeAll('icon-192.png', icon192);
  const apple = await squareOnYellow(mark, 180, 8);
  await writeAll('apple-touch-icon.png', apple);

  const fav32 = await squareOnYellow(fishBmp, 32, 8);
  await writeAll('favicon-32.png', fav32);
  const fav16 = await squareOnYellow(fishBmp, 16, 6);
  await writeAll('favicon-16.png', fav16);
  const fav48 = await squareOnYellow(fishBmp, 48, 8);
  await writeAll('favicon-48.png', fav48);

  const ico = buildIco([fav16, fav32, fav48], [16, 32, 48]);
  await writeAll('favicon.ico', ico);
  // Root favicon used by Next metadata
  fs.writeFileSync(path.join(root, 'public', 'favicon.ico'), ico);
  console.log('  wrote public/favicon.ico');

  // OG / social — wide yellow banner with full lockup
  const ogLogo = await sharp(mark)
    .resize({
      width: 1000,
      height: 420,
      fit: 'inside',
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();
  const ogMeta = await sharp(ogLogo).metadata();
  const og = await sharp({
    create: { width: 1200, height: 630, channels: 4, background: YELLOW },
  })
    .composite([
      {
        input: ogLogo,
        left: Math.floor((1200 - ogMeta.width) / 2),
        top: Math.floor((630 - ogMeta.height) / 2),
      },
    ])
    .png()
    .toBuffer();
  await writeAll('og-image.png', og);
  const ogWebp = await sharp(og).webp({ quality: 90 }).toBuffer();
  await writeAll('og-image.webp', ogWebp);

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
