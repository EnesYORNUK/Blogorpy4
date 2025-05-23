# Supabase Setup Guide for EnsonBlog

This document provides a complete guide for setting up Supabase for the EnsonBlog project.

## 🚀 Project Overview

**EnsonBlog** is a modern blogging platform built with:
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Supabase (Authentication, Database, Storage)
- **Animations**: GSAP (GreenSock)
- **Design**: Brown color palette with modern UI/UX

## 📊 Project Credentials

**Supabase Project Details:**
- **Project ID**: `bczjcjnanweoslrsbbfp`
- **Project URL**: `https://bczjcjnanweoslrsbbfp.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjempjam5hbndlb3NscnNiYmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjI4MzAsImV4cCI6MjA2MzU5ODgzMH0.8gg3ck6xqpllatRy54_0Psyv2pv4oqf_-ZSm0Nsij40`
- **Region**: EU West 1
- **Status**: Active and Healthy

## 🗄️ Database Schema

### Tables Created

1. **profiles** - User profile information
   - Extends auth.users with additional fields
   - Fields: username, full_name, bio, avatar_url, banner_url, website, location, birth_date

2. **posts** - Blog post content and metadata
   - Fields: title, content, excerpt, featured_image, author_id, published, likes_count, comments_count, views_count, reading_time, slug, meta_title, meta_description

3. **comments** - Comment system with nesting support
   - Fields: post_id, author_id, content, parent_id, likes_count

4. **likes** - Post like relationships
   - Fields: post_id, user_id

5. **comment_likes** - Comment like relationships
   - Fields: comment_id, user_id

6. **saved_posts** - User bookmark functionality
   - Fields: post_id, user_id

7. **tags** - Tag categorization system
   - Fields: name, slug, description, color, posts_count

8. **post_tags** - Many-to-many tag relationships
   - Fields: post_id, tag_id

9. **followers** - User following system
   - Fields: follower_id, following_id

10. **notifications** - User notification system
    - Fields: user_id, type, title, message, data, read

### Views Created

1. **posts_with_author** - Posts joined with author profile information
2. **comments_with_author** - Comments joined with author profile information

### Functions Created

1. **generate_excerpt(content, max_length)** - Auto-generate post excerpts
2. **generate_post_slug(post_title, post_id)** - Generate unique post slugs
3. **generate_tag_slug(tag_name)** - Generate tag slugs
4. **get_post_with_tags(post_id)** - Get post with associated tags
5. **update_updated_at_column()** - Auto-update timestamp trigger function
6. **update_post_comment_count()** - Auto-update comment counts
7. **update_post_like_count()** - Auto-update like counts
8. **update_comment_like_count()** - Auto-update comment like counts
9. **update_tag_post_count()** - Auto-update tag post counts

### Storage Buckets

1. **images** - General image uploads (public)
2. **avatars** - User avatar images (public)
3. **banners** - User banner images (public)
4. **documents** - Document uploads (private)

## 🔒 Row Level Security (RLS) Policies

### Profiles
- ✅ Public profiles viewable by everyone
- ✅ Users can insert their own profile
- ✅ Users can update their own profile

### Posts
- ✅ Published posts viewable by everyone
- ✅ Authors can view their own unpublished posts
- ✅ Users can insert their own posts
- ✅ Users can update their own posts
- ✅ Users can delete their own posts

### Comments
- ✅ Comments viewable by everyone
- ✅ Authenticated users can insert comments
- ✅ Users can update their own comments
- ✅ Users can delete their own comments

### Likes & Saved Posts
- ✅ Likes viewable by everyone
- ✅ Users can manage their own likes
- ✅ Users can manage their own saved posts

### Tags & Post Tags
- ✅ Tags viewable by everyone
- ✅ Authenticated users can create tags
- ✅ Post authors can manage their post tags

### Followers & Notifications
- ✅ Users can view all follower relationships
- ✅ Users can manage their own following relationships
- ✅ Users can view and update their own notifications

### Storage Policies
- ✅ Public buckets (images, avatars, banners) accessible to everyone
- ✅ Authenticated users can upload files
- ✅ Users can manage their own files

## 📝 Sample Data

### Tags Created
- Technology (#007ACC)
- Lifestyle (#FF6B6B)
- Travel (#4ECDC4)
- Food (#FFE66D)
- Health (#95E1D3)
- Business (#A8E6CF)
- Education (#C7CEEA)
- Entertainment (#FFB3BA)

## 🔧 Configuration Files Updated

### config.js
Updated with new Supabase credentials:
```javascript
supabase: {
    url: 'https://bczjcjnanweoslrsbbfp.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjempjam5hbndlb3NscnNiYmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjI4MzAsImV4cCI6MjA2MzU5ODgzMH0.8gg3ck6xqpllatRy54_0Psyv2pv4oqf_-ZSm0Nsij40',
    buckets: {
        images: 'images',
        avatars: 'avatars',
        banners: 'banners',
        documents: 'documents'
    }
}
```

### scripts/supabase-config.js
Already configured to use BLOG_CONFIG, automatically picks up new credentials.

## 📁 TypeScript Types

Generated TypeScript types are available in `types/database.ts` for type-safe development.

## 🚀 Features Implemented

### Core Features
- ✅ User Authentication (registration, login, password reset)
- ✅ User Profiles (with avatars, banners, bio)
- ✅ Blog Post Management (CRUD operations)
- ✅ Rich Text Editor for post creation
- ✅ Image Upload to Supabase Storage
- ✅ Comment System (with nesting support)
- ✅ Like System (posts and comments)
- ✅ Save Posts functionality
- ✅ Tag System for categorization
- ✅ Search and Filter functionality
- ✅ Real-time Updates via Supabase subscriptions

### Advanced Features
- ✅ User Following System
- ✅ Notification System
- ✅ Post Views Tracking
- ✅ Reading Time Calculation
- ✅ SEO-friendly URLs (slugs)
- ✅ Auto-generated Excerpts
- ✅ Responsive Design
- ✅ GSAP Animations

## 🔄 Real-time Features

The application uses Supabase real-time subscriptions for:
- Live comment updates
- Live like count updates
- Real-time notifications
- Live user activity

## 📱 File Upload System

### Supported File Types
- **Images**: JPEG, PNG, WebP (max 5MB)
- **Avatars**: Optimized for profile pictures
- **Banners**: Optimized for profile banners

### Upload Paths
- User files organized by user ID: `{bucket}/{user_id}/{filename}`
- Automatic file optimization and compression

## 🛡️ Security Features

### Authentication
- Email/password authentication
- Email verification required
- Secure password hashing via Supabase Auth

### Data Protection
- Row Level Security on all tables
- User-specific data access controls
- Input sanitization and validation
- File upload restrictions

### API Security
- Rate limiting via Supabase
- CORS protection
- SQL injection prevention
- XSS protection

## 📊 Performance Optimizations

### Database
- Proper indexing on frequently queried columns
- Optimized views for complex queries
- Efficient pagination support
- Connection pooling via Supabase

### Frontend
- Lazy loading for images
- Debounced search queries
- Efficient pagination
- Optimized GSAP animations

## 🚀 Deployment Ready

The project is fully configured and ready for deployment with:
- Production-ready Supabase setup
- Comprehensive error handling
- User-friendly feedback systems
- Mobile-responsive design
- SEO optimization

## 📞 Support

For any issues or questions regarding the Supabase setup:
1. Check the Supabase dashboard for project status
2. Review the migration logs for any errors
3. Verify RLS policies are correctly applied
4. Test authentication and database operations

## 🎯 Next Steps

1. **Test the Application**: Register a new user and test all features
2. **Create Content**: Add some blog posts to populate the database
3. **Customize**: Modify the design and features as needed
4. **Deploy**: Deploy to your preferred hosting platform
5. **Monitor**: Set up monitoring and analytics

---

**Project Status**: ✅ Complete and Ready for Use
**Last Updated**: January 2025
**Supabase Version**: Latest
**Database Schema Version**: 1.0 