
import { useState } from "react";

import styles from "./CosmicTarot.module.css";


const TAROT_CARDS = [
  {
    name: "The Lovers' Embrace",
    symbol: "♡",
    reading:
      "A powerful wave of romantic alignment is moving toward you. Your heart is becoming more open to a connection that feels warm, meaningful, and emotionally safe. This is a reminder that genuine love grows when attraction is supported by trust, honesty, and the freedom to be completely yourself.",
  },
  {
    name: "The Cosmic Mirror",
    symbol: "✦",
    reading:
      "The universe is reflecting something important about your emotional world. The qualities you are learning to appreciate within yourself are also shaping the kind of love you are ready to welcome. Release outdated expectations and allow a healthier, more balanced love story to reveal itself naturally.",
  },
  {
    name: "The Eternal Star",
    symbol: "☆",
    reading:
      "A quiet light of hope surrounds your romantic path. Something that once felt confusing may gradually become easier to understand as you listen to your intuition. Your next meaningful connection may begin with a simple conversation, a feeling of comfort, or a moment when you unexpectedly realize that someone understands you.",
  },
  {
    name: "The Forest Oracle",
    symbol: "☾",
    reading:
      "Your love energy is asking you to slow down and trust the natural rhythm of your journey. Not every meaningful connection arrives dramatically. Some relationships grow quietly through consistency, small moments, and emotional security. Give something genuine enough time to show you what it can become.",
  },
  {
    name: "The Phoenix Heart",
    symbol: "♢",
    reading:
      "A beautiful emotional transformation is taking place within you. Experiences from the past have strengthened your understanding of what you truly deserve in love. As an old chapter loses its power, your heart becomes ready for a connection built around passion, loyalty, respect, and a deeper sense of emotional confidence.",
  },
];


const LOVE_SECRETS = [
  "Your strongest relationships grow when you communicate honestly instead of expecting someone to read your mind. The more comfortable you become expressing what you truly feel, the easier it becomes for the right person to understand and appreciate you.",

  "Protecting your peace is just as important as finding someone who makes your heart race. A beautiful connection should add warmth to your life rather than constantly leaving you questioning where you stand.",

  "The right connection will give you room to be yourself rather than asking you to become someone else. Your individuality is not something you need to hide to create a lasting romantic bond.",

  "Small acts of consistency often create stronger love than dramatic romantic gestures. Someone who remembers the little things, keeps their word, and shows up emotionally can create a much deeper connection over time.",

  "Your past can teach you about love without being allowed to control your future. The lessons you have collected can help you recognize healthier patterns and choose relationships that feel more peaceful and balanced.",

  "Emotional vulnerability becomes powerful when it is shared with someone who respects it. You do not need to reveal everything immediately; meaningful intimacy grows when trust is built one honest moment at a time.",

  "A healthy relationship should feel like teamwork, not a constant test you have to pass. Love becomes stronger when both people contribute, listen, support each other, and make space for one another's needs.",

  "Sometimes slowing down gives you the clarity needed to recognize genuine compatibility. Attraction can be exciting, but patience allows you to discover whether someone truly matches your values and emotional rhythm.",

  "The best connections balance attraction with friendship, trust, respect, and laughter. When you genuinely enjoy someone's company beyond romance, the relationship has more room to grow into something lasting.",

  "You do not have to chase a connection that is meant to meet you halfway. The healthiest romantic energy feels mutual, where interest, effort, curiosity, and affection naturally move in both directions.",

  "Being clear about your boundaries can bring the right people closer and the wrong people farther away. Your boundaries are not walls around your heart; they are a way of protecting the kind of love you want to build.",

  "Your love story becomes stronger when you build a fulfilling life outside the relationship too. The more connected you are to your own interests, friendships, goals, and happiness, the more confidently you can share your life with someone else.",
];


const PARTNER_PROFILES = [
  {
    personality: "Caring and emotionally intelligent",
    match: "Cancer, Pisces, or Scorpio",
    spot: "a quiet café where meaningful conversations can unfold",
  },
  {
    personality: "Adventurous and spontaneous",
    match: "Aries, Sagittarius, or Leo",
    spot: "a live music festival or outdoor adventure",
  },
  {
    personality: "Calm, loyal, and dependable",
    match: "Taurus, Virgo, or Capricorn",
    spot: "a cozy bookstore or relaxed weekend market",
  },
  {
    personality: "Creative and deeply expressive",
    match: "Libra, Gemini, or Aquarius",
    spot: "an art event, gallery, or creative workshop",
  },
  {
    personality: "Confident with a playful personality",
    match: "Leo, Aries, or Gemini",
    spot: "a lively social event with friends",
  },
  {
    personality: "Thoughtful and quietly romantic",
    match: "Pisces, Libra, or Cancer",
    spot: "a peaceful garden or sunset viewpoint",
  },
  {
    personality: "Independent and intellectually curious",
    match: "Aquarius, Gemini, or Sagittarius",
    spot: "a professional networking event or workshop",
  },
  {
    personality: "Warm, protective, and family-oriented",
    match: "Cancer, Taurus, or Virgo",
    spot: "a community gathering or intimate dinner",
  },
  {
    personality: "Bold, ambitious, and energetic",
    match: "Aries, Leo, or Capricorn",
    spot: "a fitness class or exciting new activity",
  },
  {
    personality: "Charming, social, and emotionally balanced",
    match: "Libra, Gemini, or Leo",
    spot: "a celebration, festival, or social gathering",
  },
];


function createSeed(name, birthDate) {
  const value = `${name.trim().toLowerCase()}|${birthDate}`;

  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}


function getBirthMonth(birthDate) {
  if (!birthDate) {
    return 0;
  }

  const date = new Date(`${birthDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return date.getMonth();
}


function getDeterministicIndex(seed, length, offset = 0) {
  return (seed + offset * 997) % length;
}


export default function CosmicTarot() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [isShuffling, setIsShuffling] = useState(false);
  const [result, setResult] = useState(null);


  function generateReading() {
    if (
      isShuffling ||
      result ||
      !name.trim() ||
      !birthDate
    ) {
      return;
    }

    setIsShuffling(true);

    const cleanName = name.trim();
    const seed = createSeed(cleanName, birthDate);
    const monthIndex = getBirthMonth(birthDate);

    const cardIndex = getDeterministicIndex(
      seed,
      TAROT_CARDS.length
    );

    const profileIndex = getDeterministicIndex(
      seed,
      PARTNER_PROFILES.length,
      1
    );

    const secretIndex =
      (monthIndex + seed) % LOVE_SECRETS.length;


    window.setTimeout(() => {
      setResult({
        card: TAROT_CARDS[cardIndex],
        secret: LOVE_SECRETS[secretIndex],
        profile: PARTNER_PROFILES[profileIndex],
      });

      setIsShuffling(false);
    }, 2200);
  }


  function resetReading() {
    setResult(null);
    setIsShuffling(false);
    setName("");
    setBirthDate("");
  }


  function getShareText() {
    if (!result) {
      return "";
    }

    return [
      "🔮 My Loveons Cosmic Tarot Reading",
      "",
      `✨ ${result.card.name}`,
      "",
      result.card.reading,
      "",
      "💗 Love Life Secret",
      "",
      result.secret,
      "",
      "🌙 Potential Partner Energy",
      "",
      result.profile.personality,
      `Zodiac energy: ${result.profile.match}`,
      "",
      `You may naturally cross paths around ${result.profile.spot}.`,
      "",
      "Disclaimer: This cosmic reading is for entertainment and self-reflection only.",
      "",
      "Discover your own cosmic reading:",
      "https://loveons.com/cosmic-tarot",
    ].join("\n");
  }


  async function shareReading() {
    if (!result) {
      return;
    }

    const shareText = getShareText();

    if (
      navigator.share &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({
          title: "My Loveons Cosmic Tarot Reading",
          text: shareText,
        });
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error(
            "Cosmic Tarot share failed:",
            error
          );
        }
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(shareText);

      window.alert(
        "Your cosmic reading has been copied. You can now paste it into any app."
      );
    } catch {
      window.alert(
        "Sharing is not available on this device."
      );
    }
  }


  function shareWhatsApp() {
    if (!result) {
      return;
    }

    const text = encodeURIComponent(getShareText());

    window.open(
      `https://wa.me/?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  }


  function shareFacebook() {
    if (!result) {
      return;
    }

    const url = encodeURIComponent(
      "https://loveons.com/cosmic-tarot"
    );

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }


  function shareX() {
    if (!result) {
      return;
    }

    const text = encodeURIComponent(
      `🔮 ${result.card.name} — Discover your cosmic love reading on Loveons.`
    );

    const url = encodeURIComponent(
      "https://loveons.com/cosmic-tarot"
    );

    window.open(
      `https://x.com/intent/post?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }


  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>

        <div className={styles.header}>
          <span className={styles.eyebrow}>
            LOVEONS COSMIC TOOL
          </span>

          <h2>
            Discover Your Cosmic Love Destiny
          </h2>

          <p>
            Enter your details and discover a playful
            cosmic love reading created just for you.
          </p>
        </div>


        {!result && (
          <div className={styles.formCard}>

            <div className={styles.field}>
              <label htmlFor="cosmic-name">
                Your Name
              </label>

              <input
                id="cosmic-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter your name"
                autoComplete="name"
                disabled={isShuffling}
              />
            </div>


            <div className={styles.field}>
              <label htmlFor="cosmic-birth-date">
                Your Birth Date
              </label>

              <div className={styles.dateInputWrap}>
                <input
                  id="cosmic-birth-date"
                  type="date"
                  value={birthDate}
                  onChange={(event) =>
                    setBirthDate(event.target.value)
                  }
                  disabled={isShuffling}
                />
              </div>

              <small className={styles.fieldHint}>
                Select your date from the calendar or enter it manually.
              </small>
            </div>


            <button
              type="button"
              className={styles.generateButton}
              onClick={generateReading}
              disabled={
                isShuffling ||
                !name.trim() ||
                !birthDate
              }
            >
              {isShuffling
                ? "✨ Aligning Your Stars..."
                : "🌌 Generate My Love Tarot"}
            </button>

          </div>
        )}


        <div
          className={styles.cardsArea}
          aria-live="polite"
        >
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
                  isShuffling
                    ? styles.shuffling
                    : "",
                  selected
                    ? styles.selected
                    : "",
                  hidden
                    ? styles.hidden
                    : "",
                ].join(" ")}
                style={{
                  "--card-delay": `${index * 80}ms`,
                }}
              >
                <div className={styles.cardInner}>

                  <div className={styles.cardBack}>
                    <div className={styles.cardStars}>
                      ✦
                    </div>

                    <div className={styles.cardMoon}>
                      {card.symbol}
                    </div>

                    <div className={styles.cardZodiac}>
                      ✧ · ✦ · ✧
                    </div>

                    <small>
                      LOVEONS
                    </small>
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

            <div className={styles.selectedCard}>

              <div className={styles.cardReveal}>

                <div className={styles.cardRevealStars}>
                  ✦ · ✧ · ✦
                </div>

                <span className={styles.cardLabel}>
                  YOUR COSMIC CARD
                </span>

                <div className={styles.revealSymbol}>
                  {result.card.symbol}
                </div>

                <h3>
                  {result.card.name}
                </h3>

                <p>
                  {result.card.reading}
                </p>

              </div>

            </div>


            <article className={styles.resultBlock}>
              <span>01</span>

              <div>
                <h3>
                  {name.trim()}, Your Love Message
                </h3>

                <p>
                  {result.card.reading}
                </p>

                <p>
                  Your cosmic card suggests that your
                  romantic journey is entering a chapter
                  where emotional awareness can become
                  one of your greatest strengths. Pay
                  attention to the small moments that make
                  you feel understood, respected, and
                  naturally comfortable.
                </p>
              </div>
            </article>


            <article className={styles.resultBlock}>
              <span>02</span>

              <div>
                <h3>
                  Your Love Life Secret
                </h3>

                <p>
                  {result.secret}
                </p>

                <p>
                  The energy around this message is a
                  gentle reminder that the most memorable
                  relationships are often created through
                  everyday choices. Let trust grow at its
                  own pace, stay connected to your own
                  happiness, and allow genuine affection
                  to reveal itself without forcing the
                  story.
                </p>
              </div>
            </article>


            <article className={styles.resultBlock}>
              <span>03</span>

              <div>
                <h3>
                  Potential Partner Energy
                </h3>

                <p>
                  <strong>
                    {result.profile.personality}
                  </strong>
                </p>

                <p>
                  Zodiac energy:{" "}
                  {result.profile.match}
                </p>

                <p>
                  You may naturally cross paths around{" "}
                  {result.profile.spot}.
                </p>

                <p>
                  What matters most is the feeling behind
                  the encounter: look for someone whose
                  presence makes conversation feel
                  effortless and whose actions create a
                  sense of mutual curiosity, comfort, and
                  respect.
                </p>
              </div>
            </article>


            <div className={styles.shareSection}>

              <h3>
                Share Your Cosmic Reading
              </h3>

              <p>
                Let someone special discover your cosmic
                message too.
              </p>


              <div className={styles.shareButtons}>

                <button
                  type="button"
                  className={`${styles.socialButton} ${styles.whatsappButton}`}
                  onClick={shareWhatsApp}
                  aria-label="Share on WhatsApp"
                >
                  <span>☘</span>
                  WhatsApp
                </button>


                <button
                  type="button"
                  className={`${styles.socialButton} ${styles.facebookButton}`}
                  onClick={shareFacebook}
                  aria-label="Share on Facebook"
                >
                  <span>f</span>
                  Facebook
                </button>


                <button
                  type="button"
                  className={`${styles.socialButton} ${styles.xButton}`}
                  onClick={shareX}
                  aria-label="Share on X"
                >
                  <span>𝕏</span>
                  X
                </button>


                <button
                  type="button"
                  className={`${styles.socialButton} ${styles.nativeShareButton}`}
                  onClick={shareReading}
                  aria-label="Share using available apps"
                >
                  <span>↗</span>
                  More Apps
                </button>

              </div>

            </div>


            <div className={styles.resultActions}>

              <button
                type="button"
                className={styles.resetButton}
                onClick={resetReading}
              >
                ↻ Try Another Reading
              </button>

            </div>


            <p className={styles.disclaimer}>
              Disclaimer: This cosmic reading is for
              entertainment and self-reflection only.
            </p>

          </div>
        )}

      </div>
    </section>
  );
}

