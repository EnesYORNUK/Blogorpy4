-- ================================================
-- BLOG POSTS MIGRATION
-- ================================================

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    category VARCHAR(100),
    tags TEXT[], -- Array of tags
    meta_description VARCHAR(160),
    slug VARCHAR(255) UNIQUE NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    comments_enabled BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

-- Create post_likes table for tracking likes
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Create post_views table for tracking views
CREATE TABLE IF NOT EXISTS post_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create saved_posts table for bookmarking
CREATE TABLE IF NOT EXISTS saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Anyone can view published posts" 
ON posts FOR SELECT 
USING (published = true);

CREATE POLICY "Users can view their own posts" 
ON posts FOR SELECT 
USING (auth.uid() = author_id);

CREATE POLICY "Users can create posts" 
ON posts FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" 
ON posts FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" 
ON posts FOR DELETE 
USING (auth.uid() = author_id);

-- Post likes policies
CREATE POLICY "Anyone can view likes" 
ON post_likes FOR SELECT 
USING (true);

CREATE POLICY "Users can like posts" 
ON post_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" 
ON post_likes FOR DELETE 
USING (auth.uid() = user_id);

-- Post views policies
CREATE POLICY "Anyone can create views" 
ON post_views FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own views" 
ON post_views FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Saved posts policies
CREATE POLICY "Users can view their own saved posts" 
ON saved_posts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" 
ON saved_posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their own saved posts" 
ON saved_posts FOR DELETE 
USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments on published posts" 
ON comments FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM posts 
        WHERE posts.id = comments.post_id 
        AND posts.published = true
    )
);

CREATE POLICY "Users can view comments on their own posts" 
ON comments FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM posts 
        WHERE posts.id = comments.post_id 
        AND posts.author_id = auth.uid()
    )
);

CREATE POLICY "Users can create comments" 
ON comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON comments FOR DELETE 
USING (auth.uid() = user_id);

-- ================================================
-- FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for posts table
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for comments table
CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update post statistics
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'post_likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
            RETURN OLD;
        END IF;
    ELSIF TG_TABLE_NAME = 'post_views' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE posts SET view_count = view_count + 1 WHERE id = NEW.post_id;
            RETURN NEW;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers for updating post statistics
CREATE TRIGGER trigger_update_like_count 
    AFTER INSERT OR DELETE ON post_likes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_post_stats();

CREATE TRIGGER trigger_update_view_count 
    AFTER INSERT ON post_views 
    FOR EACH ROW 
    EXECUTE FUNCTION update_post_stats();

-- ================================================
-- HELPER FUNCTIONS
-- ================================================

-- Function to get user's posts with statistics
CREATE OR REPLACE FUNCTION get_user_posts(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    excerpt TEXT,
    featured_image TEXT,
    category VARCHAR,
    tags TEXT[],
    published BOOLEAN,
    view_count INTEGER,
    like_count INTEGER,
    comments_count BIGINT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.excerpt,
        p.featured_image,
        p.category,
        p.tags,
        p.published,
        p.view_count,
        p.like_count,
        COALESCE(c.comments_count, 0) as comments_count,
        p.created_at,
        p.updated_at
    FROM posts p
    LEFT JOIN (
        SELECT post_id, COUNT(*) as comments_count
        FROM comments
        GROUP BY post_id
    ) c ON p.id = c.post_id
    WHERE p.author_id = user_uuid
    ORDER BY p.created_at DESC;
END;
$$ language 'plpgsql';

-- Function to get user's saved posts
CREATE OR REPLACE FUNCTION get_user_saved_posts(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    excerpt TEXT,
    featured_image TEXT,
    category VARCHAR,
    author_name VARCHAR,
    created_at TIMESTAMPTZ,
    saved_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.excerpt,
        p.featured_image,
        p.category,
        COALESCE(u.full_name, u.email) as author_name,
        p.created_at,
        sp.created_at as saved_at
    FROM saved_posts sp
    JOIN posts p ON sp.post_id = p.id
    JOIN auth.users u ON p.author_id = u.id
    WHERE sp.user_id = user_uuid
    AND p.published = true
    ORDER BY sp.created_at DESC;
END;
$$ language 'plpgsql';

-- Function to get user's liked posts
CREATE OR REPLACE FUNCTION get_user_liked_posts(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    excerpt TEXT,
    featured_image TEXT,
    category VARCHAR,
    author_name VARCHAR,
    created_at TIMESTAMPTZ,
    liked_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.excerpt,
        p.featured_image,
        p.category,
        COALESCE(u.full_name, u.email) as author_name,
        p.created_at,
        pl.created_at as liked_at
    FROM post_likes pl
    JOIN posts p ON pl.post_id = p.id
    JOIN auth.users u ON p.author_id = u.id
    WHERE pl.user_id = user_uuid
    AND p.published = true
    ORDER BY pl.created_at DESC;
END;
$$ language 'plpgsql';

-- ================================================
-- STORAGE BUCKETS
-- ================================================

-- Create storage bucket for images (this should be run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Storage policies for images bucket
-- CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
-- CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Users can update their own images" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete their own images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]); 