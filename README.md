# EnsonBlog - Modern Blogging Platform

A feature-rich, modern blogging platform built with HTML, CSS, JavaScript, and Supabase. Features a beautiful brown color palette, smooth GSAP animations, and comprehensive user management.

## 🚀 Features

### Core Features
- **User Authentication**: Secure registration/login with email verification
- **Blog Management**: Create, read, update, delete posts with rich text editor
- **Interactive Features**: Comments, likes, save posts, real-time updates
- **Search & Filter**: Advanced search with sorting and pagination
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Minimalist design with smooth GSAP animations

### Technical Features
- **Real-time Updates**: Live comments and likes using Supabase subscriptions
- **Image Upload**: File upload to Supabase Storage with optimization
- **Toast Notifications**: User-friendly feedback system
- **Loading States**: Skeleton screens and spinners for better UX
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **SEO Optimized**: Meta tags and semantic HTML structure

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Supabase (Authentication, Database, Storage)
- **Animations**: GSAP (GreenSock)
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

## 📋 Prerequisites

- A modern web browser
- A Supabase account (free tier available)
- Basic knowledge of web development

## 🎯 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ensonblog
```

### 2. Set Up Supabase

1. **Create a Supabase Project**
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Configure the Application**
   - Open `scripts/supabase-config.js`
   - Replace placeholder values:
   ```javascript
   const SUPABASE_URL = 'https://your-project-url.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

3. **Set Up Database Tables**
   Run the following SQL commands in Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create posts table
CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    published BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create comments table
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create likes table
CREATE TABLE likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Create saved_posts table
CREATE TABLE saved_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Create tags table
CREATE TABLE tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create post_tags junction table
CREATE TABLE post_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);
```

4. **Set Up Row Level Security (RLS) Policies**

```sql
-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Published posts are viewable by everyone" ON posts
    FOR SELECT USING (published = true OR auth.uid() = author_id);

CREATE POLICY "Users can insert their own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (auth.uid() = author_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON likes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their likes" ON likes
    FOR ALL USING (auth.uid() = user_id);

-- Saved posts policies
CREATE POLICY "Users can view their saved posts" ON saved_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their saved posts" ON saved_posts
    FOR ALL USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Tags are viewable by everyone" ON tags
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tags" ON tags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Post tags policies
CREATE POLICY "Post tags are viewable by everyone" ON post_tags
    FOR SELECT USING (true);

CREATE POLICY "Authors can manage their post tags" ON post_tags
    FOR ALL USING (EXISTS (
        SELECT 1 FROM posts WHERE posts.id = post_tags.post_id AND posts.author_id = auth.uid()
    ));
```

5. **Set Up Storage**

```sql
-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Set up storage policies
CREATE POLICY "Images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images" ON storage.objects
    FOR DELETE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

6. **Set Up Functions and Triggers**

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update post counts
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'comments' THEN
            UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_TABLE_NAME = 'likes' THEN
            UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'comments' THEN
            UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
        ELSIF TG_TABLE_NAME = 'likes' THEN
            UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers for post counts
CREATE TRIGGER update_comments_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE PROCEDURE update_post_counts();

CREATE TRIGGER update_likes_count
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE PROCEDURE update_post_counts();
```

### 3. Deploy the Application

#### Option 1: Local Development
1. Open `index.html` in a modern web browser
2. Use a local server for best results:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

#### Option 2: Deploy to Netlify
1. Connect your repository to Netlify
2. Set build command: (none needed)
3. Set publish directory: `/`
4. Deploy

#### Option 3: Deploy to Vercel
1. Connect your repository to Vercel
2. Deploy with default settings

## 📁 Project Structure

```
ensonblog/
├── index.html              # Main homepage
├── post.html               # Individual post page
├── styles/
│   ├── main.css           # Main application styles
│   └── post.css           # Post-specific styles
├── scripts/
│   ├── supabase-config.js # Supabase configuration
│   ├── auth.js            # Authentication management
│   ├── blog.js            # Blog post management
│   ├── main.js            # Main application logic
│   └── post.js            # Individual post logic
└── README.md              # This file
```

## 🎨 Color Palette

The application uses a sophisticated brown color scheme:

- **Primary Brown**: `#8B4513` - Main brand color
- **Dark Brown**: `#5D2F0A` - Headers and emphasis
- **Light Brown**: `#D2B48C` - Borders and subtle elements
- **Cream**: `#F5F5DC` - Background and light text
- **White**: `#FFFFFF` - Content backgrounds
- **Gray Scale**: Various shades for text and UI elements

## 🔧 Configuration

### Authentication Settings
- Email confirmation: Enabled by default
- Password requirements: Minimum 6 characters
- Social authentication: Can be configured in Supabase

### Content Settings
- Post excerpt length: 150 characters
- Pagination: 10 posts per page
- Image upload: Max 5MB per file
- Supported formats: JPG, PNG, WebP

## 📱 Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 🔒 Security Features

- Row Level Security (RLS) policies
- XSS protection through content sanitization
- CSRF protection via Supabase
- Secure file upload with validation
- Input validation and sanitization

## 🚀 Performance Features

- Lazy loading for images
- Debounced search queries
- Optimized database queries
- Compressed images
- Minimal JavaScript bundle

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify Supabase configuration
3. Ensure all database tables are created
4. Check RLS policies are properly set

## 🔄 Updates

The application automatically updates in real-time using Supabase subscriptions. No manual refresh needed for new posts, comments, or likes.

---

Built with ❤️ using modern web technologies 