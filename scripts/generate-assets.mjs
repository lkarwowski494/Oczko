import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal, zero-dependency pure Node.js PNG encoder
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function createPng(width, height, getPixel) {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a !== undefined ? a : 255;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const len = data ? data.length : 0;
    const chunk = Buffer.alloc(12 + len);
    chunk.writeUInt32BE(len, 0);
    typeBuf.copy(chunk, 4);
    if (data) data.copy(chunk, 8);
    const crc = crc32(Buffer.concat([typeBuf, data || Buffer.alloc(0)]));
    chunk.writeUInt32BE(crc, 8 + len);
    return chunk;
  }

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', null),
  ]);
}

const assetsDir = path.resolve('assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

console.log('Generating production PNG assets for Oczko (Purlo)...');

// Helper: distance from line segment
function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// 1. Icon (1024x1024)
// Design: Warm cream #FAF8F5 background, crossed wooden knitting needles, terracotta yarn ball
const iconBuffer = createPng(1024, 1024, (x, y, w, h) => {
  // Base background #FAF8F5
  let r = 250, g = 248, b = 245, a = 255;

  // Shadow at base
  const sDx = (x - 512) / 280;
  const sDy = (y - 840) / 36;
  if (sDx * sDx + sDy * sDy <= 1.0) {
    const alpha = 0.5 * (1.0 - (sDx * sDx + sDy * sDy));
    r = Math.round(r * (1 - alpha) + 220 * alpha);
    g = Math.round(g * (1 - alpha) + 215 * alpha);
    b = Math.round(b * (1 - alpha) + 205 * alpha);
  }

  // Needle 1 (diagonal left-bottom to right-top)
  const d1 = distToSegment(x, y, 192, 832, 832, 192);
  if (d1 <= 14) {
    r = 140; g = 115; b = 85;
  }
  // Needle 1 knob
  if (Math.hypot(x - 192, y - 832) <= 28) {
    r = 92; g = 64; b = 51;
  }

  // Needle 2 (diagonal right-bottom to left-top)
  const d2 = distToSegment(x, y, 832, 832, 192, 192);
  if (d2 <= 14) {
    r = 140; g = 115; b = 85;
  }
  // Needle 2 knob
  if (Math.hypot(x - 832, y - 832) <= 28) {
    r = 92; g = 64; b = 51;
  }

  // Yarn ball (circle cx=512, cy=512, r=260)
  const ballDist = Math.hypot(x - 512, y - 512);
  if (ballDist <= 260) {
    // Base terracotta #C85A32
    r = 200; g = 90; b = 50;

    // Outer shade / shading
    const shade = ballDist / 260;
    r = Math.round(r * (1 - shade * 0.2));
    g = Math.round(g * (1 - shade * 0.2));
    b = Math.round(b * (1 - shade * 0.2));

    // Concentric curved yarn loops
    const loop1 = Math.abs(Math.hypot(x - 480, y - 460) - 180);
    const loop2 = Math.abs(Math.hypot(x - 540, y - 540) - 130);
    const loop3 = Math.abs(Math.hypot(x - 500, y - 520) - 70);
    const stitchHighlight = Math.abs(Math.sin((x + y) * 0.04) * 12);

    if (loop1 < 10 || loop2 < 9 || loop3 < 8) {
      r = 225; g = 120; b = 75; // Lighter yarn strand
    } else if (stitchHighlight < 2) {
      r = 245; g = 240; b = 235; // Cream stitch highlight
    }
  }

  return [r, g, b, a];
});

fs.writeFileSync(path.join(assetsDir, 'icon.png'), iconBuffer);
console.log('✓ Created assets/icon.png (1024x1024)');

// 2. Adaptive Icon (1024x1024)
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), iconBuffer);
console.log('✓ Created assets/adaptive-icon.png (1024x1024)');

// 3. Splash Screen (1024x1024)
const splashBuffer = createPng(1024, 1024, (x, y, w, h) => {
  let r = 250, g = 248, b = 245, a = 255;
  const ballDist = Math.hypot(x - 512, y - 512);
  if (ballDist <= 160) {
    r = 200; g = 90; b = 50;
    const loop1 = Math.abs(Math.hypot(x - 490, y - 480) - 110);
    const loop2 = Math.abs(Math.hypot(x - 530, y - 530) - 60);
    if (loop1 < 8 || loop2 < 7) {
      r = 225; g = 120; b = 75;
    }
  }
  return [r, g, b, a];
});

fs.writeFileSync(path.join(assetsDir, 'splash.png'), splashBuffer);
console.log('✓ Created assets/splash.png (1024x1024)');

// 4. Favicon (48x48)
const faviconBuffer = createPng(48, 48, (x, y, w, h) => {
  const dist = Math.hypot(x - 24, y - 24);
  if (dist <= 20) {
    return [200, 90, 50, 255];
  }
  return [250, 248, 245, 0];
});

fs.writeFileSync(path.join(assetsDir, 'favicon.png'), faviconBuffer);
console.log('✓ Created assets/favicon.png (48x48)');
console.log('All production assets generated successfully.');
