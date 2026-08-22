import { Buffer } from "node:buffer";
import { PNG } from "npm:pngjs@7.0.0";

export type CropOptions = {
  whiteThreshold?: number;
  paddingFraction?: number;
  minPadding?: number;
};

export type CroppedPng = {
  bytes: Uint8Array;
  width: number;
  height: number;
  cropped: boolean;
};

/**
 * Removes the empty white canvas that image models commonly leave around line
 * art. Dark and anti-aliased pixels define the content bounds; a small white
 * safety margin is then restored so crayons never run into the PDF trim area.
 */
export function cropWhiteMargins(
  bytes: Uint8Array,
  options: CropOptions = {},
): CroppedPng {
  const source = PNG.sync.read(Buffer.from(bytes));
  const threshold = options.whiteThreshold ?? 246;
  let minX = source.width;
  let minY = source.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < source.height; y++) {
    for (let x = 0; x < source.width; x++) {
      const offset = (y * source.width + x) * 4;
      const alpha = source.data[offset + 3];
      const isInk = alpha > 16 && (
        source.data[offset] < threshold ||
        source.data[offset + 1] < threshold ||
        source.data[offset + 2] < threshold
      );
      if (!isInk) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    return { bytes, width: source.width, height: source.height, cropped: false };
  }

  const padding = Math.max(
    options.minPadding ?? 10,
    Math.round(Math.min(source.width, source.height) * (options.paddingFraction ?? 0.015)),
  );
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(source.width - 1, maxX + padding);
  maxY = Math.min(source.height - 1, maxY + padding);

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  if (width >= source.width * 0.98 && height >= source.height * 0.98) {
    return { bytes, width: source.width, height: source.height, cropped: false };
  }

  const cropped = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    const sourceStart = ((minY + y) * source.width + minX) * 4;
    const targetStart = y * width * 4;
    source.data.copy(cropped.data, targetStart, sourceStart, sourceStart + width * 4);
  }

  return {
    bytes: Uint8Array.from(PNG.sync.write(cropped)),
    width,
    height,
    cropped: true,
  };
}

export type ArtworkBox = {
  left: number;
  right: number;
  bottom: number;
  top: number;
};

export type ArtworkPlacement = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function containArtwork(
  imageWidth: number,
  imageHeight: number,
  box: ArtworkBox,
): ArtworkPlacement {
  const boxWidth = Math.max(1, box.right - box.left);
  const boxHeight = Math.max(1, box.top - box.bottom);
  const scale = Math.min(boxWidth / imageWidth, boxHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    x: box.left + (boxWidth - width) / 2,
    y: box.bottom + (boxHeight - height) / 2,
    width,
    height,
  };
}
