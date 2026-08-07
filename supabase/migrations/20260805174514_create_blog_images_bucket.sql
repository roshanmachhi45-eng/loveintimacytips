/*
# Create blog_images storage bucket

## Purpose
Stores featured images for blog posts uploaded through the CMS admin interface.
Images are public so they can be served directly in blog cards and article pages.

## Changes
- Creates a public storage bucket named `blog_images`
- Sets public read access (anyone can view images)
- Sets public upload access (CMS admin can upload without auth — single-tenant app)

## Security
- Public bucket — images are visible to everyone (intentional for blog featured images)
- Upload is allowed for anon + authenticated (no-auth app, CMS is open)
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog_images', 'blog_images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_read_blog_images" ON storage.objects;
CREATE POLICY "anon_read_blog_images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'blog_images');

DROP POLICY IF EXISTS "anon_upload_blog_images" ON storage.objects;
CREATE POLICY "anon_upload_blog_images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'blog_images');

DROP POLICY IF EXISTS "anon_update_blog_images" ON storage.objects;
CREATE POLICY "anon_update_blog_images"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'blog_images')
WITH CHECK (bucket_id = 'blog_images');

DROP POLICY IF EXISTS "anon_delete_blog_images" ON storage.objects;
CREATE POLICY "anon_delete_blog_images"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'blog_images');
