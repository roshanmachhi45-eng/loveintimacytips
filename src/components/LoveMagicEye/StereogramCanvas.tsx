import React, { useEffect, useRef, useState } from 'react';
import type { MagicEyeConfig } from './types';

interface StereogramCanvasProps {
  config: MagicEyeConfig;
  paletteIndex?: number;
  onCanvasReady?: (dataUrl: string) => void;
}

const WIDTH = 600;
const HEIGHT = 800;

/*
 * Classic autostereogram parameters.
 *
 * The important part is that the image is generated from:
 *
 * 1. A real depth map
 * 2. Stereo separation based on depth
 * 3. Hidden-surface removal
 * 4. Pixel correspondence constraints
 * 5. A fine repeating carrier pattern
 *
 * Nothing is drawn visibly on top of the stereogram.
 */

const EYE_SEPARATION = 150;
const MU = 0.33;

const MIN_DEPTH = 0;
const MAX_DEPTH = 1;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const smoothStep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const ellipse = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
) => {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy;
};

const roundedRectangle = (
  x: number,
  y: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
  radius: number,
) => {
  const cx = clamp(x, left + radius, right - radius);
  const cy = clamp(y, top + radius, bottom - radius);

  const dx = Math.max(Math.abs(x - cx) - radius, 0);
  const dy = Math.max(Math.abs(y - cy) - radius, 0);

  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Classic SIRDS separation formula.
 *
 * z = 0  -> far/background
 * z = 1  -> closest/foreground
 */
const getSeparation = (depth: number) => {
  const z = clamp(depth, MIN_DEPTH, MAX_DEPTH);

  return (
    ((1 - MU * z) * EYE_SEPARATION) /
    (2 - MU * z)
  );
};

/**
 * Deterministic fine black/white carrier.
 *
 * The carrier is deliberately made from small geometric elements
 * instead of random coloured pixels so the final artwork resembles
 * classic black/white optical illusion prints.
 */
const carrierPixel = (x: number, y: number, seed: number) => {
  const tile = 18;

  const px = ((x + seed) % tile + tile) % tile;
  const py = ((y + seed * 3) % tile + tile) % tile;

  const diagonalA = Math.abs(px - py);
  const diagonalB = Math.abs(px + py - tile);

  const diamond =
    diagonalA <= 2 ||
    diagonalB <= 2;

  const checker =
    ((Math.floor(px / 6) + Math.floor(py / 6)) & 1) === 0;

  const micro =
    ((x + y + seed) & 7) < 3;

  if (diamond) {
    return 0;
  }

  if (micro) {
    return 255;
  }

  return checker ? 255 : 0;
};

/**
 * Creates a smooth face depth map.
 *
 * This is intentionally a frontal 3D facial structure.
 * The face itself is NOT painted into the final image.
 * Only depth influences pixel displacement.
 */
const createDepthMap = (
  config: MagicEyeConfig,
) => {
  const depth = new Float32Array(WIDTH * HEIGHT);

  const centerX = WIDTH / 2;
  const centerY = HEIGHT * 0.48;

  let faceWidth = 118;
  let faceHeight = 176;

  if (config.faceStructure === 'round') {
    faceWidth = 132;
    faceHeight = 168;
  }

  if (config.faceStructure === 'square') {
    faceWidth = 130;
    faceHeight = 170;
  }

  const genderScale = config.gender === 'male' ? 1.04 : 0.98;

  faceWidth *= genderScale;
  faceHeight *= genderScale;

  const hairDepth =
    config.hairStyle === 'bald'
      ? 0.10
      : config.hairStyle === 'curly'
        ? 0.38
        : 0.32;

  const beardDepth =
    config.gender === 'male'
      ? config.beardStyle === 'clean'
        ? 0
        : config.beardStyle === 'stubble'
          ? 0.24
          : config.beardStyle === 'short'
            ? 0.30
            : 0.34
      : 0;

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const index = y * WIDTH + x;

      const nx = (x - centerX) / faceWidth;
      const ny = (y - centerY) / faceHeight;

      let value = 0;

      /*
       * Main head silhouette.
       */
      const headDistance = nx * nx + ny * ny;

      if (headDistance < 1.05) {
        const edge = smoothStep(1.08, 0.82, headDistance);

        value = 0.18 + edge * 0.24;

        /*
         * Face structure.
         *
         * Oval:
         *   smooth narrow lower jaw
         *
         * Round:
         *   wider cheeks
         *
         * Square:
         *   stronger jaw corners
         */
        if (config.faceStructure === 'oval') {
          const jaw = smoothStep(
            1.0,
            0.50,
            Math.abs(ny) + Math.abs(nx) * 0.22,
          );

          value += jaw * 0.10;
        }

        if (config.faceStructure === 'round') {
          const cheek =
            Math.exp(
              -(
                Math.pow((nx - 0.48) / 0.45, 2) +
                Math.pow((ny - 0.12) / 0.42, 2)
              ),
            ) +
            Math.exp(
              -(
                Math.pow((nx + 0.48) / 0.45, 2) +
                Math.pow((ny - 0.12) / 0.42, 2)
              ),
            );

          value += cheek * 0.08;
        }

        if (config.faceStructure === 'square') {
          const jawShape =
            smoothStep(
              0.80,
              0.45,
              Math.abs(nx),
            ) *
            smoothStep(
              0.70,
              0.25,
              ny,
            );

          value += jawShape * 0.12;
        }
      }

      /*
       * Forehead / central face.
       */
      const forehead =
        Math.exp(
          -(
            Math.pow((x - centerX) / (faceWidth * 0.70), 2) +
            Math.pow((y - centerY * 0.72) / (faceHeight * 0.50), 2)
          ),
        );

      value += forehead * 0.10;

      /*
       * Cheek volume.
       */
      const leftCheek =
        Math.exp(
          -(
            Math.pow((x - (centerX - faceWidth * 0.48)) / (faceWidth * 0.38), 2) +
            Math.pow((y - (centerY + faceHeight * 0.04)) / (faceHeight * 0.38), 2)
          ),
        );

      const rightCheek =
        Math.exp(
          -(
            Math.pow((x - (centerX + faceWidth * 0.48)) / (faceWidth * 0.38), 2) +
            Math.pow((y - (centerY + faceHeight * 0.04)) / (faceHeight * 0.38), 2)
          ),
        );

      value += (leftCheek + rightCheek) * 0.09;

      /*
       * Eye sockets.
       *
       * These are slightly recessed so the surrounding face
       * volume remains visible.
       */
      const eyeY = centerY - faceHeight * 0.16;
      const eyeOffset = faceWidth * 0.39;

      const leftEyeSocket = ellipse(
        x,
        y,
        centerX - eyeOffset,
        eyeY,
        faceWidth * 0.22,
        faceHeight * 0.105,
      );

      const rightEyeSocket = ellipse(
        x,
        y,
        centerX + eyeOffset,
        eyeY,
        faceWidth * 0.22,
        faceHeight * 0.105,
      );

      if (leftEyeSocket < 1 || rightEyeSocket < 1) {
        value -= 0.045;
      }

      /*
       * Eye centres.
       */
      const leftEye =
        Math.exp(
          -(
            Math.pow(
              (x - (centerX - eyeOffset)) /
                (faceWidth * 0.115),
              2,
            ) +
            Math.pow(
              (y - eyeY) /
                (faceHeight * 0.055),
              2,
            )
          ),
        );

      const rightEye =
        Math.exp(
          -(
            Math.pow(
              (x - (centerX + eyeOffset)) /
                (faceWidth * 0.115),
              2,
            ) +
            Math.pow(
              (y - eyeY) /
                (faceHeight * 0.055),
              2,
            )
          ),
        );

      value += (leftEye + rightEye) * 0.14;

      /*
       * Nose bridge.
       */
      const noseBridge =
        Math.exp(
          -(
            Math.pow(
              (x - centerX) /
                (faceWidth * 0.13),
              2,
            ) +
            Math.pow(
              (y - (centerY + faceHeight * 0.01)) /
                (faceHeight * 0.33),
              2,
            )
          ),
        );

      value += noseBridge * 0.22;

      /*
       * Nose tip.
       */
      const noseTip =
        Math.exp(
          -(
            Math.pow(
              (x - centerX) /
                (faceWidth * 0.18),
              2,
            ) +
            Math.pow(
              (y - (centerY + faceHeight * 0.20)) /
                (faceHeight * 0.11),
              2,
            )
          ),
        );

      value += noseTip * 0.20;

      /*
       * Mouth area.
       */
      const mouthY = centerY + faceHeight * 0.39;

      const mouth =
        Math.exp(
          -(
            Math.pow(
              (x - centerX) /
                (faceWidth * 0.31),
              2,
            ) +
            Math.pow(
              (y - mouthY) /
                (faceHeight * 0.065),
              2,
            )
          ),
        );

      value += mouth * 0.075;

      /*
       * Chin.
       */
      const chin =
        Math.exp(
          -(
            Math.pow(
              (x - centerX) /
                (faceWidth * 0.42),
              2,
            ) +
            Math.pow(
              (y - (centerY + faceHeight * 0.55)) /
                (faceHeight * 0.20),
              2,
            )
          ),
        );

      value += chin * 0.12;

      /*
       * Hair.
       */
      if (config.hairStyle !== 'bald') {
        const hairTop =
          smoothStep(
            centerY - faceHeight * 0.98,
            centerY - faceHeight * 0.68,
            y,
          );

        const hairShape =
          ellipse(
            x,
            y,
            centerX,
            centerY - faceHeight * 0.38,
            faceWidth * 1.03,
            faceHeight * 0.62,
          );

        if (hairShape < 1) {
          value += hairTop * hairDepth;
        }

        if (config.hairStyle === 'curly') {
          const curlWave =
            Math.sin(x * 0.23) *
              Math.sin(y * 0.17) *
              0.035;

          value += Math.max(0, curlWave);
        }
      }

      /*
       * Male jaw.
       */
      if (config.gender === 'male') {
        const jaw =
          Math.exp(
            -(
              Math.pow(
                (Math.abs(x - centerX) - faceWidth * 0.50) /
                  (faceWidth * 0.25),
                2,
              ) +
              Math.pow(
                (y - (centerY + faceHeight * 0.36)) /
                  (faceHeight * 0.25),
                2,
              )
            ),
          );

        value += jaw * 0.10;

        /*
         * Beard is represented only through depth.
         * It is never visibly painted.
         */
        if (beardDepth > 0) {
          const beardArea =
            ellipse(
              x,
              y,
              centerX,
              centerY + faceHeight * 0.31,
              faceWidth * 0.72,
              faceHeight * 0.34,
            );

          if (beardArea < 1) {
            const beardFade =
              smoothStep(
                centerY - faceHeight * 0.02,
                centerY + faceHeight * 0.16,
                y,
              );

            value += beardFade * beardDepth * 0.18;
          }
        }
      }

      /*
       * Face tone subtly changes depth character.
       * It does NOT produce colour in the final image.
       */
      if (config.faceTone === 'dark') {
        value += 0.018;
      } else if (config.faceTone === 'fair') {
        value -= 0.008;
      }

      depth[index] = clamp(value, 0, 1);
    }
  }

  /*
   * Smooth the depth map.
   *
   * This prevents jagged stereo edges and gives the hidden
   * face a continuous 3D surface.
   */
  const smoothed = new Float32Array(depth);

  for (let y = 1; y < HEIGHT - 1; y += 1) {
    for (let x = 1; x < WIDTH - 1; x += 1) {
      const index = y * WIDTH + x;

      const center = depth[index];

      const neighbours =
        depth[index - 1] +
        depth[index + 1] +
        depth[index - WIDTH] +
        depth[index + WIDTH];

      smoothed[index] =
        center * 0.58 +
        (neighbours / 4) * 0.42;
    }
  }

  return smoothed;
};

/**
 * Generate one authentic black/white SIRDS.
 */
const generateStereogram = (
  config: MagicEyeConfig,
  seed: number,
) => {
  const depth = createDepthMap(config);

  const canvas = document.createElement('canvas');

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const ctx = canvas.getContext('2d', {
    alpha: false,
  });

  if (!ctx) {
    throw new Error('Canvas rendering context unavailable.');
  }

  const image = ctx.createImageData(WIDTH, HEIGHT);
  const output = image.data;

  /*
   * Each row is solved independently.
   *
   * parent[] stores the equivalence relationship between pixels
   * that must contain the same carrier pixel.
   */
  const parent = new Int32Array(WIDTH);
  const rank = new Uint8Array(WIDTH);

  const groupValue = new Uint8Array(WIDTH);
  const groupSet = new Uint8Array(WIDTH);

  const find = (value: number): number => {
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
  };

  const union = (a: number, b: number) => {
    let rootA = find(a);
    let rootB = find(b);

    if (rootA === rootB) {
      return;
    }

    if (rank[rootA] < rank[rootB]) {
      parent[rootA] = rootB;
    } else if (rank[rootA] > rank[rootB]) {
      parent[rootB] = rootA;
    } else {
      parent[rootB] = rootA;
      rank[rootA] += 1;
    }
  };

  for (let y = 0; y < HEIGHT; y += 1) {
    /*
     * Reset union-find.
     */
    for (let x = 0; x < WIDTH; x += 1) {
      parent[x] = x;
      rank[x] = 0;
      groupSet[x] = 0;
      groupValue[x] = 0;
    }

    /*
     * Hidden-surface handling.
     *
     * Each pixel can only establish a correspondence when the
     * stereo pair remains visible. This prevents the face from
     * destroying the carrier behind it.
     */
    for (let x = 0; x < WIDTH; x += 1) {
      const index = y * WIDTH + x;
      const z = depth[index];

      if (z <= 0.015) {
        continue;
      }

      const separation = getSeparation(z);

      const left =
        Math.round(
          x - separation / 2,
        );

      const right =
        Math.round(
          x + separation / 2,
        );

      if (
        left < 0 ||
        right >= WIDTH ||
        left >= right
      ) {
        continue;
      }

      /*
       * Hidden-surface check.
       *
       * If a nearer depth lies between the two stereo positions,
       * the correspondence is discarded.
       */
      let visible = true;

      const maxCheck = Math.min(
        right - left,
        72,
      );

      for (
        let step = 1;
        step < maxCheck;
        step += 1
      ) {
        const checkX = left + step;

        const checkDepth =
          depth[y * WIDTH + checkX];

        if (
          checkDepth >
          z + 0.16
        ) {
          visible = false;
          break;
        }
      }

      if (!visible) {
        continue;
      }

      union(left, right);
    }

    /*
     * Give each equivalence group a carrier value.
     *
     * The representative coordinate determines where the group
     * samples the repeating geometric pattern.
     */
    for (let x = 0; x < WIDTH; x += 1) {
      const root = find(x);

      if (!groupSet[root]) {
        groupSet[root] = 1;

        groupValue[root] =
          carrierPixel(
            x,
            y,
            seed,
          );
      }
    }

    /*
     * Write final row.
     */
    for (let x = 0; x < WIDTH; x += 1) {
      const root = find(x);

      const value =
        groupSet[root]
          ? groupValue[root]
          : carrierPixel(
              x,
              y,
              seed,
            );

      const pixel =
        (y * WIDTH + x) * 4;

      output[pixel] = value;
      output[pixel + 1] = value;
      output[pixel + 2] = value;
      output[pixel + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);

  /*
   * Slightly soften only the microscopic rendering noise.
   * No visible face or text is added.
   */
  const finalCanvas =
    document.createElement('canvas');

  finalCanvas.width = WIDTH;
  finalCanvas.height = HEIGHT;

  const finalCtx =
    finalCanvas.getContext('2d', {
      alpha: false,
    });

  if (!finalCtx) {
    return canvas;
  }

  finalCtx.imageSmoothingEnabled = false;

  finalCtx.drawImage(
    canvas,
    0,
    0,
  );

  return finalCanvas;
};

const StereogramCanvas: React.FC<
  StereogramCanvasProps
> = ({
  config,
  paletteIndex = 0,
  onCanvasReady,
}) => {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const render = () => {
      try {
        setLoading(true);
        setError(null);

        /*
         * paletteIndex is intentionally converted into a
         * deterministic carrier seed.
         *
         * The final artwork itself remains black and white.
         */
        const seed =
          Math.abs(
            Math.floor(
              paletteIndex * 137 +
                config.name.length * 17 +
                (config.gender === 'male'
                  ? 31
                  : 11),
            ),
          ) % 997;

        const generated =
          generateStereogram(
            config,
            seed,
          );

        if (cancelled) {
          return;
        }

        const target =
          canvasRef.current;

        if (!target) {
          return;
        }

        const context =
          target.getContext('2d', {
            alpha: false,
          });

        if (!context) {
          throw new Error(
            'Unable to access display canvas.',
          );
        }

        target.width = WIDTH;
        target.height = HEIGHT;

        context.imageSmoothingEnabled = false;

        context.clearRect(
          0,
          0,
          WIDTH,
          HEIGHT,
        );

        context.drawImage(
          generated,
          0,
          0,
          WIDTH,
          HEIGHT,
        );

        const dataUrl =
          target.toDataURL(
            'image/png',
          );

        onCanvasReady?.(dataUrl);

        setLoading(false);
      } catch (renderError) {
        if (cancelled) {
          return;
        }

        console.error(
          'Love Magic Eye generation failed:',
          renderError,
        );

        setError(
          'We could not create the hidden image. Please try again.',
        );

        setLoading(false);
      }
    };

    /*
     * Give React one frame to mount the canvas before generating.
     */
    const frame =
      window.requestAnimationFrame(
        render,
      );

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [
    config,
    paletteIndex,
    onCanvasReady,
  ]);

  return (
    <div
      id="magic-eye-canvas"
      className="w-full flex flex-col items-center"
    >
      <div
        className="relative w-full max-w-[600px] overflow-hidden rounded-2xl bg-white shadow-[0_12px_45px_rgba(0,0,0,0.12)]"
        style={{
          aspectRatio: `${WIDTH}/${HEIGHT}`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          aria-label="Love Magic Eye optical illusion"
          className="block h-full w-full"
          style={{
            imageRendering: 'pixelated',
          }}
        />

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-pink-500" />

            <p className="text-sm font-medium text-gray-700">
              Creating your hidden image
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Look beyond the pattern when it appears
            </p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white p-6 text-center">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Something went wrong
              </p>

              <p className="mt-2 text-xs text-gray-500">
                {error}
              </p>
            </div>
          </div>
        )}
      </div>

      {!loading && !error && (
        <div className="mt-5 max-w-[520px] px-5 text-center">
          <p className="text-sm font-semibold tracking-wide text-gray-800">
            Look through the pattern
          </p>

          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            Relax your eyes and focus slightly beyond the
            screen. The hidden 3D image should slowly appear.
          </p>
        </div>
      )}
    </div>
  );
};

export default StereogramCanvas;



