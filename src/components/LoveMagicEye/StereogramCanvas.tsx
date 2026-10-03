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
 * SIRDS viewing parameters.
 *
 * Larger FAR_SEPARATION:
 *   easier to establish the repeating pattern.
 *
 * Difference between FAR and NEAR:
 *   controls visible 3D depth.
 */
const FAR_SEPARATION = 62;
const NEAR_SEPARATION = 38;

/*
 * Depth region.
 */
const FACE_CENTER_X = CANVAS_W / 2;
const FACE_CENTER_Y = 275;

/*
 * Fallback palette in case a palette entry is missing.
 */
const FALLBACK_PALETTE = {
  name: 'Love Matrix',
  bg: '#13091f',
  primary: '#ec4899',
  secondary: '#8b5cf6',
  starColor: '#ffffff',
  heartColor: '#f472b6',
  textColor: '#ffffff',
  patternColors: [
    '#8b5cf6',
    '#a78bfa',
    '#ec4899',
    '#f472b6',
    '#c4b5fd',
    '#ffffff',
  ],
};

/*
 * ----------------------------------------------------------
 * MAIN COMPONENT
 * ----------------------------------------------------------
 */

export default function StereogramCanvas({
  config,
  paletteIndex,
  generateKey,
  onCanvasReady,
}: StereogramCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [rendering, setRendering] =
    useState(false);

  /*
   * --------------------------------------------------------
   * RENDER SIRDS
   * --------------------------------------------------------
   */

  const render = useCallback(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    setRendering(true);

    /*
     * Give React/browser a chance to paint the loading
     * state before the CPU-heavy stereogram generation.
     */
    window.requestAnimationFrame(() => {
      try {
        /*
         * --------------------------------------------------
         * SAFE PALETTE
         * --------------------------------------------------
         */

        const paletteCount =
          Array.isArray(PALETTES)
            ? PALETTES.length
            : 0;

        const rawIndex =
          Number.isFinite(paletteIndex)
            ? Math.floor(paletteIndex)
            : 0;

        const safeIndex =
          paletteCount > 0
            ? ((rawIndex % paletteCount) +
                paletteCount) %
              paletteCount
            : 0;

        const palette:
          | ColorPalette
          | typeof FALLBACK_PALETTE =
          paletteCount > 0
            ? PALETTES[safeIndex] ??
              FALLBACK_PALETTE
            : FALLBACK_PALETTE;

        /*
         * --------------------------------------------------
         * SAFE CONFIG
         * --------------------------------------------------
         */

        const gender =
          config.gender === 'male'
            ? 'male'
            : 'female';

        const faceStructure =
          config.faceStructure === 'round' ||
          config.faceStructure === 'square'
            ? config.faceStructure
            : 'oval';

        const faceTone =
          config.faceTone === 'dark' ||
          config.faceTone === 'fair'
            ? config.faceTone
            : 'wheatish';

        const hairStyle =
          config.hairStyle === 'bald' ||
          config.hairStyle === 'curly'
            ? config.hairStyle
            : 'straight';

        const beardStyle =
          config.beardStyle === 'stubble' ||
          config.beardStyle === 'short' ||
          config.beardStyle === 'full'
            ? config.beardStyle
            : 'clean';

        const partnerName =
          typeof config.name === 'string'
            ? config.name
                .trim()
                .slice(0, 24)
            : '';

        /*
         * --------------------------------------------------
         * CANVAS
         * --------------------------------------------------
         */

        canvas.width = CANVAS_W;
        canvas.height = CANVAS_H;

        const ctx =
          canvas.getContext('2d');

        if (!ctx) {
          setRendering(false);
          return;
        }

        /*
         * --------------------------------------------------
         * BACKGROUND
         * --------------------------------------------------
         */

        const background =
          typeof palette.bg === 'string'
            ? palette.bg
            : FALLBACK_PALETTE.bg;

        ctx.fillStyle =
          background;

        ctx.fillRect(
          0,
          0,
          CANVAS_W,
          CANVAS_H,
        );

        /*
         * --------------------------------------------------
         * NAME DEPTH MAP
         * --------------------------------------------------
         *
         * The partner's name is rendered onto a hidden
         * offscreen canvas and converted into depth.
         *
         * This means the name becomes part of the
         * stereogram instead of being simply painted on top.
         */

        let nameDepthMap:
          | Uint8ClampedArray
          | null = null;

        let nameMapWidth = 0;
        let nameMapHeight = 0;
        let nameMapX = 0;
        let nameMapY = 0;

        if (partnerName.length > 0) {
          const nameCanvas =
            document.createElement(
              'canvas',
            );

          const nameCtx =
            nameCanvas.getContext(
              '2d',
            );

          if (nameCtx) {
            nameCanvas.width =
              CANVAS_W;

            nameCanvas.height = 100;

            nameCtx.clearRect(
              0,
              0,
              CANVAS_W,
              100,
            );

            nameCtx.font =
              '700 34px Arial, sans-serif';

            nameCtx.textAlign =
              'center';

            nameCtx.textBaseline =
              'middle';

            nameCtx.fillStyle =
              '#ffffff';

            nameCtx.fillText(
              partnerName,
              CANVAS_W / 2,
              50,
            );

            const nameImage =
              nameCtx.getImageData(
                0,
                0,
                CANVAS_W,
                100,
              );

            nameDepthMap =
              nameImage.data;

            nameMapWidth =
              CANVAS_W;

            nameMapHeight =
              100;

            nameMapX = 0;

            nameMapY =
              CANVAS_H - 125;
          }
        }

        /*
         * --------------------------------------------------
         * DEPTH MAP
         * --------------------------------------------------
         *
         * This is the hidden 3D object.
         *
         * Values:
         *
         * 0 = far/background
         * 1 = closest/strongest depth
         */

        const getDepth = (
          x: number,
          y: number,
        ): number => {
          /*
           * ----------------------------------------------
           * FACE SIZE
           * ----------------------------------------------
           */

          let rx = 78;
          let ry = 104;

          if (
            faceStructure ===
            'round'
          ) {
            rx = 88;
            ry = 88;
          }

          if (
            faceStructure ===
            'square'
          ) {
            rx = 88;
            ry = 91;
          }

          /*
           * ----------------------------------------------
           * NORMALIZED FACE COORDINATES
           * ----------------------------------------------
           */

          const dx =
            (x - FACE_CENTER_X) /
            rx;

          const dy =
            (y - FACE_CENTER_Y) /
            ry;

          const distance =
            Math.sqrt(
              dx * dx +
                dy * dy,
            );

          let depth = 0;

          /*
           * ----------------------------------------------
           * MAIN FACE VOLUME
           * ----------------------------------------------
           */

          if (distance < 1) {
            if (
              faceStructure ===
              'square'
            ) {
              /*
               * Square face:
               * stronger planar structure.
               */
              const edge =
                Math.max(
                  Math.abs(dx),
                  Math.abs(dy),
                );

              depth =
                (1 - edge) *
                0.86;
            } else {
              /*
               * Oval/Round:
               * smooth spherical surface.
               */
              depth =
                Math.cos(
                  distance *
                    Math.PI *
                    0.5,
                ) * 0.86;
            }

            /*
             * ------------------------------------------
             * FOREHEAD
             * ------------------------------------------
             */

            if (
              dy < -0.2 &&
              dy > -0.75
            ) {
              depth +=
                (1 -
                  Math.abs(dx)) *
                0.035;
            }

            /*
             * ------------------------------------------
             * EYES
             * ------------------------------------------
             *
             * Eye sockets are slightly recessed.
             */

            const eyeY =
              y -
              (FACE_CENTER_Y - 22);

            if (
              eyeY > -7 &&
              eyeY < 9 &&
              Math.abs(dx) > 0.22 &&
              Math.abs(dx) < 0.67
            ) {
              depth -= 0.09;
            }

            /*
             * ------------------------------------------
             * NOSE BRIDGE
             * ------------------------------------------
             */

            const noseX =
              Math.abs(
                x -
                  FACE_CENTER_X,
              );

            const noseY =
              y -
              (FACE_CENTER_Y - 12);

            if (
              noseX < 7 &&
              noseY > -18 &&
              noseY < 30
            ) {
              depth +=
                (1 -
                  noseX / 7) *
                0.25;
            }

            /*
             * NOSE TIP
             */

            if (
              noseX < 10 &&
              noseY > 14 &&
              noseY < 39
            ) {
              depth +=
                (1 -
                  noseX / 10) *
                0.15;
            }

            /*
             * ------------------------------------------
             * CHEEKBONES
             * ------------------------------------------
             */

            const cheekY =
              y -
              (FACE_CENTER_Y + 7);

            if (
              cheekY > -7 &&
              cheekY < 29 &&
              Math.abs(dx) > 0.28 &&
              Math.abs(dx) < 0.75
            ) {
              depth += 0.075;
            }

            /*
             * ------------------------------------------
             * MOUTH AREA
             * ------------------------------------------
             */

            const mouthY =
              y -
              (FACE_CENTER_Y + 34);

            if (
              mouthY > -7 &&
              mouthY < 8 &&
              Math.abs(dx) < 0.30
            ) {
              depth -= 0.045;
            }

            /*
             * ------------------------------------------
             * CHIN
             * ------------------------------------------
             */

            const chinY =
              y -
              (FACE_CENTER_Y + 61);

            if (
              chinY > -13 &&
              chinY < 20 &&
              Math.abs(dx) < 0.46
            ) {
              depth += 0.10;
            }

            /*
             * ------------------------------------------
             * MALE JAW
             * ------------------------------------------
             */

            if (
              gender === 'male'
            ) {
              if (
                dy > 0.20 &&
                dy < 0.88 &&
                Math.abs(dx) >
                  0.40
              ) {
                depth += 0.065;
              }
            }

            /*
             * ------------------------------------------
             * FEMALE CHEEK / JAW
             * ------------------------------------------
             */

            if (
              gender ===
              'female'
            ) {
              if (
                dy > 0.10 &&
                dy < 0.72 &&
                Math.abs(dx) >
                  0.48
              ) {
                depth += 0.035;
              }
            }

            /*
             * ------------------------------------------
             * MALE BEARD
             * ------------------------------------------
             */

            if (
              gender ===
                'male' &&
              beardStyle !==
                'clean'
            ) {
              const beardArea =
                dy > 0.20 &&
                dy < 0.82 &&
                Math.abs(dx) <
                  0.82;

              if (beardArea) {
                if (
                  beardStyle ===
                  'stubble'
                ) {
                  const grain =
                    Math.sin(
                      x * 1.73 +
                        y * 0.91,
                    ) *
                    Math.cos(
                      y * 1.31,
                    );

                  depth +=
                    0.035 +
                    Math.max(
                      grain,
                      0,
                    ) *
                      0.025;
                }

                if (
                  beardStyle ===
                  'short'
                ) {
                  depth +=
                    0.085;
                }

                if (
                  beardStyle ===
                  'full'
                ) {
                  depth +=
                    0.145;
                }
              }
            }
          }

          /*
           * ----------------------------------------------
           * HAIR VOLUME
           * ----------------------------------------------
           */

          if (
            hairStyle !==
            'bald'
          ) {
            /*
             * Top hair.
             */

            const topHair =
              dy < -0.55 &&
              dy > -1.35 &&
              Math.abs(dx) <
                1.18;

            /*
             * Side hair.
             */

            const sideHair =
              Math.abs(dx) >
                0.70 &&
              Math.abs(dx) <
                1.25 &&
              dy > -0.55 &&
              dy < 0.48;

            if (
              topHair ||
              sideHair
            ) {
              if (
                hairStyle ===
                'straight'
              ) {
                depth =
                  Math.max(
                    depth,
                    0.54,
                  );

                depth +=
                  (1 -
                    Math.min(
                      Math.abs(
                        dx,
                      ),
                      1,
                    )) *
                  0.055;
              }

              if (
                hairStyle ===
                'curly'
              ) {
                const curl =
                  Math.sin(
                    x * 0.24,
                  ) *
                  Math.cos(
                    y * 0.20,
                  );

                depth =
                  Math.max(
                    depth,
                    0.50,
                  );

                depth +=
                  Math.max(
                    curl,
                    0,
                  ) *
                  0.12;
              }
            }
          }

          /*
           * ----------------------------------------------
           * FACE TONE
           * ----------------------------------------------
           *
           * Tone subtly changes depth intensity.
           */

          if (
            faceTone ===
            'dark'
          ) {
            depth *= 0.98;
          }

          if (
            faceTone ===
            'fair'
          ) {
            depth *= 1.02;
          }

          /*
           * ----------------------------------------------
           * PARTNER NAME
           * ----------------------------------------------
           */

          if (
            nameDepthMap &&
            y >= nameMapY &&
            y <
              nameMapY +
                nameMapHeight
          ) {
            const localX =
              x - nameMapX;

            const localY =
              y - nameMapY;

            if (
              localX >= 0 &&
              localX <
                nameMapWidth &&
              localY >= 0 &&
              localY <
                nameMapHeight
            ) {
              const pixelIndex =
                (localY *
                  nameMapWidth +
                  localX) *
                4;

              const alpha =
                nameDepthMap[
                  pixelIndex + 3
                ];

              if (
                alpha > 20
              ) {
                depth =
                  Math.max(
                    depth,
                    0.48,
                  );
              }
            }
          }

          /*
           * Keep everything in valid range.
           */

          return Math.min(
            Math.max(
              depth,
              0,
            ),
            1,
          );
        };

        /*
         * --------------------------------------------------
         * RANDOM COLOR SOURCE
         * --------------------------------------------------
         */

        const sourceColors =
          Array.isArray(
            palette.patternColors,
          ) &&
          palette.patternColors
            .length > 0
            ? palette.patternColors
            : FALLBACK_PALETTE.patternColors;

        /*
         * Convert hex colors into RGB once.
         */

        const rgbColors =
          sourceColors.map(
            (color) => {
              if (
                typeof color !==
                  'string' ||
                !/^#[0-9a-fA-F]{6}$/.test(
                  color,
                )
              ) {
                return [
                  255,
                  255,
                  255,
                ];
              }

              return [
                parseInt(
                  color.slice(
                    1,
                    3,
                  ),
                  16,
                ),
                parseInt(
                  color.slice(
                    3,
                    5,
                  ),
                  16,
                ),
                parseInt(
                  color.slice(
                    5,
                    7,
                  ),
                  16,
                ),
              ];
            },
          );

        /*
         * --------------------------------------------------
         * FINAL SIRDS IMAGE
         * --------------------------------------------------
         *
         * Each horizontal scanline is solved independently.
         *
         * For every point:
         *
         *   depth -> stereo separation
         *   separation -> corresponding left/right pixels
         *   corresponding pixels -> same-color constraint
         *
         * This is the core of a Single Image Random Dot
         * Stereogram.
         */

        const image =
          ctx.createImageData(
            CANVAS_W,
            CANVAS_H,
          );

        const imageData =
          image.data;

        /*
         * Deterministic seed for the generated pattern.
         *
         * This keeps the same generated result stable while
         * still making different generations different.
         */

        let seed =
          2166136261;

        const seedText =
          `${partnerName}|${gender}|${faceStructure}|${faceTone}|${hairStyle}|${beardStyle}|${generateKey}|${safeIndex}`;

        for (
          let i = 0;
          i < seedText.length;
          i++
        ) {
          seed ^=
            seedText.charCodeAt(
              i,
            );

          seed =
            Math.imul(
              seed,
              16777619,
            );
        }

        const random = () => {
          seed +=
            0x6d2b79f5;

          let t = seed;

          t =
            Math.imul(
              t ^
                (t >>> 15),
              t | 1,
            );

          t ^=
            t +
            Math.imul(
              t ^
                (t >>> 7),
              t | 61,
            );

          return (
            (t ^
              (t >>> 14)) >>>
            0
          ) /
            4294967296;
        };

        /*
         * --------------------------------------------------
         * PROCESS EACH ROW
         * --------------------------------------------------
         */

        for (
          let y = 0;
          y < CANVAS_H;
          y++
        ) {
          /*
           * Union-Find / equivalence classes.
           *
           * Pixels in the same class MUST receive the
           * same random color.
           */

          const parent =
            new Int32Array(
              CANVAS_W,
            );

          const rank =
            new Uint8Array(
              CANVAS_W,
            );

          for (
            let x = 0;
            x < CANVAS_W;
            x++
          ) {
            parent[x] = x;
          }

          const find = (
            value: number,
          ): number => {
            let current =
              value;

            while (
              parent[current] !==
              current
            ) {
              current =
                parent[current];
            }

            /*
             * Path compression.
             */

            let node =
              value;

            while (
              parent[node] !==
              node
            ) {
              const next =
                parent[node];

              parent[node] =
                current;

              node = next;
            }

            return current;
          };

          const union = (
            a: number,
            b: number,
          ) => {
            let rootA =
              find(a);

            let rootB =
              find(b);

            if (
              rootA ===
              rootB
            ) {
              return;
            }

            if (
              rank[rootA] <
              rank[rootB]
            ) {
              const temp =
                rootA;

              rootA =
                rootB;

              rootB =
                temp;
            }

            parent[rootB] =
              rootA;

            if (
              rank[rootA] ===
              rank[rootB]
            ) {
              rank[rootA]++;
            }
          };

          /*
           * ----------------------------------------------
           * CREATE PIXEL CONSTRAINTS
           * ----------------------------------------------
           */

          for (
            let x = 0;
            x < CANVAS_W;
            x++
          ) {
            const depth =
              getDepth(
                x,
                y,
              );

            /*
             * Far objects have larger repeating separation.
             * Near objects have smaller separation.
             */

            const separation =
              Math.round(
                FAR_SEPARATION -
                  depth *
                    (FAR_SEPARATION -
                      NEAR_SEPARATION),
              );

            /*
             * Slight alternating correction prevents a
             * systematic odd/even rounding bias.
             */

            const adjusted =
              separation +
              ((separation &
                1) &&
              (y & 1)
                ? 1
                : 0);

            const left =
              x -
              Math.floor(
                adjusted / 2,
              );

            const right =
              left +
              adjusted;

            if (
              left >= 0 &&
              right <
                CANVAS_W
            ) {
              union(
                left,
                right,
              );
            }
          }

          /*
           * ----------------------------------------------
           * RANDOM COLOR PER CONSTRAINT GROUP
           * ----------------------------------------------
           */

          const rootColor =
            new Map<
              number,
              number[]
            >();

          for (
            let x = 0;
            x < CANVAS_W;
            x++
          ) {
            const root =
              find(x);

            if (
              !rootColor.has(
                root,
              )
            ) {
              const color =
                rgbColors[
                  Math.floor(
                    random() *
                      rgbColors.length,
                  )
                ] ??
                [255, 255, 255];

              rootColor.set(
                root,
                color,
              );
            }

            const color =
              rootColor.get(
                root,
              ) ??
              [255, 255, 255];

            const index =
              (y *
                CANVAS_W +
                x) *
              4;

            imageData[index] =
              color[0];

            imageData[
              index + 1
            ] = color[1];

            imageData[
              index + 2
            ] = color[2];

            imageData[
              index + 3
            ] = 255;
          }
        }

        /*
         * --------------------------------------------------
         * PUT SIRDS ON SCREEN
         * --------------------------------------------------
         */

        ctx.putImageData(
          image,
          0,
          0,
        );

        /*
         * --------------------------------------------------
         * CONVERGENCE DOTS
         * --------------------------------------------------
         *
         * These are NOT part of the hidden image.
         * They help users establish the correct viewing
         * distance/focus.
         */

        ctx.save();

        ctx.fillStyle =
          '#ffffff';

        ctx.shadowColor =
          typeof palette.primary ===
          'string'
            ? palette.primary
            : '#ec4899';

        ctx.shadowBlur = 5;

        const dotY =
          CANVAS_H - 18;

        ctx.beginPath();

        ctx.arc(
          CANVAS_W / 2 -
            FAR_SEPARATION /
              2,
          dotY,
          3,
          0,
          Math.PI * 2,
        );

        ctx.fill();

        ctx.beginPath();

        ctx.arc(
          CANVAS_W / 2 +
            FAR_SEPARATION /
              2,
          dotY,
          3,
          0,
          Math.PI * 2,
        );

        ctx.fill();

        ctx.restore();

        /*
         * --------------------------------------------------
         * VERY SUBTLE HEARTS
         * --------------------------------------------------
         *
         * Do NOT paint large flat elements over the SIRDS.
         * They would interfere with the hidden image.
         */

        const heartColor =
          typeof palette.heartColor ===
          'string'
            ? palette.heartColor
            : FALLBACK_PALETTE.heartColor;

        for (
          let i = 0;
          i < 3;
          i++
        ) {
          const hx =
            30 +
            random() *
              (CANVAS_W -
                60);

          const hy =
            35 +
            random() *
              (CANVAS_H -
                90);

          ctx.save();

          ctx.globalAlpha =
            0.018;

          ctx.fillStyle =
            heartColor;

          drawHeart(
            ctx,
            hx,
            hy,
            6,
          );

          ctx.restore();
        }

        /*
         * --------------------------------------------------
         * SHARE IMAGE
         * --------------------------------------------------
         */

        const dataUrl =
          canvas.toDataURL(
            'image/png',
          );

        if (
          typeof onCanvasReady ===
          'function'
        ) {
          onCanvasReady(
            dataUrl,
          );
        }
      } catch (error) {
        /*
         * Never let a canvas error crash the whole Loveons
         * page.
         */

        console.error(
          'Love Magic Eye SIRDS error:',
          error,
        );
      } finally {
        setRendering(false);
      }
    });
  }, [
    config,
    paletteIndex,
    generateKey,
    onCanvasReady,
  ]);

  /*
   * --------------------------------------------------------
   * GENERATE
   * --------------------------------------------------------
   */

  useEffect(() => {
    if (
      generateKey > 0
    ) {
      render();
    }
  }, [
    generateKey,
    render,
  ]);

  /*
   * --------------------------------------------------------
   * SAFE DISPLAY PALETTE
   * --------------------------------------------------------
   */

  const paletteCount =
    Array.isArray(PALETTES)
      ? PALETTES.length
      : 0;

  const rawDisplayIndex =
    Number.isFinite(
      paletteIndex,
    )
      ? Math.floor(
          paletteIndex,
        )
      : 0;

  const safeDisplayIndex =
    paletteCount > 0
      ? ((rawDisplayIndex %
          paletteCount) +
          paletteCount) %
        paletteCount
      : 0;

  const displayPalette =
    PALETTES[
      safeDisplayIndex
    ] ??
    FALLBACK_PALETTE;

  const primary =
    typeof displayPalette.primary ===
    'string'
      ? displayPalette.primary
      : FALLBACK_PALETTE.primary;

  const secondary =
    typeof displayPalette.secondary ===
    'string'
      ? displayPalette.secondary
      : FALLBACK_PALETTE.secondary;

  const paletteName =
    typeof displayPalette.name ===
    'string'
      ? displayPalette.name
      : FALLBACK_PALETTE.name;

  /*
   * --------------------------------------------------------
   * UI
   * --------------------------------------------------------
   */

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-[1.5rem]"
        style={{
          boxShadow: `
            0 0 30px ${primary}45,
            0 0 70px ${secondary}25
          `,
          border:
            `2px solid ${primary}35`,
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[2px]">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
      </div>

      <p
        className="mt-2 text-center font-mono text-xs uppercase tracking-[0.18em]"
        style={{
          color: primary,
        }}
      >
        {paletteName}{' '}
        Matrix Engine
      </p>

      <p className="mt-2 max-w-[340px] px-4 text-center text-[11px] leading-relaxed text-slate-400">
        Look through the pattern,
        not directly at the dots.
        Relax your eyes and let the
        hidden 3D image appear.
      </p>
    </div>
  );
}

/*
 * ----------------------------------------------------------
 * HEART
 * ----------------------------------------------------------
 */

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  ctx.beginPath();

  ctx.moveTo(
    x,
    y + size * 0.3,
  );

  ctx.bezierCurveTo(
    x,
    y,
    x - size,
    y,
    x - size,
    y + size * 0.5,
  );

  ctx.bezierCurveTo(
    x - size,
    y + size * 0.9,
    x,
    y + size * 1.1,
    x,
    y + size * 1.3,
  );

  ctx.bezierCurveTo(
    x,
    y + size * 1.1,
    x + size,
    y + size * 0.9,
    x + size,
    y + size * 0.5,
  );

  ctx.bezierCurveTo(
    x + size,
    y,
    x,
    y,
    x,
    y + size * 0.3,
  );

  ctx.fill();
}


