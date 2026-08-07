/*
# Create blog_posts table for Loveons CMS

## Purpose
Stores all blog articles for the Loveons relationship wellness platform.
Articles are managed through a CMS-like admin interface — no code edits needed to publish.

## New Tables
- `blog_posts`
  - `id` (uuid, primary key)
  - `title` (text, not null) — article title
  - `slug` (text, not null, unique) — URL-safe identifier
  - `category` (text, not null) — one of: Communication, Emotional Connection, Wellness, Dating, Relationships, Self-Love
  - `excerpt` (text, not null) — short description for cards and meta
  - `content` (text, not null) — full article body (paragraphs separated by newlines)
  - `image_url` (text) — featured image URL (Supabase Storage public URL or external URL)
  - `image_alt` (text) — alt text for the featured image
  - `author` (text, not null, default 'Loveons Editorial')
  - `published` (boolean, default false) — draft vs published
  - `published_at` (timestamptz) — when the article was published
  - `reading_time` (text) — e.g. "5 min read"
  - `tags` (text[]) — array of tag strings
  - `meta_title` (text) — SEO meta title
  - `meta_description` (text) — SEO meta description
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

## Indexes
- Unique index on `slug` for fast lookups
- Index on `category` for category filtering
- Index on `published_at` for chronological ordering

## Security
- RLS enabled on `blog_posts`
- This is a single-tenant app (no sign-in screen) — all policies use `TO anon, authenticated`
- SELECT: anyone can read published posts (and admins can read drafts — currently all are public since no auth)
- INSERT/UPDATE/DELETE: anyone can create/edit/delete (CMS is open in this no-auth app)

## Notes
1. The `slug` column has a UNIQUE constraint to prevent duplicate URLs.
2. `published_at` is set when `published` is toggled to true.
3. `reading_time` is provided by the CMS editor.
4. `tags` is a PostgreSQL array for flexible tagging.
*/

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  image_url text,
  image_alt text,
  author text NOT NULL DEFAULT 'Loveons Editorial',
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  reading_time text,
  tags text[] DEFAULT '{}',
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_blog_posts" ON blog_posts;
CREATE POLICY "anon_select_blog_posts"
ON blog_posts FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_blog_posts" ON blog_posts;
CREATE POLICY "anon_insert_blog_posts"
ON blog_posts FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_blog_posts" ON blog_posts;
CREATE POLICY "anon_update_blog_posts"
ON blog_posts FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_blog_posts" ON blog_posts;
CREATE POLICY "anon_delete_blog_posts"
ON blog_posts FOR DELETE
TO anon, authenticated USING (true);
