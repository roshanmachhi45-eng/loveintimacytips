import { useEffect, useRef, useState } from 'react';
import type { MagicEyeConfig } from './types';

interface StereogramCanvasProps {
  config: MagicEyeConfig;
  generateKey: number;
  onDataUrl?: (dataUrl: string) => void;
}

const CANVAS_W = 400;
const CANVAS_H = 600;

/*
 * DIAGNOSTIC SIRDS
 *
 * This version intentionally renders ONE simple hidden 3D heart.
 * Do not add face/hair/beard/name yet.
 *
 * The purpose is to verify that the stereogram engine itself works.
 */

const EYE_SEPARATION = 64;
const MIN_SEPARATION = 40;
const MAX_SEPARATION = 64;

function seededRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let t = value;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Simple Union-Find structure.
 *
 * Every pair of pixels that must have the same random-dot color
 * is joined into the same group.
 */
class UnionFind {
  parent: Int32Array;
  rank: Uint8Array;

  constructor(size: number) {
    this.parent = new Int32Array(size);
    this.rank = new Uint8Array(size);

    for (let i = 0; i < size; i += 1) {
      this.parent[i] = i;
    }
  }

  find(value: number): number {
    let root = value;

    while (this.parent[root] !== root) {
      root = this.parent[root];
    }

    while (this.parent[value] !== value) {
      const next = this.parent[value];
      this.parent[value] = root;
      value = next;
    }

    return root;
  }

  union(a: number, b: number) {
    let rootA = this.find(a);
    let rootB = this.find(b);

    if (rootA === rootB) {
      return;
    }

    if (this.rank[rootA] < this.rank[rootB]) {
      [rootA, rootB] = [rootB, rootA];
    }

    this.parent[rootB] = rootA;

    if (this.rank[rootA] === this.rank[rootB]) {
      this.rank[rootA] += 1;
    }
  }
}

/**
 * Returns a normalized depth value.
 *
 * 0 = background
 * 1 = deepest/closest part of the heart
 */
function getHeartDepth(x: number, y: number): number {
  const cx = CANVAS_W / 2;
  const cy = 290;

  /*
   * Heart coordinate system.
   */
  const nx = (x - cx) / 105;
  const ny = (y - cy) / 120;

  /*
   * Classic implicit heart:
   *
   * (x² + y² - 1)³ - x²y³ <= 0
   */
  const heartValue =
    Math.pow(nx * nx + ny * ny - 1, 3) -
    nx * nx * Math.pow(ny, 3);

  if (heartValue > 0) {
    return 0;
  }

  /*
   * Approximate distance from the centre.
   * This creates a rounded 3D surface instead of
   * a completely flat silhouette.
   */
  const distance = Math.sqrt(nx * nx + ny * ny);

  let depth = 1 - distance * 0.72;

  /*
   * Stronger depth near the central body.
   */
  const centerBoost = Math.max(0, 1 - distance);

  depth += centerBoost * 0.28;

  /*
   * Keep the shape stable.
   */
  depth = Math.max(0, Math.min(1, depth));

  return depth;
}

/**
 * Convert depth to eye separation.
 *
 * Far/background = larger separation.
 * Near/heart = smaller separation.
 */
function getSeparation(depth: number) {
  const separation =
    MAX_SEPARATION -
    depth * (MAX_SEPARATION - MIN_SEPARATION);

  return Math.round(separation);
}

function makeSeed(config: MagicEyeConfig, generateKey: number) {
  let seed = generateKey * 1009 + 17;

  for (let i = 0; i < config.name.length; i += 1) {
    seed += config.name.charCodeAt(i) * (i + 1);
  }

  seed += config.gender === 'male' ? 313 : 719;

  return seed >>> 0;
}

export default function StereogramCanvas({
  config,
  generateKey,
  onDataUrl,
}: StereogramCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || generateKey <= 0) {
      return;
    }

    let animationFrame = 0;

    setRendering(true);

    animationFrame = window.requestAnimationFrame(() => {
      const ctx = canvas.getContext('2d', {
        alpha: false,
      });

      if (!ctx) {
        setRendering(false);
        return;
      }

      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;

      /*
       * Create the final image.
       */
      const image = ctx.createImageData(
        CANVAS_W,
        CANVAS_H
      );

      const seed = makeSeed(config, generateKey);
      const random = seededRandom(seed);

      /*
       * Classic black/white diagnostic dots.
       *
       * We deliberately use monochrome here.
       * Colour will come later after the 3D shape works.
       */
      const dotValues = new Uint8Array(CANVAS_W);

      for (let x = 0; x < CANVAS_W; x += 1) {
        dotValues[x] = random() > 0.5 ? 255 : 0;
      }

      /*
       * Process every row independently.
       *
       * This is important for a real SIRDS.
       */
      for (let y = 0; y < CANVAS_H; y += 1) {
        const uf = new UnionFind(CANVAS_W);

        /*
         * Connect pixels according to the depth map.
         */
        for (
          let x = 0;
          x < CANVAS_W;
          x += 1
        ) {
          const depth = getHeartDepth(x, y);

          const separation = getSeparation(depth);

          const left =
            Math.round(
              x - separation / 2
            );

          const right =
            Math.round(
              x + separation / 2
            );

          if (
            left >= 0 &&
            left < CANVAS_W &&
            right >= 0 &&
            right < CANVAS_W &&
            left !== right
          ) {
            uf.union(left, right);
          }
        }

        /*
         * Assign one random dot colour to every
         * connected equivalence class.
         */
        const groupColors = new Map<
          number,
          number
        >();

        for (
          let x = 0;
          x < CANVAS_W;
          x += 1
        ) {
          const root = uf.find(x);

          let value = groupColors.get(root);

          if (value === undefined) {
            value =
              random() > 0.5 ? 255 : 0;

            groupColors.set(root, value);
          }

          dotValues[x] = value;
        }

        /*
         * Write the row into ImageData.
         */
        const rowOffset =
          y * CANVAS_W * 4;

        for (
          let x = 0;
          x < CANVAS_W;
          x += 1
        ) {
          const value = dotValues[x];
          const index =
            rowOffset + x * 4;

          image.data[index] = value;
          image.data[index + 1] = value;
          image.data[index + 2] = value;
          image.data[index + 3] = 255;
        }
      }

      ctx.putImageData(image, 0, 0);

      /*
       * Small convergence dots.
       *
       * Look at these first, then slowly relax your eyes
       * so the dots appear to move together.
       */
      ctx.fillStyle = '#111111';

      ctx.beginPath();
      ctx.arc(174, 22, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(226, 22, 4, 0, Math.PI * 2);
      ctx.fill();

      /*
       * Diagnostic label.
       * This is outside the stereogram area.
       */
      ctx.font =
        'bold 13px Arial, sans-serif';

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle =
        'rgba(255,255,255,0.85)';

      ctx.fillText(
        'FOCUS THROUGH THE PATTERN',
        CANVAS_W / 2,
        CANVAS_H - 20
      );

      /*
       * Export image for sharing.
       */
      try {
        const dataUrl =
          canvas.toDataURL('image/png');

        onDataUrl?.(dataUrl);
      } catch {
        // Ignore export errors.
      }

      setRendering(false);
    });

    return () => {
      window.cancelAnimationFrame(
        animationFrame
      );
    };
  }, [
    config,
    generateKey,
    onDataUrl,
  ]);

  return (
    <div className="w-full flex flex-col items-center">
      <div
        id="magic-eye-canvas"
        className="relative w-full max-w-[400px] overflow-hidden rounded-2xl"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block w-full h-auto"
          aria-label="Magic Eye diagnostic stereogram containing a hidden 3D heart"
        />

        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 shadow-lg">
              Building 3D stereogram...
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 max-w-[400px] px-4 text-center">
        <p className="text-sm font-semibold text-gray-800">
          Magic Eye diagnostic test
        </p>

        <p className="mt-2 text-xs leading-5 text-gray-600">
          Keep the pattern about 30–50 cm away.
          Look at the two dots, then slowly relax
          your eyes and try to look through the
          screen rather than directly at the dots.
        </p>

        <p className="mt-2 text-xs leading-5 text-gray-500">
          If the stereogram is working, a
          rounded 3D heart should appear inside
          the random dots.
        </p>
      </div>
    </div>
  );
}
