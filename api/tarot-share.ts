import type { VercelRequest, VercelResponse } from '@vercel/node';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

export default function handler(req: VercelRequest, res: VercelResponse) {
  const name =
    typeof req.query?.name === "string"
      ? req.query.name.trim()
      : "Your";

  const birth =
    typeof req.query?.birth === "string"
      ? req.query.birth
      : "";

  const date =
    typeof req.query?.date === "string"
      ? req.query.date
      : new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
        }).format(new Date());

  const card = typeof req.query?.card === "string" ? req.query.card.trim().slice(0, 80) : "Your Cosmic Card";
  const reading = typeof req.query?.reading === "string" ? req.query.reading.trim().slice(0, 240) : "A personalized cosmic love message awaits you.";
  const secret = typeof req.query?.secret === "string" ? req.query.secret.trim().slice(0, 240) : "Trust your heart and let genuine connection unfold naturally.";
  const theme = typeof req.query?.theme === "string" ? req.query.theme.trim().slice(0, 80) : "Cosmic Love Energy";
  const dateText = getDateText(date);
  const shareParams = new URLSearchParams({ name, birth, date, card, reading, secret, theme });

  const resultUrl =
    `https://www.loveons.com/tools/tarot` +
    `?name=${encodeURIComponent(name)}` +
    `&birth=${encodeURIComponent(birth)}` +
    `&date=${encodeURIComponent(date)}`;

  const imageUrl =
    `https://www.loveons.com/api/tarot-og?${shareParams.toString()}`;

  const title = `${name}'s Cosmic Love Tarot • ${card}`;
  const description = `${name}'s personalized ${card} reading for ${dateText}.`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <title>${escapeHtml(title)}</title>

  <meta
    name="description"
    content="${escapeHtml(description)}"
  />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Loveons" />
  <meta
    property="og:title"
    content="${escapeHtml(title)}"
  />
  <meta
    property="og:description"
    content="${escapeHtml(description)}"
  />
  <meta
    property="og:image"
    content="${imageUrl}"
  />
  <meta
    property="og:image:width"
    content="1200"
  />
  <meta
    property="og:image:height"
    content="630"
  />
  <meta
    property="og:url"
    content="https://www.loveons.com/share/tarot?${shareParams.toString()}"
  />

  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content="${escapeHtml(title)}"
  />
  <meta
    name="twitter:description"
    content="${escapeHtml(description)}"
  />
  <meta
    name="twitter:image"
    content="${imageUrl}"
  />

  <link
    rel="canonical"
    href="https://www.loveons.com/share/tarot?${shareParams.toString()}"
  />

  <meta
    http-equiv="refresh"
    content="0;url=${resultUrl}"
  />

  <script>
    window.location.replace(${JSON.stringify(resultUrl)});
  </script>
</head>

<body>
  <p>
    Opening your Cosmic Tarot reading...
  </p>
</body>
</html>`;

  res.status(200).setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
