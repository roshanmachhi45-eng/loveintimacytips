
import { useState } from "react";
import styles from "./CosmicTarot.module.css";

const TAROT_CARDS = [
  {
    name: "The Lovers' Embrace",
    symbol: "♡",
    reading:
      "A powerful wave of romantic alignment is approaching you. Your heart energy is ready to attract a deep, soulful connection that feels meaningful.",
  },
  {
    name: "The Cosmic Mirror",
    symbol: "✦",
    reading:
      "The universe is reflecting your inner desires right now. Let go of old emotional baggage and make space for a clearer, healthier love story.",
  },
  {
    name: "The Eternal Star",
    symbol: "☆",
    reading:
      "This card represents clarity, hope, and emotional alignment. Trust your intuition as it guides you toward deeper emotional fulfillment.",
  },
  {
    name: "The Forest Oracle",
    symbol: "☾",
    reading:
      "Patience is your superpower today. Your love life is growing quietly but strongly. Trust the timing of your journey and allow something stable to develop.",
  },
  {
    name: "The Phoenix Heart",
    symbol: "♢",
    reading:
      "A beautiful transformation is happening in your love life. Your emotional strength is rising, preparing you for a passionate and loyal connection.",
  },
];

const LOVE_SECRETS = [
  "Your strongest relationships grow when you communicate honestly instead of expecting someone to read your mind.",
  "Protecting your peace is just as important as finding someone who makes your heart race.",
  "The right connection will give you room to be yourself rather than asking you to become someone else.",
  "Small acts of consistency often create stronger love than dramatic romantic gestures.",
  "Your past can teach you about love without being allowed to control your future.",
  "Emotional vulnerability becomes powerful when it is shared with someone who respects it.",
  "A healthy relationship should feel like teamwork, not a constant test you have to pass.",
  "Sometimes slowing down gives you the clarity needed to recognize genuine compatibility.",
  "The best connections balance attraction with friendship, trust, respect, and laughter.",
  "You do not have to chase a connection that is meant to meet you halfway.",
  "Being clear about your boundaries can bring the right people closer and the wrong people farther away.",
  "Your love story becomes stronger when you build a fulfilling life outside the relationship too.",
];

const PARTNER_PROFILES = [
  {
    personality: "Caring and emotionally intelligent",
    match: "Cancer, Pisces, or Scorpio",
    spot: "A quiet café where meaningful conversations can unfold",
  },
  {
    personality: "Adventurous and spontaneous",
    match: "Aries, Sagittarius, or Leo",
    spot: "A live music festival or outdoor adventure",
  },
  {
    personality: "Calm, loyal, and dependable",
    match: "Taurus, Virgo, or Capricorn",
    spot: "A cozy bookstore or relaxed weekend market",
  },
  {
    personality: "Creative and deeply expressive",
    match: "Libra, Gemini, or Aquarius",
    spot: "An art event, gallery, or creative workshop",
  },
  {
    personality: "Confident with a playful personality",
    match: "Leo, Aries, or Gemini",
    spot: "A lively social event with friends",
  },
  {
    personality: "Thoughtful and quietly romantic",
    match: "Pisces, Libra, or Cancer",
    spot: "A peaceful garden or sunset viewpoint",
  },
  {
    personality: "Independent and intellectually curious",
    match: "Aquarius, Gemini, or Sagittarius",
    spot: "A professional networking event or workshop",
  },
  {
    personality: "Warm, protective, and family-oriented",
    match: "Cancer, Taurus, or Virgo",
    spot: "A community gathering or intimate dinner",
  },
  {
    personality: "Bold, ambitious, and energetic",
    match: "Aries, Leo, or Capricorn",
    spot: "A fitness class or exciting new activity",
  },
  {
    personality: "Charming, social, and emotionally balanced",
    match: "Libra, Gemini, or Leo",
    spot: "A celebration, festival, or social gathering",
  },
];

function getBirthMonth(birthDate) {
  if (!birthDate) return 0;

  const date = new Date(`${birthDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return date.getMonth();
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export default function CosmicTarot() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [isShuffling, setIsShuffling] = useState(false);
  const [result, setResult] = useState(null);

  function generateReading() {
    if (!name.trim() || !birthDate) {
      return;
    }

    setIsShuffling(true);
    setResult(null);

    window.setTimeout(() => {
      const card = randomItem(TAROT_CARDS);
      const monthIndex = getBirthMonth(birthDate);

      const secret = LOVE_SECRETS[monthIndex];
      const profile = randomItem(PARTNER_PROFILES);

      setResult({
        card,
        secret,
        profile,
      });

      setIsShuffling(false);
    }, 2200);
  }

  function resetReading() {
    setResult(null);
    setIsShuffling(false);
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>LOVEONS COSMIC TOOL</span>

          <h2>Discover Your Cosmic Love Destiny</h2>

          <p>
            Enter your details and discover a playful love reading created
            just for you.
          </p>
        </div>

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
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="cosmic-birth-date">Your Birth Date</label>

            <input
              id="cosmic-birth-date"
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
          </div>

          <button
            type="button"
            className={styles.generateButton}
            onClick={generateReading}
            disabled={isShuffling || !name.trim() || !birthDate}
          >
            {isShuffling ? "✨ Aligning Your Stars..." : "🌌 Generate My Love Tarot"}
          </button>
        </div>

        <div className={styles.cardsArea} aria-live="polite">
          {TAROT_CARDS.map((card, index) => {
            const selected =
              result?.card?.name === card.name;

            const hidden =
              result && !selected;

            return (
              <div
                key={card.name}
                className={[
                  styles.tarotCard,
                  isShuffling ? styles.shuffling : "",
                  selected ? styles.selected : "",
                  hidden ? styles.hidden : "",
                ].join(" ")}
                style={{
                  "--card-delay": `${index * 70}ms`,
                }}
              >
                <div className={styles.cardBack}>
                  <span>{card.symbol}</span>
                  <small>LOVEONS</small>
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
            <div className={styles.selectedCard}>
              <div className={styles.cardFront}>
                <div className={styles.cardSymbol}>
                  {result.card.symbol}
                </div>

                <span className={styles.cardLabel}>
                  YOUR COSMIC CARD
                </span>

                <h3>{result.card.name}</h3>

                <p>{result.card.reading}</p>
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
                  <strong>{result.profile.personality}</strong>
                </p>

                <p>
                  Zodiac energy: {result.profile.match}
                </p>

                <p>
                  You may naturally cross paths around{" "}
                  {result.profile.spot.toLowerCase()}.
                </p>
              </div>
            </article>

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
