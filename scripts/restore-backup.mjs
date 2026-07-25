import { readFileSync, writeFileSync } from 'node:fs';
import { decompress } from '@mongodb-js/zstd';
import { createClient } from '@supabase/supabase-js';

const BACKUP_PATH = process.argv[2] || 'C:\\Users\\grant\\Downloads\\mindcast-inner-work_260724.backup';
const SUPABASE_URL = 'https://pjyelgogdsuiugaudecc.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqeWVsZ29nZHN1aXVnYXVkZWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mzc3MDg3NCwiZXhwIjoyMDk5MzQ2ODc0fQ.t9d3FdZc1Oa7Kx8JfwD8cFC-QS-lmoBIwrZReRHGxJM';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Read backup file
const buffer = readFileSync(BACKUP_PATH);
let offset = 0;

// --- Read functions matching pg_dump encoding ---
function readByte() {
  return buffer[offset++];
}

function readInt32() {
  const b1 = readByte(), b2 = readByte(), b3 = readByte(), b4 = readByte();
  return (b1 | (b2 << 8) | (b3 << 16) | (b4 << 24)) >>> 0;
}

function readInt64() {
  const lo = readInt32();
  const hi = readInt32();
  return hi * 0x100000000 + lo;
}

// pg_dump variable-length int encoding
// For values -31 to 191, uses 1 byte. Otherwise uses full int size.
function readInt(intSize) {
  if (offset >= buffer.length) throw new Error('EOF');
  const b = buffer[offset];
  // Check compact encoding: values between -31 (-0x1F) and 191 (0xBF)
  // are stored as a single byte (value + 32)
  if (intSize > 1) {
    const val = b - 32; // shift by 32
    if (val > -32 && val < 192) {
      offset++;
      return val;
    }
  }
  // Full integer
  if (intSize === 4) return readInt32();
  if (intSize === 8) return Number(readInt64());
  throw new Error(`Unsupported int size: ${intSize}`);
}

function readStr() {
  const len = readInt(4); // string length stored as int32
  const str = buffer.toString('utf8', offset, offset + len);
  offset += len;
  // Skip null terminator?
  if (offset < buffer.length && buffer[offset] === 0) offset++;
  return str;
}

// --- Parse header ---
console.log('=== Parsing pg_dump header ===');
const magic = buffer.toString('utf8', 0, 5);
console.log('Magic:', magic);
if (magic !== 'PGDMP') throw new Error('Not a pg_dump custom format file');

offset = 5;

// Read version (3 bytes: vmaj, vmin, vrev)
const vmaj = readByte();
const vmin = readByte();
const vrev = readByte();
console.log(`Version: ${vmaj}.${vmin}.${vrev}`);

const intSize = readByte();     // integer size (4 or 8)
const offSize = readByte();     // offset size (8)
const fmt = readByte();         // format (1=custom)
const compression = readByte(); // compression spec
console.log(`IntSize: ${intSize}, OffSize: ${offSize}, Format: ${fmt}, Compression: ${compression}`);

// Read hasOid flag? In some versions there's an extra byte here
// Actually, the next bytes seem to be TOC data, not part of the header
// Let me check by trying to read as TOC

// The TOC starts right after the 13-byte header?
// Let me try reading the first TOC entry
console.log(`\n=== Reading TOC at offset ${offset} ===`);

// In the custom format, after the header, the format goes to the data section
// Let me try to read the entire TOC by looking at the raw bytes

// Actually, let me try a different approach: try to decompress sectors with Zstd
// Look for zstd magic number: 0x28 0xB5 0x2F 0xFD

console.log('\n=== Searching for Zstd blocks ===');
let zstdBlocks = [];
for (let i = 0; i < buffer.length - 4; i++) {
  if (buffer[i] === 0x28 && buffer[i+1] === 0xB5 && buffer[i+2] === 0x2F && buffer[i+3] === 0xFD) {
    zstdBlocks.push(i);
  }
}
console.log(`Found ${zstdBlocks.length} Zstd magic markers`);
zstdBlocks.slice(0, 10).forEach(pos => console.log(`  at offset ${pos} (0x${pos.toString(16)})`));

// Try to decompress each Zstd block
if (zstdBlocks.length > 0) {
  console.log('\n=== Trying to decompress Zstd blocks ===');
  for (let i = 0; i < Math.min(3, zstdBlocks.length); i++) {
    const start = zstdBlocks[i];
    // Zstd frame: magic (4 bytes) + frame header + data + frame end
    // Try reading the whole frame - the next Zstd magic or end of file
    const nextMagic = zstdBlocks.find(p => p > start) || buffer.length;
    const frameData = buffer.subarray(start, Math.min(nextMagic, start + 100000));
    
    try {
      const decompressed = await decompress(frameData);
      console.log(`Block ${i} at ${start}: decompressed ${frameData.length} -> ${decompressed.length} bytes`);
      console.log('First 200 bytes as text:');
      console.log(decompressed.toString('utf8').substring(0, 200));
    } catch (err) {
      console.log(`Block ${i} at ${start}: decompress failed - ${err.message}`);
      // Try different boundaries
      try {
        const smaller = buffer.subarray(start, start + 500);
        const d = await decompress(smaller);
        console.log(`  Smaller block (500b): ${d.length} bytes`);
      } catch (e) {
        console.log(`  Smaller block also failed: ${e.message}`);
      }
    }
  }
}

// Also dump the first 500 bytes after the header as hex
console.log('\n=== First 200 bytes after header ===');
const headerEnd = offset;
for (let i = headerEnd; i < Math.min(headerEnd + 200, buffer.length); i++) {
  if (i % 16 === 0) process.stdout.write(`\n${i.toString(16).padStart(8, '0')}: `);
  process.stdout.write(buffer[i].toString(16).padStart(2, '0') + ' ');
}
console.log();
