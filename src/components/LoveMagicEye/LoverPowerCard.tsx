
import React, { useId } from 'react';
import type { CSSProperties } from 'react';
import type { MagicEyeConfig } from './types';
import { getCosmicDailyResult } from './cosmicCardLogic';

interface LoverPowerCardProps {
  config: MagicEyeConfig;
}

export default function LoverPowerCard({
  config,
}: LoverPowerCardProps) {
  const id = useId().replace(/:/g, '');
  const name = config.name.trim() || 'Your Love';
  const cosmic = getCosmicDailyResult(config);

  const {
    background,
    primaryColor,
    secondaryColor,
    glowColor,
    planetName,
    gemstoneName,
    loveMessage,
  } = cosmic;

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const styles: Record<string, CSSProperties> = {
    wrapper: {
      width: '100%',
      maxWidth: 560,
      margin: '0 auto',
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: '#ffffff',
    },
    card: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 26,
      border: `2px solid ${secondaryColor}`,
      background: `linear-gradient(145deg, ${background}, #10051f, ${background})`,
      boxShadow: `0 0 30px ${glowColor}55, 0 18px 45px #00000065`,
    },
    label: {
      margin: 0,
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: 3,
      color: secondaryColor,
    },
    panel: {
      minWidth: 0,
      padding: '16px 8px',
      textAlign: 'center',
      borderRadius: 18,
      border: `1px solid ${secondaryColor}99`,
      background: `linear-gradient(145deg, ${primaryColor}25, ${secondaryColor}12)`,
      boxSizing: 'border-box',
    },
  };

  const stars = [
    [35, 45, 2],
    [75, 100, 3],
    [315, 48, 3],
    [285, 90, 2],
    [45, 185, 2],
    [320, 205, 3],
    [95, 250, 2],
    [265, 260, 2],
    [180, 35, 2],
    [145, 270, 2],
    [25, 130, 2],
    [335, 145, 2],
  ];

  return (
    <div style={styles.wrapper}>
      <article style={styles.card}>
        {/* Cosmic nebula background */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `
              radial-gradient(
                ellipse at 0% 0%,
                ${primaryColor}65,
                transparent 42%
              ),
              radial-gradient(
                ellipse at 100% 35%,
                ${secondaryColor}55,
                transparent 42%
              ),
              radial-gradient(
                ellipse at 50% 100%,
                ${glowColor}35,
                transparent 45%
              )
            `,
          }}
        />

        {/* Header */}
        <header
          style={{
            position: 'relative',
            padding: '26px 16px 20px',
            textAlign: 'center',
          }}
        >
          <p style={styles.label}>
            ✦ LOVEONS • COSMIC LOVE ✦
          </p>

          <h2
            style={{
              margin: '15px 0 8px',
              fontSize: 'clamp(25px, 7vw, 38px)',
              fontWeight: 900,
              lineHeight: 1.2,
              textTransform: 'uppercase',
              overflowWrap: 'anywhere',
              color: '#ffffff',
              textShadow: `
                0 0 8px ${glowColor},
                0 0 22px ${primaryColor}
              `,
            }}
          >
            {name}
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: 10,
              letterSpacing: 2,
              color: '#e9d5ff',
            }}
          >
            YOUR DAILY UNIVERSE
          </p>

          <div
            style={{
              width: 95,
              height: 4,
              margin: '17px auto 0',
              borderRadius: 10,
              background: `linear-gradient(90deg, ${primaryColor}, #ffffff, ${secondaryColor})`,
              boxShadow: `0 0 14px ${glowColor}`,
            }}
          />
        </header>

        {/* Cosmic planet illustration */}
        <div style={{ position: 'relative', padding: '0 12px' }}>
          <div
            style={{
              overflow: 'hidden',
              borderRadius: 22,
              border: `1px solid ${secondaryColor}99`,
              background: `linear-gradient(180deg, ${primaryColor}20, #080313 90%)`,
            }}
          >
            <svg
              viewBox="0 0 360 310"
              role="img"
              aria-label={`Cosmic love illustration for ${name}`}
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
              }}
            >
              <defs>
                <radialGradient
                  id={`${id}-planet`}
                  cx="32%"
                  cy="25%"
                  r="80%"
                >
                  <stop offset="0%" stopColor={secondaryColor} />
                  <stop offset="50%" stopColor={primaryColor} />
                  <stop offset="100%" stopColor={background} />
                </radialGradient>

                <radialGradient id={`${id}-aura`}>
                  <stop
                    offset="0%"
                    stopColor={glowColor}
                    stopOpacity="0.8"
                  />
                  <stop
                    offset="65%"
                    stopColor={primaryColor}
                    stopOpacity="0.3"
                  />
                  <stop
                    offset="100%"
                    stopColor={background}
                    stopOpacity="0"
                  />
                </radialGradient>

                <linearGradient
                  id={`${id}-ring`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor={primaryColor} />
                  <stop offset="100%" stopColor={secondaryColor} />
                </linearGradient>

                <clipPath id={`${id}-clip`}>
                  <circle cx="180" cy="145" r="55" />
                </clipPath>
              </defs>

              {/* Glowing nebula */}
              <circle
                cx="180"
                cy="145"
                r="135"
                fill={`url(#${id}-aura)`}
              />

              {/* Distant stars */}
              {stars.map(([x, y, r], index) => (
                <g key={index} fill="#ffffff">
                  {index % 3 === 0 ? (
                    <path
                      d={`M${x} ${y - r * 2} L${x + r * 0.65} ${y - r * 0.65} L${x + r * 2} ${y} L${x + r * 0.65} ${y + r * 0.65} L${x} ${y + r * 2} L${x - r * 0.65} ${y + r * 0.65} L${x - r * 2} ${y} L${x - r * 0.65} ${y - r * 0.65} Z`}
                    />
                  ) : (
                    <circle cx={x} cy={y} r={r} />
                  )}
                </g>
              ))}

              {/* Planet orbit */}
              <ellipse
                cx="180"
                cy="145"
                rx="112"
                ry="40"
                transform="rotate(-25 180 145)"
                fill="none"
                stroke={`url(#${id}-ring)`}
                strokeWidth="3"
              />

              <ellipse
                cx="180"
                cy="145"
                rx="105"
                ry="35"
                transform="rotate(35 180 145)"
                fill="none"
                stroke={secondaryColor}
                strokeWidth="1.5"
                opacity="0.8"
              />

              {/* Planet aura */}
              <circle
                cx="180"
                cy="145"
                r="64"
                fill={glowColor}
                opacity="0.25"
              />

              {/* Main planet */}
              <circle
                cx="180"
                cy="145"
                r="55"
                fill={`url(#${id}-planet)`}
                stroke="#ffffff"
                strokeOpacity="0.8"
                strokeWidth="1.5"
              />

              {/* Planet surface */}
              <g clipPath={`url(#${id}-clip)`}>
                <path
                  d="M120 124 Q150 102 180 121 T238 115"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="13"
                  strokeOpacity="0.18"
                />

                <path
                  d="M120 158 Q151 138 178 158 T238 151"
                  fill="none"
                  stroke={secondaryColor}
                  strokeWidth="15"
                  strokeOpacity="0.6"
                />

                <path
                  d="M140 182 Q175 165 205 182 T235 173"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="7"
                  strokeOpacity="0.25"
                />

                <circle
                  cx="151"
                  cy="112"
                  r="16"
                  fill="#ffffff"
                  opacity="0.13"
                />
              </g>

              {/* Glowing heart */}
              <path
                d="M180 168 C166 157 150 145 150 132 C150 115 170 111 180 128 C190 111 210 115 210 132 C210 145 194 157 180 168 Z"
                fill="#ffffff"
                stroke={primaryColor}
                strokeWidth="3"
                style={{
                  filter: `drop-shadow(0 0 7px ${glowColor})`,
                }}
              />

              {/* Gemstone */}
              <path
                d="M278 98 L291 112 L278 126 L265 112 Z"
                fill={secondaryColor}
                stroke="#ffffff"
                strokeWidth="1.5"
              />

              <path
                d="M278 98 L278 126 M265 112 L291 112"
                stroke="#ffffff"
                strokeWidth="1"
                fill="none"
              />

              {/* Caption */}
              <text
                x="180"
                y="276"
                fill="#ffffff"
                fontSize="11"
                fontWeight="bold"
                letterSpacing="3"
                textAnchor="middle"
              >
                WRITTEN IN THE STARS
              </text>

              <text
                x="180"
                y="294"
                fill={secondaryColor}
                fontSize="9"
                letterSpacing="2"
                textAnchor="middle"
              >
                INFINITE LOVE • INFINITE UNIVERSE
              </text>
            </svg>
          </div>
        </div>

        {/* Planet and gemstone information */}
        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 10,
            padding: '16px 12px 0',
          }}
        >
          <section
            style={{
              ...styles.panel,
              borderColor: primaryColor,
              background: `linear-gradient(145deg, ${primaryColor}35, ${background})`,
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 8 }}>
              🪐
            </div>

            <p style={styles.label}>YOUR PLANET</p>

            <h3
              style={{
                color: primaryColor,
                fontSize: 'clamp(16px, 4vw, 21px)',
                overflowWrap: 'anywhere',
                margin: '10px 0 6px',
                textShadow: `0 0 12px ${glowColor}`,
              }}
            >
              {planetName}
            </h3>

            <p style={{ margin: 0, fontSize: 11, color: '#e9d5ff' }}>
              Cosmic energy
            </p>
          </section>

          <section
            style={{
              ...styles.panel,
              borderColor: secondaryColor,
              background: `linear-gradient(145deg, ${secondaryColor}35, ${background})`,
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 8 }}>
              💎
            </div>

            <p style={styles.label}>YOUR GEMSTONE</p>

            <h3
              style={{
                color: secondaryColor,
                fontSize: 'clamp(15px, 3.8vw, 20px)',
                overflowWrap: 'anywhere',
                margin: '10px 0 6px',
                textShadow: `0 0 12px ${glowColor}`,
              }}
            >
              {gemstoneName}
            </h3>

            <p style={{ margin: 0, fontSize: 11, color: '#e9d5ff' }}>
              Love crystal
            </p>
          </section>
        </div>

        {/* Daily love message */}
        <section
          style={{
            position: 'relative',
            padding: '16px 12px 20px',
          }}
        >
          <div
            style={{
              padding: '22px 16px',
              borderRadius: 20,
              border: `2px solid ${primaryColor}`,
              textAlign: 'center',
              background: `linear-gradient(135deg, ${primaryColor}30, ${background}ee, ${secondaryColor}25)`,
              boxShadow: `0 0 22px ${glowColor}30`,
            }}
          >
            <p
              style={{
                margin: 0,
                color: secondaryColor,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 1.5,
              }}
            >
              ✨ YOUR COSMIC LOVE MESSAGE ✨
            </p>

            <div
              style={{
                margin: '12px 0',
                color: primaryColor,
                fontSize: 30,
                textShadow: `0 0 15px ${glowColor}`,
              }}
            >
              ♡
            </div>

            <p
              style={{
                margin: 0,
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 600,
                lineHeight: 1.8,
                overflowWrap: 'anywhere',
              }}
            >
              {loveMessage}
            </p>

            <div
              style={{
                width: 65,
                height: 2,
                margin: '18px auto 12px',
                background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
              }}
            />

            <p
              style={{
                margin: 0,
                color: secondaryColor,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1.5,
              }}
            >
              A NEW DAY • A NEW MESSAGE
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            position: 'relative',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '15px 16px',
            borderTop: `1px solid ${secondaryColor}70`,
            background: '#08031380',
          }}
        >
          <span
            style={{
              color: primaryColor,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1.5,
            }}
          >
            LOVEONS.COM
          </span>

          <span style={{ color: '#ffffffaa', fontSize: 10 }}>
            {today}
          </span>

          <span
            style={{
              color: secondaryColor,
              fontSize: 10,
              fontWeight: 900,
            }}
          >
            ✦ COSMIC LOVE ✦
          </span>
        </footer>
      </article>
    </div>
  );
}
