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

async function getLogoDataUri() {
  try {
    const response = await fetch(
      "https://www.loveons.com/images/loveons-logo-card.png"
    );

    if (!response.ok) {
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

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
    const logoDataUri = await getLogoDataUri();

    /*
     * ------------------------------------------------------------
     * BRAND HEADER
     * ------------------------------------------------------------
     */

    const brandLogo = logoDataUri
      ? createElement("img", {
          src: logoDataUri,
          width: 48,
          height: 48,
          style: {
            objectFit: "contain",
            borderRadius: "14px",
          },
        })
      : el(
          "div",
          {
            display: "flex",
            width: "48px",
            height: "48px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "14px",
            background: "#f5c4d9",
            color: "#5a315f",
            fontSize: "17px",
            fontWeight: 700,
          },
          "L"
        );

    const brand = el(
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
            width: "58px",
            height: "58px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.82)",
            border: "1px solid rgba(255,255,255,0.95)",
            boxShadow: "0 8px 22px rgba(93,49,105,0.10)",
          },
          [brandLogo]
        ),

        el(
          "div",
          {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          },
          [
            el(
              "div",
              {
                display: "flex",
                fontSize: "25px",
                fontWeight: 700,
                letterSpacing: "-0.4px",
                color: "#4d2852",
              },
              "Loveons.com"
            ),

            el(
              "div",
              {
                display: "flex",
                marginTop: "3px",
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "1.5px",
                color: "#966c96",
              },
              "LOVE • INTIMACY • CONNECTION"
            ),
          ]
        ),
      ]
    );

    const headerTitle = el(
      "div",
      {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "13px 20px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.62)",
        border: "1px solid rgba(255,255,255,0.82)",
        boxShadow: "0 7px 20px rgba(96,54,108,0.06)",
      },
      [
        el(
          "div",
          {
            display: "flex",
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "2px",
            color: "#754978",
          },
          "COSMIC LOVE TAROT"
        ),
      ]
    );

    const header = el(
      "div",
      {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
      },
      [brand, headerTitle]
    );

    /*
     * ------------------------------------------------------------
     * MINI TAROT CARD HELPER
     * ------------------------------------------------------------
     */

    const createMiniCard = (
      miniCard: (typeof TAROT_CARDS)[number],
      rotate: string,
      offsetY: number,
      opacity = 1
    ) => {
      return el(
        "div",
        {
          position: "absolute",
          width: "104px",
          height: "148px",
          top: `${offsetY}px`,
          left: "50%",
          marginLeft: "-52px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "18px",
          background:
            "linear-gradient(145deg, #fffafd 0%, #f5e5f4 55%, #e9ddf7 100%)",
          border: "2px solid rgba(255,255,255,0.95)",
          boxShadow: "0 12px 28px rgba(87,47,99,0.18)",
          color: "#55315c",
          transform: rotate,
          opacity,
        },
        [
          el(
            "div",
            {
              display: "flex",
              width: "62px",
              height: "62px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background:
                "linear-gradient(145deg, #f5c7df 0%, #e4c9f3 100%)",
              border: "4px solid rgba(255,255,255,0.82)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.8px",
              color: "#704773",
            },
            miniCard.symbol
          ),

          el(
            "div",
            {
              display: "flex",
              textAlign: "center",
              fontSize: "12px",
              fontWeight: 700,
              lineHeight: 1.05,
              marginTop: "10px",
              paddingLeft: "7px",
              paddingRight: "7px",
            },
            miniCard.name.replace("The ", "")
          ),
        ]
      );
    };

    /*
     * ------------------------------------------------------------
     * TAROT SPREAD
     * ------------------------------------------------------------
     */

    const otherCards = TAROT_CARDS.filter(
      (_, index) => index !== cardIndex
    );

    const miniPositions = [
      {
        left: "17%",
        top: "58px",
        rotate: "rotate(-14deg)",
      },
      {
        left: "32%",
        top: "30px",
        rotate: "rotate(-7deg)",
      },
      {
        left: "68%",
        top: "30px",
        rotate: "rotate(7deg)",
      },
      {
        left: "83%",
        top: "58px",
        rotate: "rotate(14deg)",
      },
    ];

    const miniCards = otherCards.map((miniCard, index) => {
      const position = miniPositions[index];

      return el(
        "div",
        {
          position: "absolute",
          width: "104px",
          height: "148px",
          left: position.left,
          top: position.top,
          marginLeft: "-52px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "18px",
          background:
            "linear-gradient(145deg, #fffafd 0%, #f5e5f4 55%, #e9ddf7 100%)",
          border: "2px solid rgba(255,255,255,0.96)",
          boxShadow: "0 14px 30px rgba(87,47,99,0.18)",
          color: "#55315c",
          transform: position.rotate,
        },
        [
          el(
            "div",
            {
              display: "flex",
              width: "58px",
              height: "58px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background:
                "linear-gradient(145deg, #f4c7df 0%, #e4c8f2 100%)",
              border: "4px solid rgba(255,255,255,0.85)",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.6px",
              color: "#704773",
            },
            miniCard.symbol
          ),

          el(
            "div",
            {
              display: "flex",
              textAlign: "center",
              fontSize: "11px",
              fontWeight: 700,
              lineHeight: 1.05,
              marginTop: "9px",
              paddingLeft: "7px",
              paddingRight: "7px",
            },
            miniCard.name.replace("The ", "")
          ),
        ]
      );
    });

    /*
     * ------------------------------------------------------------
     * MAIN / SELECTED TAROT CARD
     * ------------------------------------------------------------
     */

    const mainLogo = logoDataUri
      ? createElement("img", {
          src: logoDataUri,
          width: 108,
          height: 108,
          style: {
            objectFit: "contain",
          },
        })
      : el(
          "div",
          {
            display: "flex",
            fontSize: "38px",
            fontWeight: 800,
            color: "#ffffff",
          },
          "L"
        );

    const mainTarotCard = el(
      "div",
      {
        position: "absolute",
        width: "190px",
        height: "285px",
        left: "50%",
        top: "40px",
        marginLeft: "-95px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "28px",
        background:
          "linear-gradient(150deg, #fffafd 0%, #f8e5f2 50%, #e8d9f5 100%)",
        border: "3px solid rgba(255,255,255,0.96)",
        boxShadow:
          "0 20px 48px rgba(79,42,92,0.25), 0 0 0 8px rgba(255,255,255,0.20)",
        color: "#4d2852",
        zIndex: 10,
      },
      [
        el(
          "div",
          {
            display: "flex",
            width: "126px",
            height: "126px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background:
              "linear-gradient(145deg, #f4b9d6 0%, #e1c0ef 100%)",
            border: "7px solid rgba(255,255,255,0.92)",
            boxShadow:
              "0 10px 30px rgba(109,60,123,0.20), inset 0 0 0 2px rgba(255,255,255,0.35)",
          },
          [mainLogo]
        ),

        el(
          "div",
          {
            display: "flex",
            textAlign: "center",
            fontSize: "20px",
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: "15px",
            paddingLeft: "13px",
            paddingRight: "13px",
            color: "#4d2852",
          },
          card.name
        ),

        el(
          "div",
          {
            display: "flex",
            marginTop: "7px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.8px",
            color: "#94638f",
            textAlign: "center",
          },
          card.theme.toUpperCase()
        ),
      ]
    );

    const spreadBadge = el(
      "div",
      {
        position: "absolute",
        left: "50%",
        bottom: "8px",
        marginLeft: "-72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "144px",
        height: "30px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.74)",
        border: "1px solid rgba(255,255,255,0.9)",
        color: "#80567e",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "1px",
      },
      "TODAY'S CARD"
    );

    const tarotSpread = el(
      "div",
      {
        position: "relative",
        width: "450px",
        height: "345px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "-8px",
      },
      [
        el(
          "div",
          {
            position: "absolute",
            left: "20px",
            right: "20px",
            top: "8px",
            bottom: "10px",
            borderRadius: "42px",
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0) 72%)",
          }
        ),

        ...miniCards,

        mainTarotCard,

        spreadBadge,
      ]
    );

    /*
     * ------------------------------------------------------------
     * RIGHT SIDE READING
     * ------------------------------------------------------------
     */

    const readingHeader = el(
      "div",
      {
        display: "flex",
        flexDirection: "column",
        marginBottom: "16px",
      },
      [
        el(
          "div",
          {
            display: "flex",
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "1.7px",
            color: "#9b6b96",
            marginBottom: "7px",
          },
          dateText.toUpperCase()
        ),

        el(
          "div",
          {
            display: "flex",
            fontSize: "38px",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.8px",
            color: "#48264d",
          },
          `${name}'s Cosmic Tarot`
        ),
      ]
    );

    const readingBox = el(
      "div",
      {
        display: "flex",
        flexDirection: "column",
        padding: "19px 22px",
        borderRadius: "22px",
        background: "rgba(255,255,255,0.57)",
        border: "1px solid rgba(255,255,255,0.88)",
        boxShadow: "0 10px 25px rgba(91,50,102,0.07)",
      },
      [
        el(
          "div",
          {
            display: "flex",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "1.5px",
            color: "#a06a94",
            marginBottom: "9px",
          },
          "TODAY'S LOVE MESSAGE"
        ),

        el(
          "div",
          {
            display: "flex",
            fontSize: "21px",
            lineHeight: 1.35,
            fontWeight: 500,
            color: "#56385b",
          },
          card.reading
        ),
      ]
    );

    const secretBox = el(
      "div",
      {
        display: "flex",
        flexDirection: "column",
        marginTop: "13px",
        padding: "16px 21px",
        borderRadius: "20px",
        background:
          "linear-gradient(135deg, rgba(246,215,230,0.75) 0%, rgba(231,214,244,0.75) 100%)",
        border: "1px solid rgba(255,255,255,0.72)",
      },
      [
        el(
          "div",
          {
            display: "flex",
            alignItems: "center",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "1.5px",
            color: "#8a5b85",
            marginBottom: "7px",
          },
          "✦  LOVE SECRET  ✦"
        ),

        el(
          "div",
          {
            display: "flex",
            fontSize: "17px",
            lineHeight: 1.3,
            fontWeight: 500,
            color: "#69466b",
          },
          secret
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
        paddingLeft: "2px",
        paddingRight: "2px",
      },
      [readingHeader, readingBox, secretBox]
    );

    /*
     * ------------------------------------------------------------
     * MAIN BODY
     * ------------------------------------------------------------
     */

    const body = el(
      "div",
      {
        width: "100%",
        display: "flex",
        flex: 1,
        alignItems: "center",
        gap: "34px",
      },
      [tarotSpread, reading]
    );

    /*
     * ------------------------------------------------------------
     * FOOTER
     * ------------------------------------------------------------
     */

    const footer = el(
      "div",
      {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "8px",
        paddingTop: "8px",
        borderTop: "1px solid rgba(120,77,123,0.12)",
      },
      [
        el(
          "div",
          {
            display: "flex",
            fontSize: "13px",
            fontWeight: 600,
            color: "#815d7e",
          },
          "A personalized cosmic reading from Loveons"
        ),

        el(
          "div",
          {
            display: "flex",
            fontSize: "11px",
            fontWeight: 500,
            color: "#9a7c96",
          },
          "Loveons.com  •  For entertainment purposes only"
        ),
      ]
    );

    /*
     * ------------------------------------------------------------
     * FINAL 1200 × 630 IMAGE
     * ------------------------------------------------------------
     */

    const image = el(
      "div",
      {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(135deg, #fff8fb 0%, #fcecf5 43%, #eee4f8 100%)",
        color: "#4d2852",
        padding: "30px 48px 20px 48px",
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
      },
      [
        /*
         * Background glow — top right
         */
        el(
          "div",
          {
            position: "absolute",
            top: "-190px",
            right: "-120px",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(214,172,226,0.40) 0%, rgba(214,172,226,0) 70%)",
          }
        ),

        /*
         * Background glow — bottom left
         */
        el(
          "div",
          {
            position: "absolute",
            bottom: "-250px",
            left: "-160px",
            width: "560px",
            height: "560px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(246,187,211,0.35) 0%, rgba(246,187,211,0) 70%)",
          }
        ),

        /*
         * Small decorative glow behind tarot spread
         */
        el(
          "div",
          {
            position: "absolute",
            left: "35px",
            top: "160px",
            width: "420px",
            height: "350px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 72%)",
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
