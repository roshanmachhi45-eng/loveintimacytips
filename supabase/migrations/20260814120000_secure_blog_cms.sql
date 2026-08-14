
-- ============================================================
-- LOVEONS BLOG CMS
-- SEO foundation + admin authorization + RLS
-- ============================================================

-- 1. SEO / CMS fields
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS canonical_url text,
ADD COLUMN IF NOT EXISTS og_image_url text,
ADD COLUMN IF NOT EXISTS focus_keyword text,
ADD COLUMN IF NOT EXISTS noindex boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;


-- 2. Admin users table
CREATE TABLE IF NOT EXISTS public.blog_admins (
  user_id uuid PRIMARY KEY
    REFERENCES auth.users(id)
    ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- 3. Register your existing admin account
INSERT INTO public.blog_admins (user_id)
VALUES ('d43dabfc-54ea-473d-8f54-a36cf4282dae')
ON CONFLICT (user_id) DO NOTHING;


-- 4. Admin-check function
CREATE OR REPLACE FUNCTION public.is_blog_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.blog_admins
    WHERE user_id = auth.uid()
  );
$$;


-- 5. Secure admin table
ALTER TABLE public.blog_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin list"
ON public.blog_admins;

CREATE POLICY "Admins can view admin list"
ON public.blog_admins
FOR SELECT
TO authenticated
USING (
  public.is_blog_admin()
);


-- 6. Secure blog table
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;


-- Remove broad public write policies
DROP POLICY IF EXISTS "Anyone can insert blog posts"
ON public.blog_posts;

DROP POLICY IF EXISTS "Anyone can update blog posts"
ON public.blog_posts;

DROP POLICY IF EXISTS "Anyone can delete blog posts"
ON public.blog_posts;

DROP POLICY IF EXISTS "Public can insert blog posts"
ON public.blog_posts;

DROP POLICY IF EXISTS "Public can update blog posts"
ON public.blog_posts;

DROP POLICY IF EXISTS "Public can delete blog posts"
ON public.blog_posts;


-- 7. Public users can read ONLY published posts
DROP POLICY IF EXISTS "Public can read published blog posts"
ON public.blog_posts;

CREATE POLICY "Public can read published blog posts"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (
  published = true
);


-- 8. Admins can read everything, including drafts
DROP POLICY IF EXISTS "Admins can read all blog posts"
ON public.blog_posts;

CREATE POLICY "Admins can read all blog posts"
ON public.blog_posts
FOR SELECT
TO authenticated
USING (
  public.is_blog_admin()
);


-- 9. Admins can create posts
DROP POLICY IF EXISTS "Admins can create blog posts"
ON public.blog_posts;

CREATE POLICY "Admins can create blog posts"
ON public.blog_posts
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_blog_admin()
);


-- 10. Admins can update posts
DROP POLICY IF EXISTS "Admins can update blog posts"
ON public.blog_posts;

CREATE POLICY "Admins can update blog posts"
ON public.blog_posts
FOR UPDATE
TO authenticated
USING (
  public.is_blog_admin()
)
WITH CHECK (
  public.is_blog_admin()
);


-- 11. Admins can delete posts
DROP POLICY IF EXISTS "Admins can delete blog posts"
ON public.blog_posts;

CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts
FOR DELETE
TO authenticated
USING (
  public.is_blog_admin()
);


-- 12. Useful indexes
CREATE INDEX IF NOT EXISTS blog_posts_published_idx
ON public.blog_posts (published);

CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx
ON public.blog_posts (published_at DESC);

CREATE INDEX IF NOT EXISTS blog_posts_category_idx
ON public.blog_posts (category);

CREATE INDEX IF NOT EXISTS blog_posts_featured_idx
ON public.blog_posts (featured);

CREATE INDEX IF NOT EXISTS blog_posts_slug_idx
ON public.blog_posts (slug);
