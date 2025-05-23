# Supabase Database Setup

Blog uygulaması için gerekli veritabanı tablolarını ve storage yapılandırmasını kurmak için bu dosyaları kullanın.

## Kurulum Adımları

### 1. Database Migration
Supabase Dashboard'ınızda SQL Editor'e gidin ve aşağıdaki dosyayı çalıştırın:

```sql
-- create_posts_table.sql dosyasının içeriğini kopyalayıp çalıştırın
```

Bu migration şunları oluşturacak:
- ✅ `posts` tablosu (blog yazıları)
- ✅ `post_likes` tablosu (beğeniler)
- ✅ `post_views` tablosu (görüntülenmeler)
- ✅ `saved_posts` tablosu (kayıtlı yazılar)
- ✅ `comments` tablosu (yorumlar)
- ✅ RLS (Row Level Security) politikaları
- ✅ Otomatik trigger'lar ve indexler
- ✅ Helper function'lar

### 2. Storage Setup
Storage bucket'ı oluşturmak için `storage_setup.sql` dosyasını çalıştırın:

```sql
-- storage_setup.sql dosyasının içeriğini kopyalayıp çalıştırın
```

Bu setup şunları yapacak:
- ✅ `images` bucket'ını oluşturacak
- ✅ Image upload politikalarını ayarlayacak
- ✅ Dosya boyutu limitini ayarlayacak (10MB)
- ✅ İzin verilen dosya tiplerini ayarlayacak
- ✅ Eski resim dosyalarını temizleme function'ı

### 3. Alternatif Kurulum (Supabase CLI)

Eğer Supabase CLI kullanıyorsanız:

```bash
# Migration dosyasını çalıştır
supabase db reset
supabase migration new create_posts_system
# create_posts_table.sql içeriğini migration dosyasına kopyala
supabase db push

# Storage setup için ayrı migration
supabase migration new setup_storage
# storage_setup.sql içeriğini migration dosyasına kopyala
supabase db push
```

## Database Schema

### Posts Tablosu
```sql
posts (
    id: UUID (primary key)
    title: VARCHAR(255) NOT NULL
    content: TEXT NOT NULL
    excerpt: TEXT
    featured_image: TEXT
    category: VARCHAR(100)
    tags: TEXT[] (array)
    meta_description: VARCHAR(160)
    slug: VARCHAR(255) UNIQUE NOT NULL
    published: BOOLEAN DEFAULT FALSE
    comments_enabled: BOOLEAN DEFAULT TRUE
    view_count: INTEGER DEFAULT 0
    like_count: INTEGER DEFAULT 0
    author_id: UUID (foreign key -> auth.users)
    created_at: TIMESTAMPTZ DEFAULT NOW()
    updated_at: TIMESTAMPTZ DEFAULT NOW()
)
```

### İlişkili Tablolar
- **post_likes**: Kullanıcı beğenilerini takip eder
- **post_views**: Post görüntülenmelerini sayar
- **saved_posts**: Kullanıcıların kaydettiği yazıları tutar
- **comments**: Post yorumlarını saklar (nested comments destekli)

## Security (RLS Policies)

### Posts
- ✅ Herkes yayınlanmış yazıları görebilir
- ✅ Kullanıcılar sadece kendi yazılarını görebilir/düzenleyebilir
- ✅ Kimlik doğrulama gerektiren işlemler

### Storage
- ✅ Herkes resimleri görüntüleyebilir
- ✅ Sadece kimlik doğrulanmış kullanıcılar upload edebilir
- ✅ Kullanıcılar sadece kendi resimlerini yönetebilir

## Helper Functions

### get_user_posts(user_uuid)
Kullanıcının tüm yazılarını istatistiklerle birlikte getirir.

### get_user_saved_posts(user_uuid) 
Kullanıcının kaydettiği yazıları getirir.

### get_user_liked_posts(user_uuid)
Kullanıcının beğendiği yazıları getirir.

## Automatic Features

### Triggers
- ✅ `updated_at` alanı otomatik güncellenir
- ✅ Like/view sayıları otomatik hesaplanır
- ✅ Eski resim dosyaları otomatik silinir

### Indexer
- ✅ Performance için kritik alanlarda indexler
- ✅ Tag aramaları için GIN index
- ✅ Slug ve kategori için B-tree indexler

## Storage Configuration

### Bucket: `images`
- **Public**: Evet
- **File Size Limit**: 10MB
- **Allowed Types**: JPEG, JPG, PNG, WebP, GIF
- **Path Structure**: `{user_id}/{timestamp}.{extension}`

## Test Etme

Kurulumdan sonra test etmek için:

1. Bir hesap oluşturun
2. `/create-post.html` sayfasına gidin
3. Yeni bir post oluşturmayı deneyin
4. Resim upload'u test edin
5. Draft/Publish fonksiyonlarını test edin

## Sorun Giderme

### Yaygın Hatalar

**"relation does not exist"**
- Migration'ın tam olarak çalıştırıldığından emin olun

**"permission denied for table"**
- RLS policy'lerinin doğru kurulduğunu kontrol edin

**"bucket does not exist"**
- Storage setup'ın çalıştırıldığından emin olun

**"file upload failed"**
- Storage policy'lerini ve bucket konfigürasyonunu kontrol edin

## Support

Bu setup ile ilgili herhangi bir sorun yaşarsanız:

1. Supabase Dashboard'da Table Editor'de tabloları kontrol edin
2. SQL Editor'de policy'leri kontrol edin
3. Storage'da bucket'ın oluştuğunu ve policy'lerin aktif olduğunu kontrol edin
4. Browser console'da hata mesajlarını kontrol edin 