Add-Type -AssemblyName System.Drawing

$code = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public static class LogoTools {
  public static Bitmap RemoveYellow(Bitmap src, int threshold, int feather) {
    int w = src.Width, h = src.Height;
    Bitmap dst = new Bitmap(w, h, PixelFormat.Format32bppArgb);
    BitmapData sData = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
    BitmapData dData = dst.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
    int sStride = sData.Stride, dStride = dData.Stride;
    byte[] sBuf = new byte[sStride * h];
    byte[] dBuf = new byte[dStride * h];
    Marshal.Copy(sData.Scan0, sBuf, 0, sBuf.Length);

    // Sample a ring of corner pixels for the key colour
    int kr = 0, kg = 0, kb = 0, n = 0;
    int[] xs = { 2, 8, 16, w - 3, w - 9, w - 17, w / 2 };
    int[] ys = { 2, 8, 16, h - 3, h - 9, h - 17 };
    for (int i = 0; i < xs.Length; i++) {
      for (int j = 0; j < ys.Length; j++) {
        if (xs[i] < 0 || xs[i] >= w || ys[j] < 0 || ys[j] >= h) continue;
        int o = ys[j] * sStride + xs[i] * 3;
        int b = sBuf[o], g = sBuf[o + 1], r = sBuf[o + 2];
        // skip if this corner is not yellow-ish
        if (r > 200 && g > 180 && b < 80) { kr += r; kg += g; kb += b; n++; }
      }
    }
    if (n == 0) { kr = 247; kg = 237; kb = 34; n = 1; }
    kr /= n; kg /= n; kb /= n;

    double t1 = threshold;
    double t2 = threshold + feather;

    for (int y = 0; y < h; y++) {
      int so = y * sStride;
      int drow = y * dStride;
      for (int x = 0; x < w; x++) {
        int b = sBuf[so], g = sBuf[so + 1], r = sBuf[so + 2];
        so += 3;
        int dr = r - kr, dg = g - kg, db = b - kb;
        double dist = Math.Sqrt(dr * dr + dg * dg + db * db);

        byte a;
        int nr = r, ng = g, nb = b;
        if (dist <= t1) {
          a = 0;
        } else if (dist >= t2) {
          a = 255;
        } else {
          double t = (dist - t1) / (t2 - t1);
          a = (byte)Math.Max(0, Math.Min(255, t * 255.0));
          // despill: pull remaining yellow out of edge pixels
          nr = Math.Min(255, Math.Max(0, r + (int)((r - kr) * (1.0 - t) * 0.35)));
          ng = Math.Min(255, Math.Max(0, g + (int)((g - kg) * (1.0 - t) * 0.35)));
          nb = Math.Min(255, Math.Max(0, b + (int)((b - kb) * (1.0 - t) * 0.35)));
        }

        int di = drow + x * 4;
        dBuf[di] = (byte)nb;
        dBuf[di + 1] = (byte)ng;
        dBuf[di + 2] = (byte)nr;
        dBuf[di + 3] = a;
      }
    }

    Marshal.Copy(dBuf, 0, dData.Scan0, dBuf.Length);
    src.UnlockBits(sData);
    dst.UnlockBits(dData);
    return dst;
  }

  public static Rectangle ContentBounds(Bitmap src, byte minAlpha) {
    int w = src.Width, h = src.Height;
    BitmapData data = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    int stride = data.Stride;
    byte[] buf = new byte[stride * h];
    Marshal.Copy(data.Scan0, buf, 0, buf.Length);
    src.UnlockBits(data);

    int minX = w, minY = h, maxX = -1, maxY = -1;
    for (int y = 0; y < h; y++) {
      int row = y * stride;
      for (int x = 0; x < w; x++) {
        if (buf[row + x * 4 + 3] >= minAlpha) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX) return new Rectangle(0, 0, w, h);
    return new Rectangle(minX, minY, maxX - minX + 1, maxY - minY + 1);
  }

  public static Rectangle FishBounds(Bitmap src) {
    int w = src.Width, h = src.Height;
    BitmapData data = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    int stride = data.Stride;
    byte[] buf = new byte[stride * h];
    Marshal.Copy(data.Scan0, buf, 0, buf.Length);
    src.UnlockBits(data);

    int minX = w, minY = h, maxX = -1, maxY = -1;
    for (int y = 0; y < h; y++) {
      int row = y * stride;
      for (int x = 0; x < w; x++) {
        int i = row + x * 4;
        byte b = buf[i], g = buf[i + 1], r = buf[i + 2], a = buf[i + 3];
        if (a < 40) continue;
        bool isBlue = b > 90 && b > r + 20 && b > g && r < 120;
        if (isBlue) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX) return new Rectangle(w / 2, 0, w / 2, h);
    return new Rectangle(minX, minY, maxX - minX + 1, maxY - minY + 1);
  }

  public static Bitmap Crop(Bitmap src, Rectangle r, int pad) {
    int x = Math.Max(0, r.X - pad);
    int y = Math.Max(0, r.Y - pad);
    int rw = Math.Min(src.Width - x, r.Width + pad * 2);
    int rh = Math.Min(src.Height - y, r.Height + pad * 2);
    Bitmap dst = new Bitmap(rw, rh, PixelFormat.Format32bppArgb);
    using (Graphics g = Graphics.FromImage(dst)) {
      g.CompositingMode = CompositingMode.SourceCopy;
      g.DrawImage(src, new Rectangle(0, 0, rw, rh), new Rectangle(x, y, rw, rh), GraphicsUnit.Pixel);
    }
    return dst;
  }

  public static Bitmap WithYellowPlate(Bitmap src, int pad, int kr, int kg, int kb) {
    Bitmap dst = new Bitmap(src.Width + pad * 2, src.Height + pad * 2, PixelFormat.Format32bppArgb);
    using (Graphics g = Graphics.FromImage(dst)) {
      g.Clear(Color.FromArgb(255, kr, kg, kb));
      g.CompositingMode = CompositingMode.SourceOver;
      g.DrawImage(src, pad, pad, src.Width, src.Height);
    }
    return dst;
  }

  public static Bitmap SquareOnYellow(Bitmap src, int size, int padPct, int kr, int kg, int kb) {
    Bitmap dst = new Bitmap(size, size, PixelFormat.Format32bppArgb);
    using (Graphics g = Graphics.FromImage(dst)) {
      g.Clear(Color.FromArgb(255, kr, kg, kb));
      g.InterpolationMode = InterpolationMode.HighQualityBicubic;
      g.SmoothingMode = SmoothingMode.HighQuality;
      g.PixelOffsetMode = PixelOffsetMode.HighQuality;
      g.CompositingQuality = CompositingQuality.HighQuality;
      int pad = size * padPct / 100;
      int box = size - pad * 2;
      float scale = Math.Min((float)box / src.Width, (float)box / src.Height);
      int dw = (int)(src.Width * scale);
      int dh = (int)(src.Height * scale);
      int dx = (size - dw) / 2;
      int dy = (size - dh) / 2;
      g.DrawImage(src, new Rectangle(dx, dy, dw, dh));
    }
    return dst;
  }

  public static Bitmap Resize(Bitmap src, int w, int h) {
    Bitmap dst = new Bitmap(w, h, PixelFormat.Format32bppArgb);
    using (Graphics g = Graphics.FromImage(dst)) {
      g.InterpolationMode = InterpolationMode.HighQualityBicubic;
      g.SmoothingMode = SmoothingMode.HighQuality;
      g.PixelOffsetMode = PixelOffsetMode.HighQuality;
      g.CompositingQuality = CompositingQuality.HighQuality;
      g.Clear(Color.Transparent);
      g.DrawImage(src, new Rectangle(0, 0, w, h));
    }
    return dst;
  }

  public static void SavePng(Bitmap bmp, string path) {
    bmp.Save(path, ImageFormat.Png);
  }

  public static void SaveIco(string[] pngPaths, int[] sizes, string outPath) {
    using (var ms = new MemoryStream())
    using (var bw = new BinaryWriter(ms)) {
      bw.Write((short)0);
      bw.Write((short)1);
      bw.Write((short)pngPaths.Length);
      byte[][] images = new byte[pngPaths.Length][];
      int offset = 6 + 16 * pngPaths.Length;
      for (int i = 0; i < pngPaths.Length; i++) {
        images[i] = File.ReadAllBytes(pngPaths[i]);
      }
      for (int i = 0; i < pngPaths.Length; i++) {
        int s = sizes[i];
        bw.Write((byte)(s >= 256 ? 0 : s));
        bw.Write((byte)(s >= 256 ? 0 : s));
        bw.Write((byte)0);
        bw.Write((byte)0);
        bw.Write((short)1);
        bw.Write((short)32);
        bw.Write(images[i].Length);
        bw.Write(offset);
        offset += images[i].Length;
      }
      for (int i = 0; i < images.Length; i++) bw.Write(images[i]);
      File.WriteAllBytes(outPath, ms.ToArray());
    }
  }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies @('System.Drawing')

# Prefer the Node/sharp pipeline (handles webp + both lockups).
#   node tools/process-logo.mjs
#
# Legacy System.Drawing path kept for reference; update $srcPath if you need it.
$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "images"
$assets = Join-Path $env:USERPROFILE ".cursor\projects\c-shabeeb-fish-hook-fish-hook\assets"
$srcPath = Join-Path $assets "Logo_New__1_-7d435765-f677-476c-ad36-731243a75b13.png"

if (-not (Test-Path $srcPath)) {
  Write-Error "Yellow logo source not found: $srcPath`nRun: node tools/process-logo.mjs"
  exit 1
}

Copy-Item $srcPath (Join-Path $outDir "logo-source.png") -Force

$src = New-Object System.Drawing.Bitmap $srcPath
Write-Host "Source $($src.Width)x$($src.Height)"

# Threshold ~70, feather ~45 — yellow field out, keep red/blue/black/white
$transparent = [LogoTools]::RemoveYellow($src, 70, 48)
$bounds = [LogoTools]::ContentBounds($transparent, 18)
Write-Host "Content bounds: $bounds"

$logo = [LogoTools]::Crop($transparent, $bounds, 8)
Write-Host "Transparent logo $($logo.Width)x$($logo.Height)"
[LogoTools]::SavePng($logo, (Join-Path $outDir "logo.png"))

# Tight crop of original on yellow for dark surfaces / OG
$plateBounds = New-Object System.Drawing.Rectangle ($bounds.X - 8), ($bounds.Y - 8), ($bounds.Width + 16), ($bounds.Height + 16)
if ($plateBounds.X -lt 0) { $plateBounds.X = 0 }
if ($plateBounds.Y -lt 0) { $plateBounds.Y = 0 }
if ($plateBounds.Right -gt $src.Width) { $plateBounds.Width = $src.Width - $plateBounds.X }
if ($plateBounds.Bottom -gt $src.Height) { $plateBounds.Height = $src.Height - $plateBounds.Y }

$plate = New-Object System.Drawing.Bitmap $plateBounds.Width, $plateBounds.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($plate)
$g.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, $plate.Width, $plate.Height), $plateBounds, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
[LogoTools]::SavePng($plate, (Join-Path $outDir "logo-on-yellow.png"))
Write-Host "Plate logo $($plate.Width)x$($plate.Height)"

# Fish crop for small favicons
$fish = [LogoTools]::FishBounds($transparent)
Write-Host "Fish bounds: $fish"
$fishBmp = [LogoTools]::Crop($transparent, $fish, 10)

# Square icons
$kr = 247; $kg = 237; $kb = 34

$icon512 = [LogoTools]::SquareOnYellow($logo, 512, 8, $kr, $kg, $kb)
[LogoTools]::SavePng($icon512, (Join-Path $outDir "icon-512.png"))

$icon192 = [LogoTools]::SquareOnYellow($logo, 192, 8, $kr, $kg, $kb)
[LogoTools]::SavePng($icon192, (Join-Path $outDir "icon-192.png"))

$apple = [LogoTools]::SquareOnYellow($logo, 180, 8, $kr, $kg, $kb)
[LogoTools]::SavePng($apple, (Join-Path $outDir "apple-touch-icon.png"))

$fav32 = [LogoTools]::SquareOnYellow($fishBmp, 32, 8, $kr, $kg, $kb)
[LogoTools]::SavePng($fav32, (Join-Path $outDir "favicon-32.png"))

$fav16 = [LogoTools]::SquareOnYellow($fishBmp, 16, 6, $kr, $kg, $kb)
[LogoTools]::SavePng($fav16, (Join-Path $outDir "favicon-16.png"))

$fav48 = [LogoTools]::SquareOnYellow($fishBmp, 48, 8, $kr, $kg, $kb)
[LogoTools]::SavePng($fav48, (Join-Path $outDir "favicon-48.png"))

[LogoTools]::SaveIco(
  @((Join-Path $outDir "favicon-16.png"), (Join-Path $outDir "favicon-32.png"), (Join-Path $outDir "favicon-48.png")),
  @(16, 32, 48),
  (Join-Path $outDir "favicon.ico")
)

# OG / social share — wide yellow banner with logo
$og = New-Object System.Drawing.Bitmap 1200, 630, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$ogG = [System.Drawing.Graphics]::FromImage($og)
$ogG.Clear([System.Drawing.Color]::FromArgb(255, $kr, $kg, $kb))
$ogG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$ogG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$scale = [Math]::Min(1000.0 / $logo.Width, 420.0 / $logo.Height)
$dw = [int]($logo.Width * $scale)
$dh = [int]($logo.Height * $scale)
$ogG.DrawImage($logo, [int]((1200 - $dw) / 2), [int]((630 - $dh) / 2), $dw, $dh)
$ogG.Dispose()
[LogoTools]::SavePng($og, (Join-Path $outDir "og-image.png"))

$src.Dispose()
$transparent.Dispose()
$logo.Dispose()
$plate.Dispose()
$fishBmp.Dispose()
$icon512.Dispose()
$icon192.Dispose()
$apple.Dispose()
$fav32.Dispose()
$fav16.Dispose()
$fav48.Dispose()
$og.Dispose()

Write-Host "Done. Files:"
Get-ChildItem $outDir -File | ForEach-Object { Write-Host ("  {0}  {1:N0} bytes" -f $_.Name, $_.Length) }
