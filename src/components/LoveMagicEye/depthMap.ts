import type { Gender, BeardStyle } from './types';

export interface DepthMapOptions {
  width: number;
  height: number;
  gender: Gender;
  beardStyle: BeardStyle;
  name: string;
}

/**
 * Generates a depth map on a canvas representing a human head silhouette.
 * The depth values (0–1) encode how far each pixel "pops out" of the stereogram.
 * Female profiles have a smooth jawline; male profiles include a beard bulge
 * depending on the selected beard style.
 *
 * The partner's name is woven into the depth pattern as ultra-translucent
 * repeating text layers so it becomes part of the hidden 3D illusion.
 */
export function generateDepthMap(opts: DepthMapOptions): HTMLCanvasElement {
  const { width, height, gender, beardStyle, name } = opts;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  // Head geometry — portrait proportions
  const cx = width * 0.5;
  const cy = height * 0.48;
  const headW = width * 0.32;
  const headH = height * 0.38;

  // Beard adds lower-face width
  const beardFactor =
    beardStyle === 'full' ? 1.12 :
    beardStyle === 'short' ? 1.07 :
    beardStyle === 'stubble' ? 1.03 :
    1.0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - cx) / (headW * beardFactor);
      const dy = (y - cy) / headH;

      // Base head silhouette — vertical ellipse with jawline shaping
      let depth = 0;

      // Female: narrower jaw, rounder; Male: squarer jaw
      const jawNarrow = gender === 'female' ? 0.85 : 1.0;
      const dyAbs = Math.abs(dy);
      const jawFactor = dyAbs > 0.5 ? jawNarrow * (1 - (dyAbs - 0.5) * 0.3) : 1;
      const adjustedDx = dx / jawFactor;

      const headDist = Math.sqrt(adjustedDx * adjustedDx + dy * dy);
      if (headDist < 1.0) {
        depth = (1 - headDist) * 0.6;
      }

      // Forehead/brow ridge bump
      const browY = -0.15;
      const browDist = Math.sqrt(dx * dx + (dy - browY) * (dy - browY));
      if (browDist < 0.25) {
        depth += (1 - browDist / 0.25) * 0.2;
      }

      // Nose ridge
      const noseY = 0.05;
      const noseDist = Math.abs(dx) < 0.08 && dy > -0.05 && dy < 0.25
        ? 0.15 - Math.abs(dx) * 1.5
        : 0;
      if (noseDist > 0) {
        depth += noseDist * 0.25;
      }

      // Hair volume on top
      if (gender === 'female' || true) {
        const hairY = -0.55;
        const hairDist = Math.sqrt(dx * dx + (dy - hairY) * (dy - hairY));
        if (hairDist < 0.5) {
          depth += (1 - hairDist / 0.5) * 0.15;
        }
      }

      // Beard depth bulge for males
      if (gender === 'male' && beardStyle !== 'clean' && dy > 0.3) {
        const beardStrength =
          beardStyle === 'full' ? 0.2 :
          beardStyle === 'short' ? 0.12 :
          0.05;
        const beardDist = Math.sqrt(dx * dx * 0.5 + (dy - 0.45) * (dy - 0.45));
        if (beardDist < 0.4) {
          depth += (1 - beardDist / 0.4) * beardStrength;
        }
      }

      // Name text as repeating translucent depth layer
      if (name.trim().length > 0) {
        const tileW = Math.max(60, name.trim().length * 12);
        const tileX = ((x + y * 0.3) % tileW) / tileW;
        // Create subtle wave depth from name text position
        const charPos = Math.floor(tileX * name.trim().length);
        const charVal = (name.charCodeAt(charPos % name.length) % 26) / 26;
        depth += charVal * 0.08 * Math.sin(y * 0.02);
      }

      depth = Math.max(0, Math.min(1, depth));
      const val = Math.floor(depth * 255);
      const idx = (y * width + x) * 4;
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Reads a single depth value from the depth map canvas at (x, y).
 * Returns 0–1.
 */
export function sampleDepth(
  depthCanvas: HTMLCanvasElement,
  x: number,
  y: number
): number {
  const ctx = depthCanvas.getContext('2d')!;
  const w = depthCanvas.width;
  const h = depthCanvas.height;
  const px = Math.max(0, Math.min(w - 1, Math.floor(x)));
  const py = Math.max(0, Math.min(h - 1, Math.floor(y)));
  const pixel = ctx.getImageData(px, py, 1, 1).data;
  return pixel[0] / 255;
}
