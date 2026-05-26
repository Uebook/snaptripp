-- 1. Ensure buckets are marked as public
INSERT INTO storage.buckets (id, name, public)
VALUES 
('blogs', 'blogs', true),
('carousel', 'carousel', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow public SELECT access so uploaded images are visible on the website
DROP POLICY IF EXISTS "Public Select Blogs" ON storage.objects;
CREATE POLICY "Public Select Blogs" ON storage.objects
  FOR SELECT USING (bucket_id = 'blogs');

DROP POLICY IF EXISTS "Public Select Carousel" ON storage.objects;
CREATE POLICY "Public Select Carousel" ON storage.objects
  FOR SELECT USING (bucket_id = 'carousel');

-- 3. Allow INSERT/UPLOAD access (allows files to be uploaded from the CMS pages)
DROP POLICY IF EXISTS "Public Insert Blogs" ON storage.objects;
CREATE POLICY "Public Insert Blogs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blogs');

DROP POLICY IF EXISTS "Public Insert Carousel" ON storage.objects;
CREATE POLICY "Public Insert Carousel" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'carousel');

-- 4. Allow UPDATE and DELETE access so you can edit and clean up files
DROP POLICY IF EXISTS "Public Update Blogs" ON storage.objects;
CREATE POLICY "Public Update Blogs" ON storage.objects
  FOR UPDATE USING (bucket_id = 'blogs');

DROP POLICY IF EXISTS "Public Delete Blogs" ON storage.objects;
CREATE POLICY "Public Delete Blogs" ON storage.objects
  FOR DELETE USING (bucket_id = 'blogs');

DROP POLICY IF EXISTS "Public Update Carousel" ON storage.objects;
CREATE POLICY "Public Update Carousel" ON storage.objects
  FOR UPDATE USING (bucket_id = 'carousel');

DROP POLICY IF EXISTS "Public Delete Carousel" ON storage.objects;
CREATE POLICY "Public Delete Carousel" ON storage.objects
  FOR DELETE USING (bucket_id = 'carousel');
