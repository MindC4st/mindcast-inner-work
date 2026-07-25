import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const backup = readFileSync(process.argv[2] || 'C:\\Users\\grant\\Downloads\\mindcast-inner-work_260724.backup');

const magic = backup.toString('utf8', 0, 5);
console.log('Magic:', magic);

if (magic !== 'PGDMP') {
  console.error('Not a valid pg_dump custom format file');
  process.exit(1);
}

const header = backup.subarray(5, 15);
console.log('Header bytes:', [...header].map(b => b.toString(16).padStart(2, '0')).join(' '));

// Custom format header:
// vmaj(1) vmin(1) vrev(1) intsize(1) offsize(1) format(1) compression(1) ...then data
const [vmaj, vmin, vrev, intsize, offsize, fmt, compression] = header.subarray(0, 7);
console.log(`Version: ${vmaj}.${vmin}.${vrev}`);
console.log(`Int size: ${intsize}, Off size: ${offsize}, Format: ${fmt}, Compression: ${compression}`);

// The rest of the file is compressed data
const compressedData = backup.subarray(15 + (fmt === 1 ? 1 : 0)); // skip hasOid for custom format

// Try to decompress the entire remaining data
try {
  const decompressed = inflateSync(compressedData);
  console.log(`Decompressed size: ${decompressed.length} bytes`);
  
  // Write decompressed to file for analysis
  writeFileSync('scripts/backup-decompressed.bin', decompressed);
  
  // Try to find SQL patterns
  const text = decompressed.toString('utf8');
  const sqlStatements = [];
  
  // Find all INSERT statements
  const insertRegex = /INSERT INTO\s+\S+/gi;
  const matches = text.match(insertRegex);
  if (matches) {
    console.log(`Found ${matches.length} INSERT statements`);
    matches.slice(0, 5).forEach(m => console.log('  ', m));
  }
  
  // Find COPY statements
  const copyRegex = /COPY\s+\S+/gi;
  const copyMatches = text.match(copyRegex);
  if (copyMatches) {
    console.log(`Found ${copyMatches.length} COPY statements`);
    copyMatches.slice(0, 5).forEach(m => console.log('  ', m));
  }
  
  // Show first 2000 chars
  console.log('\nFirst 2000 chars of decompressed:');
  console.log(text.substring(0, 2000));
  
  // Extract just the public schema data
  writeFileSync('scripts/backup-full.txt', text);
  console.log('\nWrote full decompressed data to scripts/backup-full.txt');
  
} catch (err) {
  console.error('Could not decompress entire file:', err.message);
  console.error('Trying block-by-block parsing...');
  
  // Try to read blocks from the compressed stream
  // Custom format uses a block structure after the header
  // Each block: type(1 byte) + length(offsize bytes) + data(length bytes)
}
