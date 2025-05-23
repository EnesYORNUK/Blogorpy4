# 🚀 EnsonBlog - Quick Start Guide

Bu rehber size EnsonBlog'u hızlıca kurmanız ve çalıştırmanız için gerekli adımları gösterir.

## ⚡ Hızlı Kurulum (5 Dakika)

### 1. Supabase Hesabı Oluşturun
1. [Supabase.com](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın
3. GitHub hesabınızla giriş yapın
4. "New project" oluşturun

### 2. Proje Ayarlarını Alın
1. Yeni oluşturduğunuz projeye gidin
2. Sol menüden "Settings" → "API" seçin
3. Aşağıdaki bilgileri kopyalayın:
   - **Project URL** (örn: `https://abc123.supabase.co`)
   - **Anon public key** (uzun bir string)

### 3. Konfigürasyonu Güncelleyin
`config.js` dosyasını açın ve kendi bilgilerinizi girin:

```javascript
const BLOG_CONFIG = {
    supabase: {
        url: 'https://abc123.supabase.co', // Buraya kendi URL'nizi yazın
        anonKey: 'eyJhbGciOiJIUzI1...' // Buraya kendi anahtarınızı yazın
    },
    // ... diğer ayarlar
};
```

### 4. Veritabanı Tablolarını Oluşturun
1. Supabase dashboard'da "SQL Editor" seçin
2. `supabase-setup.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'a yapıştırın ve "Run" butonuna basın

### 5. Uygulamayı Çalıştırın
- **Basit yöntem**: `index.html` dosyasını çift tıklayarak tarayıcıda açın
- **Önerilen yöntem**: Bir yerel sunucu kullanın:

```bash
# Python ile
python -m http.server 8000

# Node.js ile
npx serve .

# PHP ile
php -S localhost:8000
```

## 🎯 İlk Adımlar

### 1. Admin Hesabı Oluşturun
1. Ana sayfada "Sign Up" butonuna tıklayın
2. E-posta ve şifrenizi girin
3. E-posta doğrulamasını tamamlayın

### 2. İlk Blog Yazınızı Yazın
1. Giriş yaptıktan sonra "Write Post" butonuna tıklayın
2. Başlık ve içerik ekleyin
3. "Publish" butonuna basın

### 3. Ayarları Özelleştirin
`config.js` dosyasından aşağıdaki ayarları değiştirebilirsiniz:
- Site adı ve açıklaması
- Renk teması
- Özellik açma/kapama
- Sosyal medya linkleri

## 🛠️ Gelişmiş Ayarlar

### Dosya Yükleme İçin Storage Ayarı
```sql
-- Supabase SQL Editor'da çalıştırın
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true);
```

### E-posta Ayarları
1. Supabase Dashboard → Authentication → Settings
2. "SMTP Settings" bölümünü yapılandırın
3. E-posta şablonlarını özelleştirin

### Domain Ayarları
1. Supabase Dashboard → Authentication → Settings
2. "Site URL" kısmına domain'inizi girin
3. "Redirect URLs" listesine callback URL'lerinizi ekleyin

## 🎨 Özelleştirme

### Renk Temasını Değiştirme
`styles/main.css` dosyasında CSS değişkenlerini güncelleyin:

```css
:root {
    --primary-brown: #8B4513;    /* Ana renk */
    --dark-brown: #5D2F0A;       /* Koyu tonlar */
    --light-brown: #D2B48C;      /* Açık tonlar */
    --cream: #F5F5DC;            /* Arka plan */
}
```

### Logo Ekleme
1. Logo dosyanızı proje klasörüne ekleyin
2. `index.html` ve `post.html` dosyalarında logo kısmını güncelleyin

### Sosyal Medya Linkleri
`config.js` dosyasında sosyal medya linklerinizi ekleyin:

```javascript
social: {
    twitter: 'https://twitter.com/username',
    facebook: 'https://facebook.com/page',
    instagram: 'https://instagram.com/username',
    linkedin: 'https://linkedin.com/in/username'
}
```

## 🚀 Canlı Yayına Alma

### Netlify ile
1. [Netlify.com](https://netlify.com) hesabı oluşturun
2. GitHub repo'nuzu bağlayın
3. Deploy ayarları:
   - Build command: (boş bırakın)
   - Publish directory: `/`

### Vercel ile
1. [Vercel.com](https://vercel.com) hesabı oluşturun
2. GitHub repo'nuzu import edin
3. Varsayılan ayarlarla deploy edin

### GitHub Pages ile
1. Repository Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: `main` / `master`
4. Folder: `/ (root)`

## 🔧 Sorun Giderme

### Yaygın Hatalar

**1. "Supabase is not defined" hatası**
- CDN linklerinin doğru yüklendiğinden emin olun
- İnternet bağlantınızı kontrol edin

**2. Authentication çalışmıyor**
- Supabase URL ve key'in doğru olduğunu kontrol edin
- E-posta doğrulamasının açık olduğunu kontrol edin

**3. Görsel yükleme çalışmıyor**
- Storage bucket'ının oluşturulduğunu kontrol edin
- RLS politikalarının doğru ayarlandığını kontrol edin

**4. CSS yüklenmiyor**
- Dosya yollarını kontrol edin
- Yerel sunucu kullandığınızdan emin olun

### Destek

Sorunlarınız için:
1. `README.md` dosyasına bakın
2. Browser console'da hata mesajlarını kontrol edin
3. Supabase Dashboard'da logs'ları inceleyin

## 📊 Performans İpuçları

1. **Görselleri optimize edin**: WebP formatı kullanın
2. **CDN kullanın**: Statik dosyalar için
3. **Database indekslemesi**: Sık sorgulanan alanlar için
4. **Caching**: Browser ve CDN cache ayarları

## 🎉 Tebrikler!

EnsonBlog'unuz artık hazır! Güzel blog yazıları ve etkileşimli bir topluluk oluşturmaya başlayabilirsiniz.

### Sonraki Adımlar
- İlk blog yazınızı yayınlayın
- Sosyal medyada paylaşın
- SEO optimizasyonu yapın
- Google Analytics ekleyin (isteğe bağlı)

Keyifli blog yazımları! ✨ 