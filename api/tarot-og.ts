import { ImageResponse } from "@vercel/og";
import { createElement } from "react";

const TAROT_CARDS = [
  {
    name: "The Lovers' Embrace",
    theme: "Romantic Alignment",
    icon: "heart",
    reading:
      "Your heart is opening to a deeper kind of connection. Trust what feels genuine and allow love to grow naturally.",
  },
  {
    name: "The Cosmic Mirror",
    theme: "Inner Reflection",
    icon: "sparkle",
    reading:
      "Love begins with knowing yourself. The energy around you encourages honesty, self-reflection, and emotional clarity.",
  },
  {
    name: "The Eternal Star",
    theme: "Hope & Clarity",
    icon: "star",
    reading:
      "A hopeful energy surrounds your love life. Keep your heart open and let clarity guide your next emotional step.",
  },
  {
    name: "The Forest Oracle",
    theme: "Patient Growth",
    icon: "moon",
    reading:
      "Some connections need time to unfold. Patience, consistency, and emotional understanding can create something lasting.",
  },
  {
    name: "The Phoenix Heart",
    theme: "Emotional Renewal",
    icon: "heart-outline",
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

/*
 * ------------------------------------------------------------
 * SVG ICONS
 * ------------------------------------------------------------
 */

function tarotIcon(
  type: string,
  size = 46,
  color = "#f54272"
) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    fill: "none",
  };

  if (type === "heart" || type === "heart-outline") {
    return createElement(
      "svg",
      common,
      createElement("path", {
        d: "M24 40.2C22.8 39.1 8 28.7 8 17.7C8 11.8 12.2 8 17.4 8C20.5 8 23 9.7 24 12.1C25 9.7 27.5 8 30.6 8C35.8 8 40 11.8 40 17.7C40 28.7 25.2 39.1 24 40.2Z",
        fill: type === "heart" ? color : "none",
        stroke: color,
        strokeWidth: "2.5",
        strokeLinejoin: "round",
      })
    );
  }

  if (type === "sparkle") {
    return createElement(
      "svg",
      common,
      [
        createElement("path", {
          key: "main",
          d: "M24 5L27.2 20.8L43 24L27.2 27.2L24 43L20.8 27.2L5 24L20.8 20.8L24 5Z",
          fill: color,
        }),
        createElement("path", {
          key: "small",
          d: "M38 6L39.2 11.8L45 13L39.2 14.2L38 20L36.8 14.2L31 13L36.8 11.8L38 6Z",
          fill: "#f7a4bd",
        }),
      ]
    );
  }

  if (type === "star") {
    return createElement(
      "svg",
      common,
      createElement("path", {
        d: "M24 5.5L29.3 17.1L42 18.6L32.6 27.3L35.2 40L24 33.5L12.8 40L15.4 27.3L6 18.6L18.7 17.1L24 5.5Z",
        fill: color,
        stroke: color,
        strokeWidth: "1.5",
        strokeLinejoin: "round",
      })
    );
  }

  if (type === "moon") {
    return createElement(
      "svg",
      common,
      createElement("path", {
        d: "M34.8 34.2C30.9 38.1 24.9 39.3 19.8 37.1C14.6 34.9 11.2 29.7 11.4 24C11.6 18.1 15.1 13.1 20.5 10.9C22.5 10.1 24.7 9.8 26.7 10.1C22.2 13.2 20.1 18.4 21.4 23.6C22.8 29.1 27.6 33 33.3 33.2C33.8 33.2 34.3 33.2 34.8 33.1Z",
        fill: color,
      })
    );
  }

  return createElement(
    "svg",
    common,
    createElement("circle", {
      cx: "24",
      cy: "24",
      r: "17",
      fill: color,
    })
  );
}

/*
 * ------------------------------------------------------------
 * SEED / DATA
 * ------------------------------------------------------------
 */

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

/*
 * ------------------------------------------------------------
 * LOVEONS LOGO
 * ------------------------------------------------------------
 */

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

/*
 * ------------------------------------------------------------
 * BRAND HEADER
 * ------------------------------------------------------------
 */

function createBrand(logoDataUri: string | null) {
  const logo = logoDataUri
    ? createElement("img", {
        src: logoDataUri,
        width: 48,
        height: 48,
        style: {
          width: "48px",
          height: "48px",
          objectFit: "cover",
          borderRadius: "50%",
        },
      })
    : tarotIcon("heart", 28, "#ffffff");

  return el(
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
          width: "60px",
          height: "60px",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "#ffffff",
          border: "2px solid rgba(245,66,114,0.08)",
          boxShadow: "0 8px 22px rgba(245,66,114,0.12)",
        },
        [logo]
      ),

      el(
        "div",
        {
          display: "flex",
          flexDirection: "column",
        },
        [
          el(
            "div",
            {
              display: "flex",
              fontSize: "25px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
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
              color: "#a16d86",
            },
            "Build Authentic Connections Beyond The Screen"
          ),
        ]
      ),
    ]
  );
}

/*
 * ------------------------------------------------------------
 * MINI TAROT CARD
 * ------------------------------------------------------------
 */

function createMiniCard(
  card: (typeof TAROT_CARDS)[number],
  left: string,
  top: string,
  rotation: string,
  zIndex: number
) {
  return el(
    "div",
    {
      position: "absolute",
      left,
      top,
      width: "112px",
      height: "164px",
      marginLeft: "-56px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "20px",
      background:
        "linear-gradient(155deg, #ffffff 0%, #fff7fa 60%, #fde9f1 100%)",
      border: "2px solid rgba(255,255,255,0.98)",
      boxShadow:
        "0 14px 30px rgba(93,48,72,0.14), inset 0 0 0 1px rgba(245,66,114,0.04)",
      transform: rotation,
      zIndex,
    },
    [
      el(
        "div",
        {
          display: "flex",
          width: "68px",
          height: "68px",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "#fff0f5",
          border: "3px solid #ffffff",
          boxShadow: "0 5px 14px rgba(245,66,114,0.12)",
        },
        [tarotIcon(card.icon, 39, "#f54272")]
      ),

      el(
        "div",
        {
          display: "flex",
          marginTop: "13px",
          fontSize: "9px",
          fontWeight: 800,
          letterSpacing: "1.5px",
          color: "#b56e89",
        },
        "COSMIC"
      ),

      el(
        "div",
        {
          display: "flex",
          marginTop: "5px",
          width: "80px",
          height: "1px",
          background: "rgba(245,66,114,0.15)",
        }
      ),
    ]
  );
}

/*
 * ------------------------------------------------------------
 * CENTER TAROT CARD
 * ------------------------------------------------------------
 */

function createMainTarotCard(
  card: (typeof TAROT_CARDS)[number],
  logoDataUri: string | null
) {
  const logo = logoDataUri
    ? createElement("img", {
        src: logoDataUri,
        width: 82,
        height: 82,
        style: {
          width: "82px",
          height: "82px",
          objectFit: "cover",
          borderRadius: "50%",
        },
      })
    : tarotIcon("heart", 46, "#ffffff");

  return el(
    "div",
    {
      position: "absolute",
      left: "50%",
      top: "28px",
      width: "196px",
      height: "292px",
      marginLeft: "-98px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      borderRadius: "27px",
      background:
        "linear-gradient(160deg, #ffffff 0%, #fff8fb 58%, #fdebf3 100%)",
      border: "3px solid rgba(255,255,255,0.99)",
      boxShadow:
        "0 23px 45px rgba(91,48,70,0.18), 0 0 0 5px rgba(255,255,255,0.28)",
      zIndex: 20,
      overflow: "hidden",
    },
    [
      el(
        "div",
        {
          display: "flex",
          width: "120px",
          height: "120px",
          marginTop: "18px",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background:
            "linear-gradient(145deg, #fff0f5 0%, #fddfea 100%)",
          border: "5px solid #ffffff",
          boxShadow:
            "0 7px 20px rgba(245,66,114,0.12), inset 0 0 0 2px rgba(245,66,114,0.06)",
        },
        [
          el(
            "div",
            {
              display: "flex",
              width: "98px",
              height: "98px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              overflow: "hidden",
              background: "#ffffff",
              border: "2px solid rgba(245,66,114,0.07)",
            },
            [logo]
          ),
        ]
      ),

      el(
        "div",
        {
          display: "flex",
          marginTop: "14px",
          width: "165px",
          justifyContent: "center",
          textAlign: "center",
          fontSize: "19px",
          lineHeight: 1.05,
          fontWeight: 800,
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
          fontWeight: 800,
          letterSpacing: "1.3px",
          color: "#b36d89",
          textAlign: "center",
        },
        card.theme.toUpperCase()
      ),

      el(
        "div",
        {
          position: "absolute",
          bottom: "7px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "142px",
          height: "28px",
          borderRadius: "999px",
          background: "#ffffff",
          border: "1px solid rgba(245,66,114,0.08)",
          boxShadow: "0 4px 12px rgba(92,49,70,0.08)",
          fontSize: "9px",
          fontWeight: 800,
          letterSpacing: "1.1px",
          color: "#ad6684",
        },
        "TODAY'S CARD"
      ),
    ]
  );
}

/*
 * ------------------------------------------------------------
 * TAROT SPREAD
 * ------------------------------------------------------------
 */

function createTarotSpread(
  selectedCardIndex: number,
  logoDataUri: string | null
) {
  const otherCards = TAROT_CARDS.filter(
    (_, index) => index !== selectedCardIndex
  );

  const positions = [
    {
      left: "13%",
      top: "95px",
      rotation: "rotate(-13deg)",
      zIndex: 3,
    },
    {
      left: "34%",
      top: "48px",
      rotation: "rotate(-6deg)",
      zIndex: 5,
    },
    {
      left: "66%",
      top: "48px",
      rotation: "rotate(6deg)",
      zIndex: 5,
    },
    {
      left: "87%",
      top: "95px",
      rotation: "rotate(13deg)",
      zIndex: 3,
    },
  ];

  return el(
    "div",
    {
      position: "relative",
      width: "480px",
      height: "330px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    [
      /*
       * Soft glow behind the 5-card spread
       */
      el(
        "div",
        {
          position: "absolute",
          left: "10px",
          top: "25px",
          width: "460px",
          height: "290px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,242,247,0.48) 48%, rgba(255,255,255,0) 75%)",
        }
      ),

      createMiniCard(
        otherCards[0],
        positions[0].left,
        positions[0].top,
        positions[0].rotation,
        positions[0].zIndex
      ),

      createMiniCard(
        otherCards[1],
        positions[1].left,
        positions[1].top,
        positions[1].rotation,
        positions[1].zIndex
      ),

      createMiniCard(
        otherCards[2],
        positions[2].left,
        positions[2].top,
        positions[2].rotation,
        positions[2].zIndex
      ),

      createMiniCard(
        otherCards[3],
        positions[3].left,
        positions[3].top,
        positions[3].rotation,
        positions[3].zIndex
      ),

      createMainTarotCard(
        TAROT_CARDS[selectedCardIndex],
        logoDataUri
      ),
    ]
  );
}

/*
 * ------------------------------------------------------------
 * READING AREA
 * ------------------------------------------------------------
 */

function createReadingArea(
  name: string,
  dateText: string,
  card: (typeof TAROT_CARDS)[number],
  secret: string
) {
  const title = el(
    "div",
    {
      display: "flex",
      flexDirection: "column",
    },
    [
      el(
        "div",
        {
          display: "flex",
          fontSize: "13px",
          fontWeight: 800,
          letterSpacing: "1.6px",
          color: "#b46e8a",
          marginBottom: "7px",
        },
        dateText.toUpperCase()
      ),

      el(
        "div",
        {
          display: "flex",
          fontSize: "36px",
          lineHeight: 1.05,
          fontWeight: 800,
          letterSpacing: "-0.8px",
          color: "#432d3f",
        },
        `${name}'s Cosmic Tarot`
      ),
    ]
  );

  const message = el(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      padding: "18px 21px",
      borderRadius: "21px",
      background: "#ffffff",
      border: "1px solid rgba(245,66,114,0.07)",
      boxShadow: "0 10px 25px rgba(94,49,72,0.07)",
      marginTop: "14px",
    },
    [
      el(
        "div",
        {
          display: "flex",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "1.5px",
          color: "#bf7895",
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
          color: "#5d414f",
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
      padding: "14px 20px",
      marginTop: "11px",
      borderRadius: "19px",
      background:
        "linear-gradient(135deg, #fff0f5 0%, #fde5ef 100%)",
      border: "1px solid rgba(245,66,114,0.06)",
      boxShadow: "0 7px 18px rgba(94,49,72,0.05)",
    },
    [
      el(
        "div",
        {
          display: "flex",
          fontSize: "10px",
          fontWeight: 800,
          letterSpacing: "1.4px",
          color: "#b46b88",
          marginBottom: "7px",
        },
        "LOVE SECRET"
      ),

      el(
        "div",
        {
          display: "flex",
          fontSize: "16px",
          lineHeight: 1.3,
          fontWeight: 500,
          color: "#704b5c",
        },
        secret
      ),
    ]
  );

  return el(
    "div",
    {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      paddingLeft: "2px",
    },
    [title, message, secretBox]
  );
}

/*
 * ------------------------------------------------------------
 * FOOTER
 * ------------------------------------------------------------
 */

function createFooter() {
  return el(
    "div",
    {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: "9px",
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
}

/*
 * ------------------------------------------------------------
 * MAIN HANDLER
 * ------------------------------------------------------------
 */

export default {
  async fetch(request: Request) {
    const url = new URL(request.url, "https://loveons.com");

    const name =
      url.searchParams.get("name")?.trim() || "Your";

    const birthDate =
      url.searchParams.get("birth") || "";

    const date =
      url.searchParams.get("date") ||
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
      }).format(new Date());

    const seed = createSeed(
      name,
      birthDate,
      date
    );

    const cardIndex = seededIndex(
      seed,
      TAROT_CARDS.length,
      0
    );

    const birthMonth = getBirthMonth(
      birthDate
    );

    const secretIndex =
      (birthMonth +
        seededIndex(
          seed,
          LOVE_SECRETS.length,
          2
        )) %
      LOVE_SECRETS.length;

    const baseCard = TAROT_CARDS[cardIndex];
    const card = {
      ...baseCard,
      name: url.searchParams.get("card")?.trim().slice(0, 80) || baseCard.name,
      theme: url.searchParams.get("theme")?.trim().slice(0, 80) || baseCard.theme,
      reading: url.searchParams.get("reading")?.trim().slice(0, 240) || baseCard.reading,
    };

    const secret =
      url.searchParams.get("secret")?.trim().slice(0, 240) || LOVE_SECRETS[secretIndex];

    const dateText =
      getDateText(date);

    const logoDataUri =
      await getLogoDataUri();

    /*
     * ----------------------------------------------------------
     * HEADER
     * ----------------------------------------------------------
     */

    const brand =
      createBrand(logoDataUri);

    const headerBadge = el(
      "div",
      {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 22px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.90)",
        border: "1px solid rgba(245,66,114,0.08)",
        boxShadow:
          "0 8px 20px rgba(94,49,72,0.06)",
      },
      [
        el(
          "div",
          {
            display: "flex",
            fontSize: "15px",
            fontWeight: 800,
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
        marginBottom: "3px",
      },
      [brand, headerBadge]
    );

    /*
     * ----------------------------------------------------------
     * BODY
     * ----------------------------------------------------------
     */

    const spread =
      createTarotSpread(
        cardIndex,
        logoDataUri
      );

    const reading =
      createReadingArea(
        name,
        dateText,
        card,
        secret
      );

    const body = el(
      "div",
      {
        width: "100%",
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: "24px",
      },
      [spread, reading]
    );

    /*
     * ----------------------------------------------------------
     * FINAL IMAGE
     * ----------------------------------------------------------
     */

    const image = el(
      "div",
      {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        padding: "27px 48px 17px 48px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "sans-serif",
        background:
          "linear-gradient(135deg, #fffafb 0%, #fff5f8 48%, #fffafd 100%)",
        color: "#432d3f",
      },
      [
        /*
         * Top-right pink glow
         */
        el(
          "div",
          {
            position: "absolute",
            right: "-120px",
            top: "-210px",
            width: "530px",
            height: "530px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(250,183,207,0.28) 0%, rgba(250,183,207,0) 70%)",
          }
        ),

        /*
         * Bottom-left pink glow
         */
        el(
          "div",
          {
            position: "absolute",
            left: "-180px",
            bottom: "-250px",
            width: "540px",
            height: "540px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(250,190,211,0.25) 0%, rgba(250,190,211,0) 70%)",
          }
        ),

        /*
         * White center glow
         */
        el(
          "div",
          {
            position: "absolute",
            left: "30px",
            top: "170px",
            width: "500px",
            height: "340px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0) 72%)",
          }
        ),

        header,

        body,

        createFooter(),
      ]
    );

    return new ImageResponse(
      image,
      {
        width: 1200,
        height: 630,
      }
    );
  },
};
