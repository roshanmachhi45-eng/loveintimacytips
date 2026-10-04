import { useCallback, useEffect, useRef, useState } from 'react';
import { PALETTES, type ColorPalette } from './palettes';
import type { MagicEyeConfig } from './types';

interface StereogramCanvasProps {
  config: MagicEyeConfig;
  paletteIndex: number;
  generateKey: number;
  onCanvasReady?: (dataUrl: string) => void;
}

const CANVAS_W = 400;
const CANVAS_H = 600;

/*
 * Geometric Magic Eye settings.
 *
 * The pattern is intentionally much clearer than random dots.
 * This makes the image easier for beginners to look through.
 */
const PATTERN_PERIOD = 72;
const MAX_DEPTH_SHIFT = 18;

/*
 * ---------------------------------------------------------
 * SAFE PALETTE HELPERS
 * ---------------------------------------------------------
 */

function getPaletteValue(
  palette: ColorPalette,
  key: string,
  fallback: string
): string {
  const value = (
    palette as unknown as Record<string, unknown>
  )[key];

  return typeof value === 'string'
    ? value
    : fallback;
}

/*
 * ---------------------------------------------------------
 * SEEDED RANDOM
 * ---------------------------------------------------------
 */

function seededRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;

    let t = value;

    t = Math.imul(
      t ^ (t >>> 15),
      t | 1
    );

    t ^= t + Math.imul(
      t ^ (t >>> 7),
      t | 61
    );

    return (
      ((t ^ (t >>> 14)) >>> 0) /
      4294967296
    );
  };
}

/*
 * ---------------------------------------------------------
 * FACE GEOMETRY
 * ---------------------------------------------------------
 *
 * The important point here:
 *
 * We do NOT draw a face onto the canvas.
 *
 * We only create a mathematical DEPTH MAP.
 *
 * The stereogram pattern is then displaced according to
 * this depth map.
 * ---------------------------------------------------------
 */

function ellipse(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): number {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;

  const distance =
    dx * dx + dy * dy;

  if (distance >= 1) {
    return 0;
  }

  return Math.pow(
    1 - distance,
    0.65
  );
}

function roundedRect(
  x: number,
  y: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
  radius: number
): number {
  const cx =
    Math.max(
      left + radius,
      Math.min(
        x,
        right - radius
      )
    );

  const cy =
    Math.max(
      top + radius,
      Math.min(
        y,
        bottom - radius
      )
    );

  const dx =
    (x - cx) / radius;

  const dy =
    (y - cy) / radius;

  const distance =
    dx * dx + dy * dy;

  if (distance >= 1) {
    return 0;
  }

  return Math.pow(
    1 - distance,
    0.7
  );
}

/*
 * ---------------------------------------------------------
 * FACE DEPTH MAP
 * ---------------------------------------------------------
 */

function getFaceDepth(
  x: number,
  y: number,
  config: MagicEyeConfig
): number {
  const centerX =
    CANVAS_W / 2;

  /*
   * Move the face slightly upward so there is space below
   * for the result text outside the canvas.
   */
  const centerY = 285;

  /*
   * -----------------------------------------------
   * FACE OUTLINE
   * -----------------------------------------------
   */

  let face = 0;

  if (
    config.faceStructure === 'round'
  ) {
    face = ellipse(
      x,
      y,
      centerX,
      centerY,
      112,
      132
    );
  } else if (
    config.faceStructure === 'square'
  ) {
    face = roundedRect(
      x,
      y,
      centerX - 108,
      centerY - 132,
      centerX + 108,
      centerY + 130,
      48
    );
  } else {
    /*
     * Default / oval.
     */
    face = ellipse(
      x,
      y,
      centerX,
      centerY,
      103,
      137
    );
  }

  if (face <= 0) {
    /*
     * Hair can extend above the face.
     */
    const hairTop =
      getHairDepth(
        x,
        y,
        centerX,
        centerY,
        config
      );

    return hairTop * 0.55;
  }

  /*
   * -----------------------------------------------
   * BASE FACE DEPTH
   * -----------------------------------------------
   */

  let depth =
    0.30 +
    face * 0.38;

  /*
   * -----------------------------------------------
   * CHEEKS
   * -----------------------------------------------
   */

  const leftCheek =
    ellipse(
      x,
      y,
      centerX - 46,
      centerY + 15,
      54,
      52
    );

  const rightCheek =
    ellipse(
      x,
      y,
      centerX + 46,
      centerY + 15,
      54,
      52
    );

  depth +=
    Math.max(
      leftCheek,
      rightCheek
    ) * 0.10;

  /*
   * -----------------------------------------------
   * EYES
   * -----------------------------------------------
   *
   * Eyes are shallow features rather than deep holes.
   */

  const leftEye =
    ellipse(
      x,
      y,
      centerX - 40,
      centerY - 25,
      23,
      10
    );

  const rightEye =
    ellipse(
      x,
      y,
      centerX + 40,
      centerY - 25,
      23,
      10
    );

  depth +=
    Math.max(
      leftEye,
      rightEye
    ) * 0.12;

  /*
   * -----------------------------------------------
   * NOSE
   * -----------------------------------------------
   */

  const nose =
    ellipse(
      x,
      y,
      centerX,
      centerY + 5,
      18,
      42
    );

  depth +=
    nose * 0.18;

  /*
   * -----------------------------------------------
   * MOUTH
   * -----------------------------------------------
   */

  const mouth =
    ellipse(
      x,
      y,
      centerX,
      centerY + 55,
      35,
      12
    );

  depth +=
    mouth * 0.10;

  /*
   * -----------------------------------------------
   * CHIN
   * -----------------------------------------------
   */

  const chin =
    ellipse(
      x,
      y,
      centerX,
      centerY + 91,
      48,
      34
    );

  depth +=
    chin * 0.12;

  /*
   * -----------------------------------------------
   * MALE JAW
   * -----------------------------------------------
   */

  if (config.gender === 'male') {
    if (
      config.faceStructure === 'square'
    ) {
      const jaw =
        roundedRect(
          x,
          y,
          centerX - 100,
          centerY + 32,
          centerX + 100,
          centerY + 116,
          35
        );

      depth += jaw * 0.16;
    } else {
      const jaw =
        ellipse(
          x,
          y,
          centerX,
          centerY + 55,
          90,
          75
        );

      depth += jaw * 0.10;
    }
  }

  /*
   * -----------------------------------------------
   * FEMALE CHEEK / JAW SHAPE
   * -----------------------------------------------
   */

  if (config.gender === 'female') {
    const feminineJaw =
      ellipse(
        x,
        y,
        centerX,
        centerY + 48,
        82,
        80
      );

    depth +=
      feminineJaw * 0.08;
  }

  /*
   * -----------------------------------------------
   * BEARD
   * -----------------------------------------------
   */

  if (config.gender === 'male') {
    if (
      config.beardStyle === 'stubble'
    ) {
      const beard =
        ellipse(
          x,
          y,
          centerX,
          centerY + 55,
          73,
          61
        );

      depth += beard * 0.08;
    }

    if (
      config.beardStyle === 'short'
    ) {
      const beard =
        ellipse(
          x,
          y,
          centerX,
          centerY + 55,
          78,
          65
        );

      depth += beard * 0.12;
    }

    if (
      config.beardStyle === 'full'
    ) {
      const beard =
        ellipse(
          x,
          y,
          centerX,
          centerY + 45,
          86,
          78
        );

      depth += beard * 0.16;
    }
  }

  /*
   * -----------------------------------------------
   * HAIR
   * -----------------------------------------------
   */

  depth +=
    getHairDepth(
      x,
      y,
      centerX,
      centerY,
      config
    ) * 0.18;

  /*
   * Keep everything in a safe range.
   */

  return Math.max(
    0,
    Math.min(
      1,
      depth
    )
  );
}

/*
 * ---------------------------------------------------------
 * HAIR DEPTH
 * ---------------------------------------------------------
 */

function getHairDepth(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  config: MagicEyeConfig
): number {
  if (
    config.hairStyle === 'bald'
  ) {
    return 0;
  }

  /*
   * Hair starts above the face.
   */

  const top =
    centerY - 145;

  if (y > centerY - 70) {
    return 0;
  }

  const head =
    ellipse(
      x,
      y,
      centerX,
      centerY - 42,
      112,
      100
    );

  if (head <= 0) {
    return 0;
  }

  if (
    config.hairStyle === 'curly'
  ) {
    /*
     * Small repeated bumps create a curly silhouette
     * in the depth map.
     */
    const wave =
      Math.sin(
        x * 0.20
      ) * 0.5 +
      0.5;

    return (
      head *
      (0.55 + wave * 0.35)
    );
  }

  /*
   * Straight hair.
   */

  const vertical =
    Math.max(
      0,
      Math.min(
        1,
        (centerY - 55 - y) /
          90
      )
    );

  return (
    head *
    (0.65 + vertical * 0.20)
  );
}

/*
 * ---------------------------------------------------------
 * GEOMETRIC PATTERN
 * ---------------------------------------------------------
 *
 * This is inspired by the high-contrast geometric style
 * from the reference image.
 *
 * It does NOT draw the hidden face.
 *
 * It only creates the repeating source pattern.
 * ---------------------------------------------------------
 */

function getPatternPixel(
  x: number,
  y: number,
  random: () => number
): number {
  const px =
    ((x % PATTERN_PERIOD) +
      PATTERN_PERIOD) %
    PATTERN_PERIOD;

  /*
   * Diagonal bands.
   */
  const diagonal =
    (px + y * 0.32) %
    18;

  /*
   * Secondary diagonal creates a chevron-like
   * geometric texture.
   */
  const second =
    (px - y * 0.18) %
    24;

  const bandA =
    diagonal < 7;

  const bandB =
    second < 5;

  /*
   * Occasionally invert a small block so the pattern
   * isn't perfectly mechanical.
   */
  const block =
    Math.floor(
      x / PATTERN_PERIOD
    ) +
    Math.floor(
      y / 18
    );

  const variation =
    random() > 0.985;

  const white =
    bandA !== bandB;

  if (variation) {
    return white ? 0 : 255;
  }

  return white ? 255 : 0;
}

/*
 * ---------------------------------------------------------
 * MAIN COMPONENT
 * ---------------------------------------------------------
 */

export default function StereogramCanvas({
  config,
  paletteIndex,
  generateKey,
  onCanvasReady,
}: StereogramCanvasProps) {
  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const [rendering, setRendering] =
    useState(false);

  const render =
    useCallback(() => {
      const canvas =
        canvasRef.current;

      if (!canvas) {
        return;
      }

      setRendering(true);

      try {
        const palette =
          PALETTES[
            paletteIndex %
              PALETTES.length
          ];

        canvas.width =
          CANVAS_W;

        canvas.height =
          CANVAS_H;

        const ctx =
          canvas.getContext('2d');

        if (!ctx) {
          return;
        }

        /*
         * ------------------------------------------------
         * TRUE BLACK / WHITE BASE
         * ------------------------------------------------
         *
         * This keeps the geometric stereogram close to
         * the reference image regardless of the selected
         * Loveons colour palette.
         */

        const image =
          ctx.createImageData(
            CANVAS_W,
            CANVAS_H
          );

        const pixels =
          image.data;

        const random =
          seededRandom(
            generateKey * 104729 +
              paletteIndex * 1543
          );

        /*
         * ------------------------------------------------
         * GENERATE EACH ROW
         * ------------------------------------------------
         */

        for (
          let y = 0;
          y < CANVAS_H;
          y++
        ) {
          const row =
            new Uint8ClampedArray(
              CANVAS_W * 4
            );

          for (
            let x = 0;
            x < CANVAS_W;
            x++
          ) {
            const depth =
              getFaceDepth(
                x,
                y,
                config
              );

            /*
             * Background uses the full pattern period.
             *
             * Face areas progressively shorten the
             * separation.
             */

            const separation =
              PATTERN_PERIOD -
              Math.round(
                depth *
                  MAX_DEPTH_SHIFT
              );

            let sourceX =
              x - separation;

            /*
             * Seed the first pattern period.
             */

            if (
              x < PATTERN_PERIOD
            ) {
              sourceX =
                x;

              const value =
                getPatternPixel(
                  sourceX,
                  y,
                  random
                );

              const index =
                x * 4;

              row[index] =
                value;

              row[index + 1] =
                value;

              row[index + 2] =
                value;

              row[index + 3] =
                255;

              continue;
            }

            /*
             * Safety.
             */

            if (
              sourceX < 0
            ) {
              sourceX =
                x %
                PATTERN_PERIOD;
            }

            if (
              sourceX >= x
            ) {
              sourceX =
                x - 1;
            }

            const source =
              sourceX * 4;

            const target =
              x * 4;

            /*
             * Copy already generated pixel.
             *
             * This is what creates the controlled
             * stereoscopic repetition.
             */

            row[target] =
              row[source];

            row[target + 1] =
              row[source + 1];

            row[target + 2] =
              row[source + 2];

            row[target + 3] =
              255;
          }

          pixels.set(
            row,
            y * CANVAS_W * 4
          );
        }

        /*
         * ------------------------------------------------
         * DRAW FINAL STEREOGRAM
         * ------------------------------------------------
         */

        ctx.putImageData(
          image,
          0,
          0
        );

        /*
         * IMPORTANT:
         *
         * No heart.
         * No partner name.
         * No face outline.
         * No text.
         * No visible guide.
         *
         * The canvas itself is ONLY the stereogram.
         */

        /*
         * ------------------------------------------------
         * EXPORT FOR SHARE CARD
         * ------------------------------------------------
         */

        const dataUrl =
          canvas.toDataURL(
            'image/png'
          );

        onCanvasReady?.(
          dataUrl
        );
      } catch (error) {
        console.error(
          'Love Magic Eye render error:',
          error
        );
      } finally {
        /*
         * Never leave the spinner running.
         */
        setRendering(false);
      }
    }, [
      config,
      paletteIndex,
      generateKey,
      onCanvasReady,
    ]);

  useEffect(() => {
    if (
      generateKey <= 0
    ) {
      return;
    }

    const frame =
      window.requestAnimationFrame(
        render
      );

    return () => {
      window.cancelAnimationFrame(
        frame
      );
    };
  }, [
    generateKey,
    render,
  ]);

  const palette =
    PALETTES[
      paletteIndex %
        PALETTES.length
    ];

  const glow =
    getPaletteValue(
      palette,
      'primary',
      '#8b5cf6'
    );

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-[1.5rem]"
        style={{
          background:
            '#ffffff',
          border:
            `2px solid ${glow}30`,
          boxShadow:
            `0 0 35px ${glow}30`,
        }}
      >
        <canvas
          ref={canvasRef}
          className="block h-auto w-full"
          style={{
            aspectRatio:
              '400 / 600',
          }}
        />

        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <div
              className="h-9 w-9 animate-spin rounded-full border-2 border-gray-300 border-t-purple-500"
            />
          </div>
        )}
      </div>

      <p
        className="mt-3 text-xs font-mono uppercase tracking-[0.2em]"
        style={{
          color: glow,
        }}
      >
        {palette.name} Magic Eye
      </p>

      <p className="mt-2 max-w-[380px] px-4 text-center text-sm text-gray-600">
        Relax your eyes and look slightly
        behind the pattern. Let the repeated
        shapes merge to reveal the hidden
        3D image.
      </p>
    </div>
  );
}
