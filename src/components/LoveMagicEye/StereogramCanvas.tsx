import React, { useEffect, useRef, useState } from 'react';
import type { MagicEyeConfig } from './types';

interface Props {
  config: MagicEyeConfig;
  paletteIndex: number;
  onGenerated?: (dataUrl: string) => void;
}

const WIDTH = 400;
const HEIGHT = 600;

/*
 * Reference-style autostereogram settings.
 *
 * The important idea:
 * - A small black/white geometric tile is repeated.
 * - The hidden face changes the horizontal spacing of repeated elements.
 * - Nothing resembling a face is drawn directly onto the image.
 */
const TILE_SIZE = 64;
const FAR_SEPARATION = 88;
const DEPTH_SHIFT = 25;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const mod = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

function ellipse(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
) {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

function roundedRect(
  x: number,
  y: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
  radius: number
) {
  const cx = clamp(x, left + radius, right - radius);
  const cy = clamp(y, top + radius, bottom - radius);

  const dx = x - cx;
  const dy = y - cy;

  return (
    dx * dx + dy * dy <= radius * radius &&
    x >= left &&
    x <= right &&
    y >= top &&
    y <= bottom
  );
}

/**
 * Returns a smooth face depth.
 *
 * 0 = background
 * 1 = deepest/closest feature
 *
 * The face is deliberately large and simple.
 * This makes the hidden image easier to perceive.
 */
function buildDepthMap(config: MagicEyeConfig) {
  const depth = new Float32Array(WIDTH * HEIGHT);

  const cx = WIDTH * 0.5;

  const faceTop = 145;
  const faceBottom = 485;

  const faceWidth =
    config.faceStructure === 'round'
      ? 245
      : config.faceStructure === 'square'
        ? 255
        : 225;

  const faceHeight =
    config.faceStructure === 'round'
      ? 310
      : config.faceStructure === 'square'
        ? 315
        : 335;

  const faceRx = faceWidth / 2;
  const faceRy = faceHeight / 2;

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const index = y * WIDTH + x;

      let d = 0;

      /*
       * Main head silhouette.
       */
      const head = ellipse(
        x,
        y,
        cx,
        faceTop + faceHeight / 2,
        faceRx,
        faceRy
      );

      if (head) {
        const nx = (x - cx) / faceRx;
        const ny =
          (y - (faceTop + faceHeight / 2)) /
          faceRy;

        /*
         * Rounded 3D face surface.
         */
        const surface = Math.sqrt(
          Math.max(0, 1 - nx * nx - ny * ny)
        );

        d = 0.25 + surface * 0.35;
      }

      /*
       * Hair mass.
       */
      if (config.hairStyle !== 'bald') {
        const hairTop = ellipse(
          x,
          y,
          cx,
          155,
          faceRx * 1.03,
          95
        );

        const hairSide =
          ellipse(x, y, cx - faceRx * 0.83, 210, 38, 95) ||
          ellipse(x, y, cx + faceRx * 0.83, 210, 38, 95);

        if (hairTop || hairSide) {
          d = Math.max(d, 0.58);
        }

        /*
         * Curly hair gets a slightly irregular outer silhouette.
         */
        if (config.hairStyle === 'curly') {
          const curls =
            ellipse(x, y, cx - 75, 135, 45, 45) ||
            ellipse(x, y, cx + 75, 135, 45, 45) ||
            ellipse(x, y, cx - 92, 190, 42, 52) ||
            ellipse(x, y, cx + 92, 190, 42, 52);

          if (curls) {
            d = Math.max(d, 0.68);
          }
        }
      }

      /*
       * Eyes.
       */
      const leftEye =
        ellipse(x, y, cx - 52, 275, 24, 11);

      const rightEye =
        ellipse(x, y, cx + 52, 275, 24, 11);

      if (leftEye || rightEye) {
        d = Math.max(d, 0.88);
      }

      /*
       * Eyebrows.
       */
      const leftBrow =
        roundedRect(x, y, cx - 80, 247, cx - 22, 258, 5);

      const rightBrow =
        roundedRect(x, y, cx + 22, 247, cx + 80, 258, 5);

      if (leftBrow || rightBrow) {
        d = Math.max(d, 0.78);
      }

      /*
       * Nose.
       *
       * A narrow vertical depth ridge gives the hidden face
       * a recognizable center line.
       */
      const nose =
        roundedRect(
          x,
          y,
          cx - 12,
          282,
          cx + 12,
          350,
          8
        );

      const noseTip =
        ellipse(x, y, cx, 350, 22, 12);

      if (nose || noseTip) {
        d = Math.max(d, noseTip ? 0.92 : 0.72);
      }

      /*
       * Cheeks.
       */
      if (
        ellipse(x, y, cx - 73, 333, 38, 28) ||
        ellipse(x, y, cx + 73, 333, 38, 28)
      ) {
        d = Math.max(d, 0.48);
      }

      /*
       * Mouth.
       */
      const mouth =
        ellipse(x, y, cx, 390, 48, 10);

      if (mouth) {
        d = Math.max(d, 0.9);
      }

      /*
       * Chin.
       */
      if (ellipse(x, y, cx, 430, 48, 25)) {
        d = Math.max(d, 0.55);
      }

      /*
       * Male beard.
       */
      if (
        config.gender === 'male' &&
        config.beardStyle !== 'clean'
      ) {
        const beardArea =
          ellipse(x, y, cx, 397, 103, 92);

        if (beardArea) {
          const beardStrength =
            config.beardStyle === 'full'
              ? 0.78
              : config.beardStyle === 'short'
                ? 0.64
                : 0.50;

          d = Math.max(d, beardStrength);
        }

        /*
         * Keep mouth/nose recognizable through the beard depth.
         */
        if (mouth) {
          d = Math.max(d, 0.91);
        }
      }

      /*
       * Female jaw/cheek contour.
       */
      if (config.gender === 'female') {
        const feminineContour =
          ellipse(x, y, cx, 385, faceRx * 0.72, 100);

        if (feminineContour) {
          d = Math.max(d, 0.42);
        }
      }

      /*
       * Strong outer silhouette.
       */
      if (
        head &&
        (
          Math.abs(nx) > 0.82 ||
          Math.abs(ny) > 0.80
        )
      ) {
        d = Math.max(d, 0.34);
      }

      depth[index] = clamp(d, 0, 1);
    }
  }

  return depth;
}

/**
 * Black/white geometric carrier.
 *
 * This is intentionally not random noise.
 * It produces the clean repeating look closer to the
 * reference-style stereogram.
 */
function carrierPixel(x: number, y: number) {
  const px = mod(x, TILE_SIZE);
  const py = mod(y, TILE_SIZE);

  const cell = 8;

  const gx = Math.floor(px / cell);
  const gy = Math.floor(py / cell);

  /*
   * Checker + diagonal geometry.
   */
  let value =
    (gx + gy) % 2 === 0;

  /*
   * Add diagonal white/black cuts.
   */
  const diagonalA =
    mod(px + py, 16) < 7;

  const diagonalB =
    mod(px - py, 16) < 7;

  if ((gx + gy) % 3 === 0) {
    value = diagonalA;
  }

  if ((gx + gy) % 4 === 0) {
    value = diagonalB;
  }

  /*
   * Small square accents make the carrier resemble
   * the geometric reference rather than plain dots.
   */
  if (
    (px >= 24 && px < 40 && py >= 24 && py < 40) ||
    (px >= 48 && px < 56 && py >= 8 && py < 16)
  ) {
    value = !value;
  }

  return value ? 255 : 0;
}

/**
 * Standard SIRDS separation.
 *
 * Larger depth = smaller separation.
 */
function separationFromDepth(depth: number) {
  return Math.round(
    FAR_SEPARATION -
      depth * DEPTH_SHIFT
  );
}

/**
 * Union-find helpers.
 */
function findRoot(parent: Int32Array, value: number) {
  let root = value;

  while (parent[root] !== root) {
    root = parent[root];
  }

  while (parent[value] !== value) {
    const next = parent[value];
    parent[value] = root;
    value = next;
  }

  return root;
}

function union(
  parent: Int32Array,
  a: number,
  b: number
) {
  const ra = findRoot(parent, a);
  const rb = findRoot(parent, b);

  if (ra !== rb) {
    /*
     * Keep the smaller index as the root.
     * This makes the generated pattern stable.
     */
    if (ra < rb) {
      parent[rb] = ra;
    } else {
      parent[ra] = rb;
    }
  }
}

/**
 * Generates the complete autostereogram.
 */
function generateStereogram(config: MagicEyeConfig) {
  const depth = buildDepthMap(config);

  const pixels = new Uint8ClampedArray(
    WIDTH * HEIGHT
  );

  for (let y = 0; y < HEIGHT; y++) {
    /*
     * Each row has its own correspondence groups.
     */
    const parent = new Int32Array(WIDTH);

    for (let x = 0; x < WIDTH; x++) {
      parent[x] = x;
    }

    /*
     * Establish left/right correspondences.
     *
     * The separation is controlled by the hidden depth.
     */
    for (let x = 0; x < WIDTH; x++) {
      const d = depth[y * WIDTH + x];

      if (d <= 0.02) {
        continue;
      }

      const separation =
        separationFromDepth(d);

      const left =
        Math.floor(
          x - separation / 2
        );

      const right =
        left + separation;

      if (
        left < 0 ||
        right >= WIDTH
      ) {
        continue;
      }

      /*
       * Basic visibility test.
       *
       * Prevents a foreground feature from being
       * connected through a stronger foreground feature.
       */
      const leftDepth =
        depth[y * WIDTH + left];

      const rightDepth =
        depth[y * WIDTH + right];

      if (
        leftDepth > d + 0.10 ||
        rightDepth > d + 0.10
      ) {
        continue;
      }

      union(parent, left, right);
    }

    /*
     * Assign each equivalence group a pixel from
     * the repeating geometric carrier.
     */
    const groupValue = new Int16Array(WIDTH);
    groupValue.fill(-1);

    for (let x = 0; x < WIDTH; x++) {
      const root = findRoot(parent, x);

      if (groupValue[root] === -1) {
        groupValue[root] =
          carrierPixel(x, y);
      }

      pixels[y * WIDTH + x] =
        groupValue[root];
    }
  }

  return pixels;
}

export default function StereogramCanvas({
  config,
  paletteIndex,
  onGenerated,
}: Props) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const [isGenerating, setIsGenerating] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    setIsGenerating(true);

    /*
     * Let React paint the loading state first.
     */
    const timer = window.setTimeout(() => {
      if (cancelled) return;

      const canvas =
        canvasRef.current;

      if (!canvas) return;

      const ctx =
        canvas.getContext('2d', {
          alpha: false,
        });

      if (!ctx) return;

      const pixels =
        generateStereogram(config);

      const imageData =
        ctx.createImageData(
          WIDTH,
          HEIGHT
        );

      for (
        let i = 0;
        i < pixels.length;
        i++
      ) {
        const value = pixels[i];

        imageData.data[i * 4] = value;
        imageData.data[i * 4 + 1] = value;
        imageData.data[i * 4 + 2] = value;
        imageData.data[i * 4 + 3] = 255;
      }

      ctx.putImageData(
        imageData,
        0,
        0
      );

      const dataUrl =
        canvas.toDataURL('image/png');

      if (!cancelled) {
        setIsGenerating(false);
        onGenerated?.(dataUrl);
      }
    }, 40);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [config, paletteIndex, onGenerated]);

  return (
    <div
      id="magic-eye-canvas"
      className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-2xl bg-black"
    >
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="block h-auto w-full"
        aria-label="Hidden love magic eye stereogram"
      />

      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3 text-white">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span className="text-sm">
              Creating your hidden image...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
