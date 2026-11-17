import { deflateSync, inflateSync } from 'node:zlib';
import { SIGNATURE_MAX_BYTES } from '@/lib/forms/apply-schema';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const SIGNATURE_PREFIX = 'data:image/png;base64,';

// The browser exports the cropped signature at most 1200 px wide; the canvas is 150 px tall,
// drawn at 2x, so at most 300 px. Anything bigger is not from the pad and only costs CPU to decode.
export const SIGNATURE_MAX_WIDTH = 1200;
export const SIGNATURE_MAX_HEIGHT = 400;
// A real stroke covers well over this many pixels; a blank or near-blank image does not.
const MIN_INK_PIXELS = 40;

/**
 * Turns the drawn signature into a PNG that is safe to hand to the PDF renderer, or null.
 * The upload must be a small, plain PNG (8-bit RGB or RGBA, not interlaced) whose pixel data
 * inflates to exactly the size its header promises, and it must contain some ink. The result
 * is a fresh PNG built from the decoded pixels, so nothing else from the upload (extra or
 * duplicate chunks, text, odd filters) ever reaches the renderer.
 */
export function decodeSignature(dataUrl: unknown): Buffer | null {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith(SIGNATURE_PREFIX)) return null;
  const b64 = dataUrl.slice(SIGNATURE_PREFIX.length);
  if (b64.length > Math.ceil((SIGNATURE_MAX_BYTES * 4) / 3) + 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) return null;
  const image = readPng(Buffer.from(b64, 'base64'));
  if (!image || countInk(image) < MIN_INK_PIXELS) return null;
  return writePng(image);
}

type Image = { width: number; height: number; channels: 3 | 4; pixels: Buffer };

function readPng(buf: Buffer): Image | null {
  if (buf.length < 64 || !buf.subarray(0, 8).equals(PNG_MAGIC)) return null;
  let pos = 8;
  let header: { width: number; height: number; channels: 3 | 4 } | null = null;
  const idat: Buffer[] = [];
  let sawEnd = false;
  while (pos + 12 <= buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('latin1', pos + 4, pos + 8);
    if (pos + 12 + len > buf.length) return null;
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      if (header || pos !== 8 || len !== 13) return null; // exactly one IHDR, first
      const width = data.readUInt32BE(0);
      const height = data.readUInt32BE(4);
      const [depth, colorType, compression, filter, interlace] = [data[8], data[9], data[10], data[11], data[12]];
      if (width < 1 || height < 1 || width > SIGNATURE_MAX_WIDTH || height > SIGNATURE_MAX_HEIGHT) return null;
      if (depth !== 8 || compression !== 0 || filter !== 0 || interlace !== 0) return null;
      if (colorType !== 6 && colorType !== 2) return null;
      header = { width, height, channels: colorType === 6 ? 4 : 3 };
    } else if (!header) {
      return null;
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      sawEnd = true;
      break;
    }
    // any other chunk is ignored: it is not copied into the PNG we hand on
    pos += 12 + len;
  }
  if (!header || !sawEnd || idat.length === 0) return null;
  const { width, height, channels } = header;
  const rowBytes = width * channels;
  const expected = height * (1 + rowBytes);
  let raw: Buffer;
  try {
    raw = inflateSync(Buffer.concat(idat), { maxOutputLength: expected });
  } catch {
    return null; // corrupt, or inflates past what the header allows
  }
  if (raw.length !== expected) return null;
  const pixels = unfilter(raw, width, height, channels);
  return pixels ? { width, height, channels, pixels } : null;
}

/** Reverses the PNG row filters (None, Sub, Up, Average, Paeth). */
function unfilter(raw: Buffer, width: number, height: number, bpp: number): Buffer | null {
  const rowBytes = width * bpp;
  const out = Buffer.alloc(height * rowBytes);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (rowBytes + 1)];
    if (filter > 4) return null;
    const src = y * (rowBytes + 1) + 1;
    const dst = y * rowBytes;
    for (let x = 0; x < rowBytes; x++) {
      const a = x >= bpp ? out[dst + x - bpp] : 0;
      const b = y > 0 ? out[dst - rowBytes + x] : 0;
      const c = x >= bpp && y > 0 ? out[dst - rowBytes + x - bpp] : 0;
      let p = 0;
      if (filter === 1) p = a;
      else if (filter === 2) p = b;
      else if (filter === 3) p = (a + b) >> 1;
      else if (filter === 4) {
        const pa = Math.abs(b - c);
        const pb = Math.abs(a - c);
        const pc = Math.abs(a + b - 2 * c);
        p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[dst + x] = (raw[src + x] + p) & 0xff;
    }
  }
  return out;
}

/** Visible, non-white pixels. */
function countInk({ width, height, channels, pixels }: Image): number {
  let ink = 0;
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const visible = channels === 3 || pixels[o + 3] > 24;
    const notWhite = pixels[o] < 200 || pixels[o + 1] < 200 || pixels[o + 2] < 200;
    if (visible && notWhite) ink++;
  }
  return ink;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'latin1');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])));
  return Buffer.concat([head, data, crc]);
}

/** A minimal PNG (IHDR, IDAT, IEND) from already-decoded pixels. */
function writePng({ width, height, channels, pixels }: Image): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = channels === 4 ? 6 : 2;
  const rowBytes = width * channels;
  const raw = Buffer.alloc(height * (rowBytes + 1));
  for (let y = 0; y < height; y++) pixels.copy(raw, y * (rowBytes + 1) + 1, y * rowBytes, (y + 1) * rowBytes);
  return Buffer.concat([PNG_MAGIC, pngChunk('IHDR', ihdr), pngChunk('IDAT', deflateSync(raw)), pngChunk('IEND', Buffer.alloc(0))]);
}

export type UploadKind = 'pdf' | 'png' | 'jpg';

export const UPLOAD_CONTENT_TYPES: Record<UploadKind, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
};

/** The real file type from its first bytes; the browser-supplied type is not trusted. */
export function sniffUpload(bytes: Uint8Array): UploadKind | null {
  const starts = (sig: number[]) => bytes.length >= sig.length && sig.every((b, i) => bytes[i] === b);
  if (starts([0x25, 0x50, 0x44, 0x46, 0x2d])) return 'pdf'; // %PDF-
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (starts([0xff, 0xd8, 0xff])) return 'jpg';
  return null;
}

/** Safe attachment name: keeps letters, digits, spaces, dot, dash, underscore and the right extension. */
export function safeFileName(name: string, kind: UploadKind, fallback: string): string {
  const base = name
    .replace(/\.[^.]*$/, '')
    .normalize('NFKD')
    .replace(/[^\w .-]+/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s-]+/, '')
    .trim()
    .slice(0, 80);
  return `${base || fallback}.${kind === 'jpg' ? 'jpg' : kind}`;
}
