import { ImageResponse } from "@vercel/og";
import { createElement } from "react";

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

const el = (
  type: string,
  style: Record<string, string | number>,
  children?: unknown
) =>
  createElement(
    type,
    { style },
    ...(Array.isArray(children) ? children : children !== undefined ? [children] : [])
  );

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

  const monthIndex = getBirthMonth(birthDate);

  const secretIndex =
    (monthIndex + seededIndex(seed, LOVE_SECRETS.length, 2)) %
    LOVE_SECRETS.length;

  const card = TAROT_CARDS[cardIndex];
  const secret = LOVE_SECRETS[secretIndex];

  const dateText = getDateText(date);

  const header = el(
    "div",
    {
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "34px",
    },
    [
      el(
        "div",
        {
          display: "flex",
          fontSize: "26px",
          fontWeight: 700,
          letterSpacing: "2px",
        },
        "LOVEONS"
      ),

      el(
        "div",
        {
          display: "flex",
          fontSize: "22px",
          opacity: 0.8,
        },
        "COSMIC LOVE TAROT"
      ),
    ]
  );

  const tarotCard = el(
    "div",
    {
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
    },
    [
      el(
        "div",
        {
          display: "flex",
          fontSize: "92px",
          marginBottom: "12px",
        },
        card.symbol
      ),

      el(
        "div",
        {
          display: "flex",
          textAlign: "center",
          fontSize: "30px",
          fontWeight: 700,
          lineHeight: 1.15,
        },
        card.name
      ),

      el(
        "div",
        {
          display: "flex",
          marginTop: "18px",
          fontSize: "20px",
          opacity: 0.75,
        },
        card.theme
      ),
    ]
  );

  const reading = el(
    "div",
    {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
    [
      el(
        "div",
        {
          display: "flex",
          fontSize: "24px",
          opacity: 0.75,
          marginBottom: "10px",
        },
        dateText
      ),

      el(
        "div",
        {
          display: "flex",
          fontSize: "42px",
          fontWeight: 700,
          marginBottom: "22px",
        },
        `${name}'s Cosmic Tarot`
      ),

      el(
        "div",
        {
          display: "flex",
          fontSize: "25px",
          lineHeight: 1.35,
          marginBottom: "22px",
          maxWidth: "680px",
        },
        card.reading
      ),

      el(
        "div",
        {
          display: "flex",
          fontSize: "22px",
          lineHeight: 1.35,
          opacity: 0.82,
          maxWidth: "680px",
        },
        `✦ ${secret}`
      ),
    ]
  );

  const body = el(
    "div",
    {
      width: "100%",
      display: "flex",
      flex: 1,
      gap: "42px",
    },
    [tarotCard, reading]
  );

  const footer = el(
    "div",
    {
      display: "flex",
      marginTop: "22px",
      fontSize: "19px",
      opacity: 0.65,
    },
    "A personalized cosmic reading from Loveons"
  );

  const image = el(
    "div",
    {
      width: "1200px",
      height: "630px",
      display: "flex",
      flexDirection: "column",
      background:
        "linear-gradient(135deg, #120b24 0%, #24113d 50%, #4b1d55 100%)",
      color: "white",
      padding: "54px",
      fontFamily: "sans-serif",
    },
    [header, body, footer]
  );

  return new ImageResponse(image, {
    width: 1200,
    height: 630,
  });
    }
