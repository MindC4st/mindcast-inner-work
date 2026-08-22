import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { PNG } from "npm:pngjs@7.0.0";
import { containArtwork, cropWhiteMargins } from "./image-layout.ts";

Deno.test("cropWhiteMargins removes a white frame without clipping ink", () => {
  const source = new PNG({ width: 100, height: 100 });
  source.data.fill(255);
  for (let y = 10; y < 90; y++) {
    for (let x = 20; x < 80; x++) {
      const offset = (y * source.width + x) * 4;
      source.data[offset] = 0;
      source.data[offset + 1] = 0;
      source.data[offset + 2] = 0;
      source.data[offset + 3] = 255;
    }
  }

  const result = cropWhiteMargins(
    Uint8Array.from(PNG.sync.write(source)),
    { paddingFraction: 0, minPadding: 0 },
  );
  const decoded = PNG.sync.read(Buffer.from(result.bytes));

  assert.equal(result.cropped, true);
  assert.equal(decoded.width, 60);
  assert.equal(decoded.height, 80);
});

Deno.test("portrait 4:5 artwork fills the expanded A4 artwork box", () => {
  const placement = containArtwork(896, 1120, {
    left: 24,
    right: 595.28 - 24,
    bottom: 56,
    top: 713,
  });

  assert.ok(placement.width > 520);
  assert.ok(placement.height > 650);
  assert.ok(placement.x >= 24);
  assert.ok(placement.y >= 56);
  assert.ok(placement.x + placement.width <= 595.28 - 24 + 0.001);
  assert.ok(placement.y + placement.height <= 713 + 0.001);
});
