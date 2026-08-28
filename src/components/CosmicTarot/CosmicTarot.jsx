
import { useMemo, useState } from "react";

import styles from "./CosmicTarot.module.css";

const TAROT_CARDS = [
  {
    name: "The Lovers' Embrace",
    symbol: "♡",
    theme: "Romantic Alignment",
    reading:
      "Your heart is entering a warmer and more receptive chapter. A meaningful connection may begin to feel easier to recognize, especially when you stop forcing an outcome and allow genuine affection to grow naturally. The energy around you favors honesty, emotional warmth, and a relationship where both people feel seen, valued, and safe.",
  },
  {
    name: "The Cosmic Mirror",
    symbol: "✦",
    theme: "Inner Reflection",
    reading:
      "The universe is reflecting something important about the way you give and receive love. This is a beautiful moment to release emotional patterns that no longer belong in your future and become clearer about what you truly deserve. When your inner world becomes peaceful, the right kind of connection becomes much easier to recognize.",
  },
  {
    name: "The Eternal Star",
    symbol: "☆",
    theme: "Hope & Clarity",
    reading:
      "A brighter emotional chapter is beginning to reveal itself. The Eternal Star reminds you that love does not always arrive with noise or drama; sometimes it appears through a quiet feeling of comfort, trust, and certainty. Follow your intuition, protect your emotional peace, and give promising connections enough time to reveal their true potential.",
  },
  {
    name: "The Forest Oracle",
    symbol: "☾",
    theme: "Patient Growth",
    reading:
      "Something meaningful may be developing more slowly than you expected, but slow does not mean insignificant. The Forest Oracle encourages patience, observation, and emotional balance. A connection built through consistency, thoughtful conversations, and small moments of trust can eventually become much stronger than a relationship built only around instant attraction.",
  },
  {
    name: "The Phoenix Heart",
    symbol: "♢",
    theme: "Emotional Renewal",
    reading:
      "You are leaving behind an older version of your love story and becoming stronger through what you have learned. The Phoenix Heart speaks of renewal, confidence, and the courage to open your heart again without repeating the same patterns. Your next meaningful connection can feel different because you are entering it with greater self-respect and emotional wisdom.",
  },
];

const LOVE_SECRETS = [
  "Your strongest relationships grow when you communicate honestly instead of expecting someone to understand feelings you have never expressed.",
  "Protecting your peace is just as important as finding someone who makes your heart race. Healthy love should add warmth to your life, not constant confusion.",
  "The right connection will give you room to be yourself rather than asking you to become someone else just to keep the relationship alive.",
  "Small acts of consistency often create stronger love than dramatic romantic gestures. Pay attention to what someone repeatedly does, not only what they promise.",
  "Your past can teach you about love without being allowed to control your future. You are allowed to write a completely different chapter.",
  "Emotional vulnerability becomes powerful when it is shared with someone who respects it, protects your trust, and never uses your feelings against you.",
  "A healthy relationship should feel like teamwork, not a constant test you have to pass. Both people should be willing to understand, support, and grow.",
  "Sometimes slowing down gives you the clarity needed to recognize genuine compatibility instead of confusing excitement with emotional connection.",
  "The best connections balance attraction with friendship, trust, respect, laughter, and the feeling that you can comfortably be yourself.",
  "You do not have to chase a connection that is meant to meet you halfway. Mutual effort is one of the clearest signs of healthy romantic energy.",
  "Being clear about your boundaries can bring the right people closer and naturally create distance from connections that are not aligned with your needs.",
  "Your love story becomes stronger when you build a fulfilling life outside the relationship too. Love should become part of your happiness, not the only source of it.",
];

const PARTNER_PROFILES = [
  {
    personality: "Caring, emotionally intelligent, and deeply understanding",
    match: "Cancer, Pisces, or Scorpio",
    spot: "a quiet café where meaningful conversations can unfold",
  },
  {
    personality: "Adventurous, spontaneous, energetic, and playful",
    match: "Aries, Sagittarius, or Leo",
    spot: "a live music event, festival, or outdoor adventure",
  },
  {
    personality: "Calm, loyal, dependable, and emotionally grounded",
    match: "Taurus, Virgo, or Capricorn",
    spot: "a cozy bookstore, café, or relaxed weekend market",
  },
  {
    personality: "Creative, expressive, curious, and socially magnetic",
    match: "Libra, Gemini, or Aquarius",
    spot: "an art event, gallery, or creative workshop",
  },
  {
    personality: "Confident, warm, playful, and naturally charming",
    match: "Leo, Aries, or Gemini",
    spot: "a lively social event or celebration with friends",
  },
  {
    personality: "Thoughtful, quietly romantic, gentle, and intuitive",
    match: "Pisces, Libra, or Cancer",
    spot: "a peaceful garden, sunset viewpoint, or beautiful outdoor place",
  },
  {
    personality: "Independent, intelligent, curious, and open-minded",
    match: "Aquarius, Gemini, or Sagittarius",
    spot: "a workshop, networking event, or interesting community gathering",
  },
  {
    personality: "Warm, protective, family-oriented, and trustworthy",
    match: "Cancer, Taurus, or Virgo",
    spot: "a community gathering or intimate dinner",
  },
  {
    personality: "Bold, ambitious, energetic, and naturally motivating",
    match: "Aries, Leo, or Capricorn",
    spot: "a fitness class or exciting new activity",
  },
  {
    personality: "Charming, social, balanced, and emotionally mature",
    match: "Libra, Gemini, or Leo",
    spot: "a celebration, festival, or social gathering",
  },
];

function createSeed(name, birthDate, readingDay) {
  const value = `${name.trim().toLowerCase()}|${birthDate}|${readingDay}`;

  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededIndex(seed, length, offset = 0) {
  const value =
    Math.imul(
      seed ^ Math.imul(offset + 1, 0x45d9f3b),
      0x45d9f3b
    ) >>> 0;

  return value % length;
}

function getTodayKey() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getBirthMonth(birthDate) {
  if (!birthDate) {
    return 0;
  }

  const parts = birthDate.split("-");

  if (parts.length !== 3) {
    return 0;
  }

  const month = Number(parts[1]);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return 0;
  }

  return month - 1;
}

function formatBirthDate(day, month, year) {
  if (!day || !month || !year) {
    return "";
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

function formatReadableDate(day, month, year) {
  if (!day || !month || !year) {
    return "";
  }

  return `${String(day).padStart(2, "0")}/${String(month).padStart(
    2,
    "0"
  )}/${year}`;
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.shareIcon}
    >
      <path
        fill="currentColor"
        d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.55 0 .24 5.31.24 11.84c0 2.09.55 4.13 1.59 5.93L.13 24l6.38-1.67a11.8 11.8 0 0 0 5.57 1.42h.01c6.52 0 11.83-5.31 11.83-11.84 0-3.16-1.23-6.13-3.4-8.43ZM12.09 21.7a9.82 9.82 0 0 1-5.01-1.37l-.36-.21-3.79.99 1.01-3.69-.23-.38a9.84 9.84 0 1 1 8.38 4.66Zm5.4-7.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.89-.79-1.5-1.76-1.68-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.08 4.5.71.31 1.27.5 1.7.64.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.shareIcon}
    >
      <path
        fill="currentColor"
        d="M13.5 22v-8h2.75l.41-3h-3.16V9.08c0-.87.24-1.46 1.49-1.46h1.59V4.94c-.28-.04-1.25-.13-2.38-.13-2.35 0-3.96 1.43-3.96 4.06V11H7.58v3h2.66v8h3.26Z"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.shareIcon}
    >
      <path
        fill="currentColor"
        d="M21.8 3.16 2.95 10.43c-1.29.52-1.28 1.23.24 1.55l4.83 1.5 1.85 5.63c.23.64.12.9.78.9.51 0 .74-.23 1.03-.51l2.5-2.43 5.2 3.84c.96.53 1.66.26 1.9-.89l3.4-16.02c.36-1.41-.54-2.05-1.4-1.64Zm-2.35 3.58-7.52 6.74-.29 4.07-1.35-4.13-4.04-1.26 13.2-5.42Z"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.shareIcon}
    >
      <path
        fill="currentColor"
        d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1Zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2Zm0 16H8V7h11v14Z"
      />
    </svg>
  );
}

function MoreShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.shareIcon}
    >
      <path
        fill="currentColor"
        d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11A2.99 2.99 0 1 0 15 5c0 .24.04.47.09.7L8.04 9.81A3 3 0 1 0 8 14.19l7.05 4.11c-.05.21-.08.43-.08.65a3.01 3.01 0 1 0 3.03-2.87ZM6 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm12-9a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm0 16a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.shareIcon}
    >
      <path
        fill="currentColor"
        d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.4L6.47 22H3.36l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.9h1.73L8.28 3.98H6.43L17.8 19.9Z"
      />
    </svg>
  );
}

export default function CosmicTarot() {
  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [isShuffling, setIsShuffling] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [hasReading, setHasReading] = useState(false);
  const [copied, setCopied] = useState(false);

  const birthDate = useMemo(
    () => formatBirthDate(day, month, year),
    [day, month, year]
  );

  const readableBirthDate = useMemo(
    () => formatReadableDate(day, month, year),
    [day, month, year]
  );

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const list = [];

    for (let value = currentYear; value >= 1940; value -= 1) {
      list.push(value);
    }

    return list;
  }, []);

  const days = useMemo(
    () => Array.from({ length: 31 }, (_, index) => index + 1),
    []
  );

  const months = useMemo(
    () => [
      { value: 1, label: "January" },
      { value: 2, label: "February" },
      { value: 3, label: "March" },
      { value: 4, label: "April" },
      { value: 5, label: "May" },
      { value: 6, label: "June" },
      { value: 7, label: "July" },
      { value: 8, label: "August" },
      { value: 9, label: "September" },
      { value: 10, label: "October" },
      { value: 11, label: "November" },
      { value: 12, label: "December" },
    ],
    []
  );

  function generateReading() {
    if (!name.trim() || !birthDate || hasReading || isShuffling) {
      return;
    }

    const todayKey = getTodayKey();
    const seed = createSeed(name, birthDate, todayKey);

    const cardIndex = seededIndex(seed, TAROT_CARDS.length, 0);
    const profileIndex = seededIndex(seed, PARTNER_PROFILES.length, 1);

    const monthIndex = getBirthMonth(birthDate);

    const secretIndex =
      (monthIndex + seededIndex(seed, LOVE_SECRETS.length, 2)) %
      LOVE_SECRETS.length;

    const card = TAROT_CARDS[cardIndex];
    const secret = LOVE_SECRETS[secretIndex];
    const profile = PARTNER_PROFILES[profileIndex];

    setIsShuffling(true);
    setResult(null);
    setCopied(false);

    window.setTimeout(() => {
      setResult({
        card,
        secret,
        profile,
        seed,
        readingDay: todayKey,
      });

      setIsShuffling(false);
      setIsFlipping(true);

      window.setTimeout(() => {
        setIsFlipping(false);
        setHasReading(true);
      }, 950);
    }, 2200);
  }

  function resetReading() {
    setResult(null);
    setIsShuffling(false);
    setIsFlipping(false);
    setHasReading(false);
    setCopied(false);

    setName("");
    setDay("");
    setMonth("");
    setYear("");
  }

  function getShareText() {
    if (!result) {
      return "";
    }

    return `${name.trim()}'s Cosmic Love Reading

Your Cosmic Love Reading for Today

Cosmic Card: ${result.card.name}

${result.card.reading}

Love Life Secret:
${result.secret}

Potential Partner Energy:
${result.profile.personality}

Zodiac energy: ${result.profile.match}

This playful reading is for entertainment and self-reflection only. It is not a prediction, professional advice, or a guarantee about future relationships.

Discover your own daily cosmic reading on Loveons.`;
  }

  function getShareUrl() {
    if (typeof window === "undefined") {
      return "";
    }

    return window.location.href;
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `${getShareText()}\n\n${getShareUrl()}`
    );

    window.open(
      `https://wa.me/?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareFacebook() {
    const url = encodeURIComponent(getShareUrl());

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareX() {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(getShareUrl());

    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareTelegram() {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(getShareUrl());

    window.open(
      `https://t.me/share/url?url=${url}&text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function copyResult() {
    const text = `${getShareText()}\n\n${getShareUrl()}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    const text = getShareText();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name.trim()}'s Cosmic Love Reading`,
          text,
          url: getShareUrl(),
        });
      } catch {
        // User cancelled the native share sheet.
      }
    } else {
      await copyResult();
    }
  }

  const canGenerate =
    name.trim() &&
    day &&
    month &&
    year &&
    !hasReading &&
    !isShuffling;

  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>
            LOVEONS COSMIC TOOL
          </span>

          <h2>Discover Your Cosmic Love Destiny</h2>

          <p>
            Enter your name and birth date to reveal a playful cosmic
            love reading created especially for your journey.
          </p>
        </div>

        {!hasReading && (
          <div className={styles.formCard}>
            <div className={styles.field}>
              <label htmlFor="cosmic-name">Your Name</label>

              <input
                id="cosmic-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                disabled={isShuffling}
              />
            </div>

            <div className={styles.field}>
              <label>Birth Date</label>

              <div className={styles.dateGrid}>
                <select
                  value={day}
                  onChange={(event) => setDay(event.target.value)}
                  disabled={isShuffling}
                  aria-label="Birth day"
                >
                  <option value="">Day</option>

                  {days.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>

                <select
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  disabled={isShuffling}
                  aria-label="Birth month"
                >
                  <option value="">Month</option>

                  {months.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <select
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  disabled={isShuffling}
                  aria-label="Birth year"
                >
                  <option value="">Year</option>

                  {years.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              {birthDate && (
                <div className={styles.datePreview}>
                  ✦ Your selected birth date:{" "}
                  <strong>{readableBirthDate}</strong>
                </div>
              )}
            </div>

            <button
              type="button"
              className={styles.generateButton}
              onClick={generateReading}
              disabled={!canGenerate}
            >
              {isShuffling
                ? "✨ Aligning Your Stars..."
                : "🌌 Generate My Love Tarot"}
            </button>
          </div>
        )}

        <div
          className={[
            styles.cardsArea,
            isShuffling ? styles.cardsShuffling : "",
            result ? styles.cardsResult : "",
          ].join(" ")}
          aria-live="polite"
        >
          {TAROT_CARDS.map((card, index) => {
            const selected =
              result?.card?.name === card.name && !isShuffling;

            const hidden = result && !selected;

            return (
              <div
                key={card.name}
                className={[
                  styles.tarotCard,
                  isShuffling ? styles.shuffling : "",
                  selected ? styles.selected : "",
                  hidden ? styles.hidden : "",
                  isFlipping && selected ? styles.flipping : "",
                ].join(" ")}
                style={{
                  "--card-delay": `${index * 75}ms`,
                }}
              >
                <div className={styles.cardInner}>
                  <div className={styles.cardBack}>
                    <div className={styles.cardStars}>
                      ✦ · ✧ · ✦
                    </div>

                    <div className={styles.cardMoon}>☾</div>

                    <div className={styles.cardBackSymbol}>
                      {card.symbol}
                    </div>

                    <small>LOVEONS</small>

                    <div className={styles.cardStars}>
                      ✧ · ✦ · ✧
                    </div>
                  </div>

                  <div className={styles.cardFace}>
                    <div className={styles.cardFaceStars}>✦</div>

                    <div className={styles.cardFaceSymbol}>
                      {card.symbol}
                    </div>

                    <span className={styles.cardFaceLabel}>
                      YOUR COSMIC CARD
                    </span>

                    <h3>{card.name}</h3>

                    <span className={styles.cardFaceTheme}>
                      {card.theme}
                    </span>

                    <div className={styles.cardFaceLine} />

                    <p>
                      Your cosmic energy has revealed this card for
                      your reading.
                    </p>

                    <div className={styles.cardFaceStars}>✧</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isShuffling && (
          <div className={styles.loadingText}>
            <span>🔮</span>
            Aligning Stars With Your Energy...
          </div>
        )}

        {result && !isShuffling && (
          <div className={styles.results}>
            <div className={styles.resultIntro}>
              <span>✨ YOUR COSMIC LOVE READING FOR TODAY</span>

              <h3>
                {name.trim()}, the stars have something special to
                share...
              </h3>

              <p>
                Your cosmic card has been revealed for today. Take a
                moment, read slowly, and see which part of the message
                speaks to your heart.
              </p>

              <div className={styles.todayBadge}>
                ✦ Today&apos;s Reading · {readableBirthDate}
              </div>
            </div>

            <article className={styles.resultBlock}>
              <span>01</span>

              <div>
                <h3>{name.trim()}, Your Love Message</h3>

                <p>{result.card.reading}</p>
              </div>
            </article>

            <article className={styles.resultBlock}>
              <span>02</span>

              <div>
                <h3>Your Love Life Secret</h3>

                <p>{result.secret}</p>
              </div>
            </article>

            <article className={styles.resultBlock}>
              <span>03</span>

              <div>
                <h3>Potential Partner Energy</h3>

                <p>
                  <strong>
                    {result.profile.personality}
                  </strong>
                </p>

                <p>
                  <strong>Zodiac energy:</strong>{" "}
                  {result.profile.match}
                </p>

                <p>
                  You may naturally cross paths around{" "}
                  <strong>{result.profile.spot}</strong>. Stay open
                  to unexpected conversations and small moments that
                  feel surprisingly natural.
                </p>
              </div>
            </article>

            <div className={styles.shareSection}>
              <div className={styles.shareHeader}>
                <h3>Share Your Cosmic Reading</h3>

                <p>
                  Share today&apos;s result with someone special or
                  save it for yourself.
                </p>
              </div>

              <div className={styles.shareButtons}>
                <button
                  type="button"
                  className={`${styles.shareButton} ${styles.whatsapp}`}
                  onClick={shareWhatsApp}
                  aria-label="Share on WhatsApp"
                >
                  <WhatsAppIcon />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  className={`${styles.shareButton} ${styles.facebook}`}
                  onClick={shareFacebook}
                  aria-label="Share on Facebook"
                >
                  <FacebookIcon />
                  <span>Facebook</span>
                </button>

                <button
                  type="button"
                  className={`${styles.shareButton} ${styles.xShare}`}
                  onClick={shareX}
                  aria-label="Share on X"
                >
                  <XIcon />
                  <span>X</span>
                </button>

                <button
                  type="button"
                  className={`${styles.shareButton} ${styles.telegram}`}
                  onClick={shareTelegram}
                  aria-label="Share on Telegram"
                >
                  <TelegramIcon />
                  <span>Telegram</span>
                </button>

                <button
                  type="button"
                  className={`${styles.shareButton} ${styles.copy}`}
                  onClick={copyResult}
                  aria-label="Copy reading"
                >
                  <CopyIcon />
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>

                <button
                  type="button"
                  className={`${styles.shareButton} ${styles.more}`}
                  onClick={nativeShare}
                  aria-label="More sharing options"
                >
                  <MoreShareIcon />
                  <span>More</span>
                </button>
              </div>

              <p className={styles.shareDisclaimer}>
                ✦ This cosmic reading is for entertainment and
                self-reflection only. It is not a prediction,
                professional advice, or a guarantee about future
                relationships.
              </p>
            </div>

            <div className={styles.tomorrowMessage}>
              ✨ Come back tomorrow for a fresh cosmic love reading.
            </div>

            <button
              type="button"
              className={styles.resetButton}
              onClick={resetReading}
            >
              ↻ Try Another Reading
            </button>
          </div>
        )}
      </div>
    </section>
  );
}



