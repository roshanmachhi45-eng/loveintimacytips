import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

const TAROT_CARDS = [
  {
    name: "The Lovers' Embrace",
    symbol: "♡",
    theme: "Romantic Alignment",
    reading:
      "Your heart is opening to a deeper kind of connection. Trust what feels genuine and allow love to grow naturally.",
  },
  {
    name: "The Cosmic Mirror",
    symbol: "✦",
    theme: "Inner Reflection",
    reading:
      "Love begins with knowing yourself. The energy around you encourages honesty, self-reflection, and emotional clarity.",
  },
  {
    name: "The Eternal Star",
    symbol: "☆",
    theme: "Hope & Clarity",
    reading:
      "A hopeful energy surrounds your love life. Keep your heart open and let clarity guide your next emotional step.",
  },
  {
    name: "The Forest Oracle",
    symbol: "☾",
    theme: "Patient Growth",
    reading:
      "Some connections need time to unfold. Patience, consistency, and emotional understanding can create something lasting.",
  },
  {
    name: "The Phoenix Heart",
    symbol: "♢",
    theme: "Emotional Renewal",
    reading:
      "A new emotional chapter is beginning. Release old patterns and give yourself permission to experience love differently.",
  },
];

const LOVE_SECRETS = [
  "Your heart already knows more than your mind is willing to admit.",
  "Someone may notice your energy before you notice theirs.",
  "The right connection will feel peaceful, not confusing.",
  "A meaningful conversation could change your emotional perspective.",
  "Your next chapter in love begins with greater self-trust.",
  "Someone may be drawn to the warmth you naturally give others.",
  "Love becomes clearer when you stop forcing the timing.",
  "Your emotional honesty can create a deeper connection.",
  "A surprising connection may appear through an ordinary moment.",
  "Your intuition is pointing you toward what truly matters.",
  "The strongest attraction may begin with genuine friendship.",
  "A fresh emotional energy is approaching your life.",
];

const PARTNER_PROFILES = [
  {
    personality: "Warm, emotionally intuitive, and quietly confident.",
    match: "Someone who values honesty and emotional depth.",
    spot: "Look for them in relaxed social spaces and creative communities.",
  },
  {
    personality: "Curious, thoughtful, and naturally adventurous.",
    match: "Someone who enjoys discovering new experiences together.",
    spot: "You may connect through travel, hobbies, or spontaneous plans.",
  },
  {
    personality: "Calm, loyal, and emotionally grounded.",
    match: "Someone who brings stability without limiting your freedom.",
    spot: "Pay attention to familiar places where meaningful conversations happen.",
  },
  {
    personality: "Playful, expressive, and socially magnetic.",
    match: "Someone who can match your energy while respecting your individuality.",
    spot: "Social events, classes, and gatherings may hold interesting possibilities.",
  },
  {
    personality: "Independent, creative, and deeply observant.",
    match: "Someone who appreciates authenticity more than appearances.",
    spot: "Creative spaces, bookstores, cafés, and cultural events may be significant.",
  },
  {
    personality: "Gentle, patient, and emotionally mature.",
    match: "Someone who understands that meaningful love takes time.",
    spot: "Look around communities where people return regularly and build connections.",
  },
  {
    personality: "Ambitious, focused, and surprisingly romantic.",
    match: "Someone who supports your goals while making space for affection.",
    spot: "Professional networks or learning environments may bring you together.",
  },
  {
    personality: "Spontaneous, optimistic, and full of curiosity.",
    match: "Someone who makes everyday life feel like an adventure.",
    spot: "New experiences and unfamiliar places could create the connection.",
  },
  {
    personality: "Sensitive, sincere, and naturally compassionate.",
    match: "Someone who values emotional safety and mutual understanding.",
    spot: "Community activities and spaces centered around helping others may matter.",
  },
  {
    personality: "Confident, thoughtful, and emotionally selective.",
    match: "Someone who respects boundaries and values genuine intimacy.",
    spot: "A quality connection may develop slowly through repeated interactions.",
  },
];

function createSeed(name: string, birthDate: string, todayKey: string) {
  const input = `${name.trim().toLowerCase()}|${birthDate}|${todayKey}`;

  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }

  return hash >>> 0;
}

function seededIndex(seed: number, length: number, offset = 0) {
  const value = (seed + offset * 2654435761) >>> 0;
  return value % length;
}

function getBirthMonth(birthDate: string) {
  const parts = birthDate.split("-");
  return Math.max(0, Number(parts[1] || 1) - 1);
}

function getDateText(dateKey: string) {
  const parts = dateKey.split("-");

  if (parts.length !== 3) {
    return "Today's Cosmic Tarot";
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (!year || !month || !day) {
    return "Today's Cosmic Tarot";
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function handler(request: Request) {
  const url = new URL(request.url);

  const name = url.searchParams.get("name")?.trim() || "Your";
  const birthDate = url.searchParams.get("birth") || "";
  const date =
    url.searchParams.get("date") ||
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());

  const seed = createSeed(name, birthDate, date);

  const cardIndex = seededIndex(seed, TAROT_CARDS.length, 0);
  const profileIndex = seededIndex(seed, PARTNER_PROFILES.length, 1);

  const monthIndex = getBirthMonth(birthDate);

  const secretIndex =
    (monthIndex + seededIndex(seed, LOVE_SECRETS.length, 2)) %
    LOVE_SECRETS.length;

  const card = TAROT_CARDS[cardIndex];
  const secret = LOVE_SECRETS[secretIndex];
  const profile = PARTNER_PROFILES[profileIndex];

  const dateText = getDateText(date);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #120b24 0%, #24113d 50%, #4b1d55 100%)",
          color: "white",
          padding: "54px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "34px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "26px",
              fontWeight: 700,
              letterSpacing: "2px",
            }}
          >
            LOVEONS
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "22px",
              opacity: 0.8,
            }}
          >
            COSMIC LOVE TAROT
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            gap: "42px",
          }}
        >
          <div
            style={{
              width: "330px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "28px",
              background:
                "linear-gradient(145deg, #f7d9ff 0%, #d7b6ff 100%)",
              color: "#28133e",
              padding: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "92px",
                marginBottom: "12px",
              }}
            >
              {card.symbol}
            </div>

            <div
              style={{
                display: "flex",
                textAlign: "center",
                fontSize: "30px",
                fontWeight: 700,
                lineHeight: 1.15,
              }}
            >
              {card.name}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: "18px",
                fontSize: "20px",
                opacity: 0.75,
              }}
            >
              {card.theme}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "24px",
                opacity: 0.75,
                marginBottom: "10px",
              }}
            >
              {dateText}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: "42px",
                fontWeight: 700,
                marginBottom: "22px",
              }}
            >
              {name}'s Cosmic Tarot
            </div>

            <div
              style={{
                display: "flex",
                fontSize: "25px",
                lineHeight: 1.35,
                marginBottom: "22px",
                maxWidth: "680px",
              }}
            >
              {card.reading}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: "22px",
                lineHeight: 1.35,
                opacity: 0.82,
                maxWidth: "680px",
              }}
            >
              ✦ {secret}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "22px",
            fontSize: "19px",
            opacity: 0.65,
          }}
        >
          A personalized cosmic reading from Loveons
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
  }
