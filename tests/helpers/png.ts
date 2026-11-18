import { crc32, deflateSync } from 'node:zlib';

// Builds PNG files for the signature checks: real ones and hostile ones.

export function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0);
  return Buffer.concat([len, body, crc]);
}

type PngOpts = { width: number; height: number; depth?: number; colorType?: number; interlace?: number; idat?: Buffer };

export function makePng({ width, height, depth = 8, colorType = 6, interlace = 0, idat }: PngOpts): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = depth;
  ihdr[9] = colorType;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = interlace;
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const raw = idat ?? deflateSync(Buffer.alloc(height * (1 + width * channels)));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', raw),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** A signature-like RGBA image: a dark wavy line on a transparent background. */
export function signaturePng(width = 360, height = 90): Buffer {
  const rows: Buffer[] = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    for (let x = 0; x < width; x++) {
      const curve = height / 2 + Math.sin(x / 18) * (height / 4);
      if (Math.abs(y - curve) < 2) row.set([15, 23, 42, 255], 1 + x * 4);
    }
    rows.push(row);
  }
  return makePng({ width, height, idat: deflateSync(Buffer.concat(rows)) });
}

export const asDataUrl = (png: Buffer) => `data:image/png;base64,${png.toString('base64')}`;
