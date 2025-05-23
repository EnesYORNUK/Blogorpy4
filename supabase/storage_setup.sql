-- ================================================
-- STORAGE SETUP FOR BLOG IMAGES
-- ================================================

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- STORAGE POLICIES
-- ================================================

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Anyone can view images (since bucket is public)
CREATE POLICY "Anyone can view images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

-- Authenticated users can upload images
CREATE POLICY "Authenticated users can upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own images
CREATE POLICY "Users can update their own images" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own images
CREATE POLICY "Users can delete their own images" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ================================================
-- STORAGE HELPER FUNCTIONS
-- ================================================

-- Function to get image URL
CREATE OR REPLACE FUNCTION get_image_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN CONCAT(
        (SELECT url FROM storage.buckets WHERE id = bucket_name),
        '/',
        file_path
    );
END;
$$ LANGUAGE plpgsql;

-- Function to delete old images when post is updated
CREATE OR REPLACE FUNCTION cleanup_old_images()
RETURNS TRIGGER AS $$
BEGIN
    -- If featured image is changed, delete the old one
    IF OLD.featured_image IS NOT NULL 
       AND NEW.featured_image IS DISTINCT FROM OLD.featured_image THEN
        
        -- Extract file path from URL
        DECLARE
            old_path TEXT;
        BEGIN
            old_path := REPLACE(OLD.featured_image, 
                CONCAT((SELECT url FROM storage.buckets WHERE id = 'images'), '/'), 
                ''
            );
            
            -- Delete the old file
            DELETE FROM storage.objects 
            WHERE bucket_id = 'images' 
            AND name = old_path;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to cleanup old images
CREATE TRIGGER cleanup_old_featured_images
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_old_images();

-- ================================================
-- BUCKET CONFIGURATION
-- ================================================

-- Set file size limit (10MB)
UPDATE storage.buckets 
SET file_size_limit = 10485760 
WHERE id = 'images';

-- Set allowed MIME types
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
] 
WHERE id = 'images'; 