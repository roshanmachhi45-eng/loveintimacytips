import { ImageResponse } from "@vercel/og";
import { createElement } from "react";

const TAROT_CARDS = [
  {
    name: "The Lovers' Embrace",
    symbol: "LOVE",
    theme: "Romantic Alignment",
    reading:
      "Your heart is opening to a deeper kind of connection. Trust what feels genuine and allow love to grow naturally.",
  },
  {
    name: "The Cosmic Mirror",
    symbol: "MIRROR",
    theme: "Inner Reflection",
    reading:
      "Love begins with knowing yourself. The energy around you encourages honesty, self-reflection, and emotional clarity.",
  },
  {
    name: "The Eternal Star",
    symbol: "STAR",
    theme: "Hope & Clarity",
    reading:
      "A hopeful energy surrounds your love life. Keep your heart open and let clarity guide your next emotional step.",
  },
  {
    name: "The Forest Oracle",
    symbol: "MOON",
    theme: "Patient Growth",
    reading:
      "Some connections need time to unfold. Patience, consistency, and emotional understanding can create something lasting.",
  },
  {
    name: "The Phoenix Heart",
    symbol: "HEART",
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
    ...(Array.isArray(children)
      ? children
      : children !== undefined
        ? [children]
        : [])
  );

export default {
  async fetch(request: Request) {
    const url = new URL(request.url, "https://loveons.com");

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
        marginBottom: "28px",
      },
      [
        el("img", {
  src: "https://www.loveons.com/images/logo.png",
  width: "48",
  height: "48",
}),
        el(
          "div",
          {
            display: "flex",
            alignItems: "center",
            gap: "12px",
          },
          [        
            el(
              "div",
              {
                display: "flex",
                fontSize: "27px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                color: "#5b315f",
              },
              "LOVEONS"
            ),
          ]
        ),

        el(
          "div",
          {
            display: "flex",
            fontSize: "19px",
            fontWeight: 600,
            letterSpacing: "1.5px",
            color: "#8b5f8e",
          },
          "COSMIC LOVE TAROT"
        ),
      ]
    );

    const tarotCard = el(
      "div",
      {
        width: "320px",
        height: "385px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "30px",
        background:
          "linear-gradient(145deg, #fff9fc 0%, #f8e9f5 48%, #eadcf7 100%)",
        color: "#4d2852",
        padding: "28px",
        border: "2px solid rgba(255,255,255,0.9)",
        boxShadow: "0 18px 45px rgba(92, 50, 105, 0.18)",
      },
      [
        el(
          "div",
          {
            display: "flex",
            width: "185px",
            height: "185px",
            borderRadius: "50%",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(145deg, #f6c9df 0%, #e7c9f5 100%)",
            border: "8px solid rgba(255,255,255,0.75)",
            boxShadow: "0 10px 30px rgba(128, 76, 142, 0.15)",
            fontSize: "29px",
            fontWeight: 700,
            letterSpacing: "2px",
            color: "#693d6f",
          },
          card.symbol
        ),

        el(
          "div",
          {
            display: "flex",
            textAlign: "center",
            fontSize: "27px",
            fontWeight: 700,
            lineHeight: 1.15,
            marginTop: "22px",
          },
          card.name
        ),

        el(
          "div",
          {
            display: "flex",
            marginTop: "12px",
            fontSize: "17px",
            fontWeight: 600,
            color: "#946b96",
            letterSpacing: "0.5px",
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
        paddingLeft: "4px",
      },
      [
        el(
          "div",
          {
            display: "flex",
            fontSize: "19px",
            fontWeight: 600,
            color: "#9a6c91",
            marginBottom: "8px",
          },
          dateText
        ),

        el(
          "div",
          {
            display: "flex",
            fontSize: "38px",
            fontWeight: 700,
            color: "#48264d",
            marginBottom: "17px",
            lineHeight: 1.1,
          },
          `${name}'s Cosmic Tarot`
        ),

        el(
          "div",
          {
            display: "flex",
            fontSize: "23px",
            lineHeight: 1.32,
            fontWeight: 500,
            color: "#56385b",
            marginBottom: "18px",
            maxWidth: "690px",
          },
          card.reading
        ),

        el(
          "div",
          {
            display: "flex",
            fontSize: "19px",
            lineHeight: 1.32,
            color: "#765878",
            maxWidth: "690px",
            paddingTop: "14px",
            borderTop: "1px solid rgba(119, 77, 123, 0.18)",
          },
          secret
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
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "14px",
      },
      [
        el(
          "div",
          {
            display: "flex",
            fontSize: "16px",
            fontWeight: 600,
            color: "#815d7e",
            marginBottom: "5px",
          },
          "A personalized cosmic reading from Loveons"
        ),

        el(
          "div",
          {
            display: "flex",
            fontSize: "11px",
            color: "#9a7c96",
            textAlign: "center",
          },
          "This tool is for entertainment purposes only and is not intended as professional advice."
        ),
      ]
    );

    const image = el(
      "div",
      {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(135deg, #fff8fb 0%, #fcecf5 48%, #eee4f8 100%)",
        color: "#4d2852",
        padding: "38px 52px 24px 52px",
        fontFamily: "sans-serif",
        position: "relative",
      },
      [
        el(
          "div",
          {
            position: "absolute",
            top: "-170px",
            right: "-120px",
            width: "430px",
            height: "430px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(218,174,224,0.38) 0%, rgba(218,174,224,0) 70%)",
          }
        ),

        el(
          "div",
          {
            position: "absolute",
            bottom: "-210px",
            left: "-130px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(244,190,211,0.32) 0%, rgba(244,190,211,0) 70%)",
          }
        ),

        header,
        body,
        footer,
      ]
    );

    return new ImageResponse(image, {
      width: 1200,
      height: 630,
    });
  },
};
