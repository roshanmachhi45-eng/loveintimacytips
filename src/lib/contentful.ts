
// src/lib/contentful.ts

const CONTENTFUL_SPACE_ID =
  import.meta.env.VITE_CONTENTFUL_SPACE_ID;

const CONTENTFUL_ACCESS_TOKEN =
  import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;

const CONTENTFUL_ENVIRONMENT =
  import.meta.env.VITE_CONTENTFUL_ENVIRONMENT || 'master';

const CONTENTFUL_CONTENT_TYPE =
  import.meta.env.VITE_CONTENTFUL_CONTENT_TYPE || 'blogPost';

export const contentfulConfig = {
  spaceId: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_ACCESS_TOKEN,
  environment: CONTENTFUL_ENVIRONMENT,
  contentType: CONTENTFUL_CONTENT_TYPE,
};

export function getContentfulUrl(
  query = ''
): string {
  if (!CONTENTFUL_SPACE_ID) {
    throw new Error(
      'Missing VITE_CONTENTFUL_SPACE_ID environment variable.'
    );
  }

  if (!CONTENTFUL_ACCESS_TOKEN) {
    throw new Error(
      'Missing VITE_CONTENTFUL_ACCESS_TOKEN environment variable.'
    );
  }

  const baseUrl =
    `https://cdn.contentful.com/spaces/` +
    `${CONTENTFUL_SPACE_ID}/environments/` +
    `${CONTENTFUL_ENVIRONMENT}/entries`;

  return query
    ? `${baseUrl}?${query}`
    : baseUrl;
}

export async function contentfulFetch(
  query = ''
) {
  const url = getContentfulUrl(query);

  const response = await fetch(url, {
    headers: {
      Authorization:
        `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `Contentful API error ${response.status}: ${message}`
    );
  }

  return response.json();
}

