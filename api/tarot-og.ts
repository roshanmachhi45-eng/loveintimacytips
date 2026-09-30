import { ImageResponse } from "@vercel/og";
import { createElement } from "react";

const TAROT_CARDS = [
  {
    name: "The Lovers' Embrace",
    symbol: "LOVE",
    icon: "♥",
    theme: "Romantic Alignment",
    reading:
      "Your heart is opening to a deeper kind of connection. Trust what feels genuine and allow love to grow naturally.",
  },
  {
    name: "The Cosmic Mirror",
    symbol: "MIRROR",
    icon: "✦",
    theme: "Inner Reflection",
    reading:
      "Love begins with knowing yourself. The energy around you encourages honesty, self-reflection, and emotional clarity.",
  },
  {
    name: "The Eternal Star",
    symbol: "STAR",
    icon: "★",
    theme: "Hope & Clarity",
    reading:
      "A hopeful energy surrounds your love life. Keep your heart open and let clarity guide your next emotional step.",
  },
  {
    name: "The Forest Oracle",
    symbol: "MOON",
    icon: "☾",
    theme: "Patient Growth",
    reading:
      "Some connections need time to unfold. Patience, consistency, and emotional understanding can create something lasting.",
  },
  {
    name: "The Phoenix Heart",
    symbol: "HEART",
    icon: "♡",
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
     * ============================================================
     * LOVEONS BRAND HEADER
     * ============================================================
     */

    const brandLogo = logoDataUri
      ? createElement("img", {
          src: logoDataUri,
          width: 44,
          height: 44,
          style: {
            width: "44px",
            height: "44px",
            objectFit: "cover",
            borderRadius: "50%",
          },
        })
      : el(
          "div",
          {
            display: "flex",
            width: "44px",
            height: "44px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "#f54272",
            color: "#ffffff",
            fontSize: "22px",
            fontWeight: 800,
          },
          "♥"
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
            borderRadius: "50%",
            background: "#ffffff",
            border: "2px solid rgba(245,66,114,0.10)",
            boxShadow: "0 8px 22px rgba(245,66,114,0.12)",
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
                fontWeight: 750,
                letterSpacing: "-0.4px",
                color: "#432d3f",
              },
              "Loveons.com"
            ),

            el(
              "div",
              {
                display: "flex",
                marginTop: "4px",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.2px",
                color: "#9c7189",
              },
              "Build Authentic Connections Beyond The Screen"
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
        padding: "12px 21px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.88)",
        border: "1px solid rgba(245,66,114,0.08)",
        boxShadow: "0 7px 20px rgba(90,48,70,0.06)",
      },
      [
        el(
          "div",
          {
            display: "flex",
            fontSize: "15px",
            fontWeight: 750,
            letterSpacing: "1.8px",
            color: "#87536e",
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
        marginBottom: "13px",
      },
      [brand, headerTitle]
    );

    /*
     * ============================================================
     * SIDE TAROT CARD ICONS
     * ============================================================
     */

    const otherCards = TAROT_CARDS.filter(
      (_, index) => index !== cardIndex
    );

    const miniPositions = [
      {
        left: "18%",
        top: "73px",
        rotate: "rotate(-13deg)",
      },
      {
        left: "34%",
        top: "39px",
        rotate: "rotate(-6deg)",
      },
      {
        left: "66%",
        top: "39px",
        rotate: "rotate(6deg)",
      },
      {
        left: "82%",
        top: "73px",
        rotate: "rotate(13deg)",
      },
    ];

    const miniCards = otherCards.map((miniCard, index) => {
      const position = miniPositions[index];

      return el(
        "div",
        {
          position: "absolute",
          width: "96px",
          height: "142px",
          left: position.left,
          top: position.top,
          marginLeft: "-48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "19px",
          background:
            "linear-gradient(145deg, #ffffff 0%, #fff6fa 65%, #fcebf4 100%)",
          border: "2px solid rgba(255,255,255,0.98)",
          boxShadow: "0 13px 28px rgba(102,57,79,0.13)",
          color: "#9a607d",
          transform: position.rotate,
        },
        [
          el(
            "div",
            {
              display: "flex",
              width: "60px",
              height: "60px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background:
                "linear-gradient(145deg, #fff0f5 0%, #fde1ec 100%)",
              border: "3px solid #ffffff",
              boxShadow: "0 5px 14px rgba(245,66,114,0.10)",
              fontSize:
                miniCard.icon === "★"
                  ? "29px"
                  : miniCard.icon === "☾"
                    ? "31px"
                    : "30px",
              fontWeight: 700,
              color: "#f04472",
            },
            miniCard.icon
          ),

          el(
            "div",
            {
              display: "flex",
              marginTop: "12px",
              fontSize: "9px",
              fontWeight: 750,
              letterSpacing: "1.2px",
              color: "#b47d96",
            },
            "TAROT"
          ),
        ]
      );
    });

    /*
     * ============================================================
     * CENTER TAROT CARD
     * ============================================================
     */

    const mainLogo = logoDataUri
      ? createElement("img", {
          src: logoDataUri,
          width: 94,
          height: 94,
          style: {
            width: "94px",
            height: "94px",
            objectFit: "cover",
            borderRadius: "50%",
          },
        })
      : el(
          "div",
          {
            display: "flex",
            width: "94px",
            height: "94px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "#f54272",
            color: "#ffffff",
            fontSize: "39px",
            fontWeight: 800,
          },
          "♥"
        );

    const mainTarotCard = el(
      "div",
      {
        position: "absolute",
        width: "184px",
        height: "274px",
        left: "50%",
        top: "47px",
        marginLeft: "-92px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "27px",
        background:
          "linear-gradient(150deg, #ffffff 0%, #fff6fa 55%, #fdebf4 100%)",
        border: "3px solid rgba(255,255,255,0.98)",
        boxShadow:
          "0 20px 44px rgba(104,56,80,0.18), 0 0 0 6px rgba(255,255,255,0.34)",
        color: "#432d3f",
        zIndex: 10,
      },
      [
        /*
         * Circular logo frame
         */
        el(
          "div",
          {
            display: "flex",
            width: "114px",
            height: "114px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background:
              "linear-gradient(145deg, #fff0f5 0%, #fde0eb 100%)",
            border: "6px solid #ffffff",
            boxShadow:
              "0 9px 25px rgba(245,66,114,0.13), inset 0 0 0 2px rgba(245,66,114,0.05)",
            overflow: "hidden",
          },
          [mainLogo]
        ),

        el(
          "div",
          {
            display: "flex",
            textAlign: "center",
            fontSize: "19px",
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: "14px",
            paddingLeft: "12px",
            paddingRight: "12px",
            color: "#432d3f",
          },
          card.name
        ),

        el(
          "div",
          {
            display: "flex",
            marginTop: "7px",
            fontSize: "9px",
            fontWeight: 750,
            letterSpacing: "1.1px",
            color: "#b06d89",
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
        bottom: "4px",
        marginLeft: "-68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "136px",
        height: "28px",
        borderRadius: "999px",
        background: "#ffffff",
        border: "1px solid rgba(245,66,114,0.08)",
        boxShadow: "0 5px 14px rgba(94,51,73,0.08)",
        color: "#aa6683",
        fontSize: "10px",
        fontWeight: 750,
        letterSpacing: "1.1px",
      },
      "TODAY'S CARD"
    );

    const tarotSpread = el(
      "div",
      {
        position: "relative",
        width: "455px",
        height: "330px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "-4px",
      },
      [
        /*
         * Soft white/pink glow behind cards
         */
        el(
          "div",
          {
            position: "absolute",
            left: "25px",
            right: "25px",
            top: "28px",
            bottom: "15px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.72) 0%, rgba(255,242,247,0.22) 52%, rgba(255,255,255,0) 75%)",
          }
        ),

        ...miniCards,

        mainTarotCard,

        spreadBadge,
      ]
    );

    /*
     * ============================================================
     * RIGHT SIDE READING
     * ============================================================
     */

    const readingHeader = el(
      "div",
      {
        display: "flex",
        flexDirection: "column",
        marginBottom: "12px",
      },
      [
        el(
          "div",
          {
            display: "flex",
            fontSize: "14px",
            fontWeight: 750,
            letterSpacing: "1.6px",
            color: "#b06f8d",
            marginBottom: "6px",
          },
          dateText.toUpperCase()
        ),

        el(
          "div",
          {
            display: "flex",
            fontSize: "36px",
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: "-0.8px",
            color: "#432d3f",
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
        padding: "17px 20px",
        borderRadius: "21px",
        background: "#ffffff",
        border: "1px solid rgba(245,66,114,0.07)",
        boxShadow: "0 9px 24px rgba(96,53,73,0.07)",
      },
      [
        el(
          "div",
          {
            display: "flex",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "1.5px",
            color: "#c07997",
            marginBottom: "8px",
          },
          "TODAY'S LOVE MESSAGE"
        ),

        el(
          "div",
          {
            display: "flex",
            fontSize: "20px",
            lineHeight: 1.34,
            fontWeight: 500,
            color: "#604452",
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
        marginTop: "11px",
        padding: "14px 20px",
        borderRadius: "19px",
        background:
          "linear-gradient(135deg, #fff0f5 0%, #fde8f1 100%)",
        border: "1px solid rgba(245,66,114,0.06)",
        boxShadow: "0 7px 18px rgba(96,53,73,0.05)",
      },
      [
        el(
          "div",
          {
            display: "flex",
            alignItems: "center",
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "1.4px",
            color: "#b56887",
            marginBottom: "6px",
          },
          "✦  LOVE SECRET  ✦"
        ),

        el(
          "div",
          {
            display: "flex",
            fontSize: "16px",
            lineHeight: 1.28,
            fontWeight: 500,
            color: "#704b5c",
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
        paddingLeft: "4px",
        paddingRight: "3px",
      },
      [readingHeader, readingBox, secretBox]
    );

    /*
     * ============================================================
     * MAIN BODY
     * ============================================================
     */

    const body = el(
      "div",
      {
        width: "100%",
        display: "flex",
        flex: 1,
        alignItems: "center",
        gap: "27px",
      },
      [tarotSpread, reading]
    );

    /*
     * ============================================================
     * FOOTER
     * ============================================================
     */

    const footer = el(
      "div",
      {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "3px",
        paddingTop: "8px",
        borderTop: "1px solid rgba(177,104,135,0.13)",
      },
      [
        el(
          "div",
          {
            display: "flex",
            fontSize: "12px",
            fontWeight: 600,
            color: "#9b7184",
          },
          "A personalized cosmic reading from Loveons"
        ),

        el(
          "div",
          {
            display: "flex",
            fontSize: "10px",
            fontWeight: 500,
            color: "#a98596",
          },
          "Disclaimer: For entertainment purposes only"
        ),
      ]
    );

    /*
     * ============================================================
     * FINAL OG IMAGE — 1200 × 630
     * ============================================================
     */

    const image = el(
      "div",
      {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(135deg, #fffafb 0%, #fff4f8 48%, #fff8fb 100%)",
        color: "#432d3f",
        padding: "28px 48px 17px 48px",
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
      },
      [
        /*
         * Very soft pink background glow
         */
        el(
          "div",
          {
            position: "absolute",
            top: "-220px",
            right: "-130px",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(250,185,207,0.28) 0%, rgba(250,185,207,0) 70%)",
          }
        ),

        /*
         * Bottom pink glow
         */
        el(
          "div",
          {
            position: "absolute",
            bottom: "-240px",
            left: "-170px",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(249,199,217,0.24) 0%, rgba(249,199,217,0) 70%)",
          }
        ),

        /*
         * Soft central white glow
         */
        el(
          "div",
          {
            position: "absolute",
            left: "20px",
            top: "150px",
            width: "500px",
            height: "360px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0) 72%)",
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
