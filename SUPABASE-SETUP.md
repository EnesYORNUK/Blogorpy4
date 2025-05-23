# 🚀 Blogorpy - Supabase Kurulum Rehberi

Bu rehber, Blogorpy blog platformunun Supabase ile nasıl kurulacağını adım adım açıklar.

## 📋 Gereksinimler

- Supabase hesabı (ücretsiz)
- Modern web tarayıcısı
- Text editör
- Git (opsiyonel)

## 🔧 Kurulum Adımları

### 1. Supabase Projesi Oluşturma

1. [supabase.com](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın
3. GitHub hesabınızla giriş yapın
4. "New Project" butonuna tıklayın
5. Proje bilgilerini doldurun:
   - **Name**: Blogorpy (veya istediğiniz isim)
   - **Database Password**: Güçlü bir şifre seçin
   - **Region**: Size en yakın bölgeyi seçin
6. "Create new project" butonuna tıklayın
7. Proje oluşturulana kadar bekleyin (2-3 dakika)

### 2. Veritabanı Şemasını Oluşturma

1. Supabase Dashboard'da sol menüden **SQL Editor** seçin
2. `supabase-setup.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'e yapıştırın
4. **RUN** butonuna tıklayın
5. İşlem başarılı olduysa "Success" mesajı göreceksiniz

### 3. Storage (Dosya Depolama) Kurulumu

1. Sol menüden **Storage** seçin
2. **Create bucket** butonuna tıklayın
3. Aşağıdaki bucket'ları oluşturun:

#### Images Bucket:
- **Name**: `images`
- **Public bucket**: ✅ İşaretli
- **File size limit**: 5MB
- **Allowed MIME types**: `image/*`

#### Avatars Bucket:
- **Name**: `avatars`  
- **Public bucket**: ✅ İşaretli
- **File size limit**: 2MB
- **Allowed MIME types**: `image/*`

### 4. Authentication Ayarları

1. Sol menüden **Authentication** > **Settings** seçin
2. **Site URL** bölümüne sitenizin adresini girin:
   - Localhost için: `http://localhost:3000` veya `http://127.0.0.1:5500`
   - Canlı site için: `https://yourdomain.com`
3. **Redirect URLs** bölümüne aynı adresi ekleyin
4. **Email Templates** bölümünden e-posta şablonlarını özelleştirebilirsiniz

### 5. Proje Bilgilerini Alma

1. Sol menüden **Settings** > **API** seçin
2. Aşağıdaki bilgileri kaydedin:
   - **Project URL**
   - **anon/public key**

### 6. Konfigürasyon Dosyasını Güncelleme

`config.js` dosyasını açın ve aşağıdaki değerleri güncelleyin:

```javascript
const BLOG_CONFIG = {
    // ... diğer ayarlar
    
    supabase: {
        url: 'BURAYA_PROJECT_URL_YAZIN',
        anonKey: 'BURAYA_ANON_KEY_YAZIN',
        
        buckets: {
            images: 'images',
            avatars: 'avatars',
            documents: 'documents'
        }
    },
    
    // ... diğer ayarlar
};
```

**Örnek:**
```javascript
supabase: {
    url: 'https://abc123def456.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    // ...
}
```

### 7. Row Level Security (RLS) Politikalarını Kontrol Etme

1. Sol menüden **Authentication** > **Policies** seçin
2. Tüm tabloların politikalarının aktif olduğunu kontrol edin
3. SQL Editor'de aşağıdaki sorguyu çalıştırarak kontrol edebilirsiniz:

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## 🧪 Test Etme

### 1. Kullanıcı Kaydı Testi
1. Sitenizi açın
2. "Register" butonuna tıklayın
3. E-posta ve şifre ile kayıt olun
4. E-posta onayını kontrol edin

### 2. Post Oluşturma Testi
1. Giriş yapın
2. "New Post" butonuna tıklayın
3. Başlık ve içerik yazın
4. "Publish" butonuna tıklayın

### 3. Veritabanı Kontrol
1. Supabase Dashboard'da **Table Editor** seçin
2. `profiles`, `posts` tablolarında verilerinizi görün

## 🔐 Güvenlik Kontrolleri

### RLS Politikaları
- ✅ Tüm tablolarda RLS aktif
- ✅ Kullanıcılar sadece kendi verilerini düzenleyebilir
- ✅ Herkese açık içerikler okunabilir

### API Keys
- ✅ `anon key` frontend'de kullanılır
- ❌ `service_role key` asla frontend'de kullanmayın
- ✅ URL'ler doğru şekilde yapılandırıldı

## 📊 Veritabanı Şeması

### Ana Tablolar
- **profiles**: Kullanıcı profilleri (auth.users'ı genişletir)
- **posts**: Blog yazıları
- **comments**: Yorumlar  
- **likes**: Beğeniler
- **saved_posts**: Kayıtlı yazılar
- **tags**: Etiketler
- **post_tags**: Yazı-etiket ilişkileri

### Önemli İndeksler
- `posts.author_id`, `posts.created_at`
- `comments.post_id`, `comments.author_id`
- `likes.post_id`, `likes.user_id`

## 🛠️ Sorun Giderme

### Yaygın Hatalar

#### 1. "Invalid API key" hatası
- `config.js` dosyasındaki Supabase bilgilerini kontrol edin
- Project URL ve anon key doğru kopyalandığından emin olun

#### 2. "Row Level Security violation" hatası
- RLS politikalarının doğru kurulduğunu kontrol edin
- `supabase-setup.sql` dosyasını tekrar çalıştırın

#### 3. E-posta gönderimi çalışmıyor
- Supabase Dashboard > Authentication > Settings > SMTP ayarlarını kontrol edin
- Site URL'nin doğru olduğundan emin olun

#### 4. Resim yükleme çalışmıyor
- Storage bucket'larının public olarak ayarlandığını kontrol edin
- Bucket isimleri config.js ile eşleşmeli

### Debug Araçları

Tarayıcı konsolunda hata mesajlarını kontrol etmek için:
```javascript
// Supabase bağlantısını test etme
console.log('Supabase client:', supabaseClient);

// Kullanıcı durumunu kontrol etme
supabaseClient.auth.getUser().then(console.log);

// Veritabanı bağlantısını test etme
supabaseClient.from('posts').select('count', { count: 'exact' }).then(console.log);
```

## 📱 Deployment (Canlı Yayın)

### Netlify ile Deployment
1. GitHub'a kodu yükleyin
2. Netlify hesabı oluşturun
3. Repository'yi bağlayın
4. Build settings:
   - Build command: (boş bırakın)
   - Publish directory: `./`

### Vercel ile Deployment
1. GitHub'a kodu yükleyin
2. Vercel hesabı oluşturun
3. "Import Project" seçin
4. Framework: "Other"

### Domain Ayarları
Canlı siteye çıktıktan sonra:
1. Supabase Dashboard > Authentication > Settings
2. Site URL ve Redirect URLs'e gerçek domain adresinizi ekleyin

## 🔄 Güncelleme ve Bakım

### Düzenli Bakım
- Veritabanı yedeklerini alın
- Supabase Dashboard'daki Usage limitlerini kontrol edin
- Güvenlik güncellemelerini takip edin

### Yeni Özellik Ekleme
1. Önce test ortamında deneyin
2. Veritabanı değişiklikleri için migration scriptleri oluşturun
3. Backup aldıktan sonra canlı ortama uygulayın

## 📚 Faydalı Linkler

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

## 💬 Destek

Herhangi bir sorun yaşıyorsanız:
1. Bu dokümandaki sorun giderme bölümünü kontrol edin
2. Supabase dokümanlarına bakın
3. GitHub Issues'da soru sorun

---

**🎉 Tebrikler!** Blogorpy siteniz artık hazır. Yazılarınızı paylaşmaya başlayabilirsiniz! 