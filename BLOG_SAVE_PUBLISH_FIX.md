# Blog Save & Publish Fix - Türkçe Çözüm Kılavuzu

Bu doküman blog yazılarınızı kaydetme ve yayınlama sorunlarını çözmeye yönelik yapılan düzeltmeleri açıklar.

## 🔧 Yapılan Düzeltmeler

### 1. Database Politikaları Güncellendi
- Posts tablosu için RLS politikaları yeniden oluşturuldu
- Authenticated kullanıcılar için insert/update/delete izinleri düzeltildi
- User-specific data access kontrolü sağlandı

### 2. JavaScript Kodu Düzeltildi
- `create-post.js` dosyası tamamen yeniden yazıldı
- Supabase client referansları düzeltildi (`SupabaseConfig.client` → `supabaseClient`)
- Error handling geliştirildi
- Tag sistemi düzeltildi

### 3. Form Validasyonu Eklendi
- Post title zorunlu kontrol
- Minimum content uzunluğu (50 karakter)
- Image upload validasyonu
- Character counter limitler

### 4. Tag Sistemi Düzeltildi
- Tag input ID'leri HTML ile uyumlu hale getirildi
- Tag render fonksiyonu düzeltildi
- Database'de tag handling function eklendi

### 5. Loading States Eklendi
- Save/publish işlemleri sırasında loading overlay
- User feedback için toast notifications
- Auto-save functionality

## 🚀 Nasıl Test Edelim?

### 1. Sayfa Açın
```
http://localhost:8080/create-post.html
```

### 2. Login Olun
- Eğer login değilseniz otomatik olarak index.html'e yönlendirileceksiniz

### 3. Test Adımları
1. **Post Title** girin (zorunlu)
2. **Content** ekleyin (minimum 50 karakter)
3. İsteğe bağlı: Featured image upload edin
4. İsteğe bağlı: Tags ekleyin (Enter veya virgül ile)
5. **Save Draft** veya **Publish** butonuna tıklayın

### 4. Beklenen Sonuçlar
- ✅ Success toast gösterilmeli
- ✅ Post database'e kaydedilmeli
- ✅ Post sayfasına yönlendirilmeli
- ✅ Tags varsa post_tags tablosuna eklenmeli

## 🐛 Sorun Giderme

### 1. Console Errors Kontrol Edin
Browser Developer Tools > Console'da şu hataları arayın:
- Supabase authentication errors
- RLS policy violations
- JavaScript errors

### 2. Network Tab Kontrol Edin
- Supabase API istekleri başarısız mı?
- 401 Unauthorized errors var mı?
- Image upload istekleri başarılı mı?

### 3. Database'i Kontrol Edin
```sql
-- Posts tablosunu kontrol et
SELECT * FROM posts ORDER BY created_at DESC LIMIT 5;

-- User profile'ını kontrol et
SELECT * FROM profiles WHERE id = 'YOUR_USER_ID';

-- RLS politikalarını kontrol et
SELECT * FROM pg_policies WHERE tablename = 'posts';
```

### 4. Common Issues

#### Issue: "Failed to save post"
**Çözüm:**
1. Login olduğunuzdan emin olun
2. Profile tablosunda user record'ınız var mı kontrol edin
3. Console'da detaylı error mesajına bakın

#### Issue: Tags kaydedilmiyor
**Çözüm:**
1. Tag input'a Enter basın veya virgül kullanın
2. Tag list'te görünüyor mu kontrol edin
3. handle_post_tags function çalışıyor mu kontrol edin

#### Issue: Image upload başarısız
**Çözüm:**
1. File size 5MB'dan küçük mü?
2. Image format JPEG/PNG/WebP mi?
3. Storage bucket permissions doğru mu?

## 🔍 Debug Mode

Debug mode açmak için config.js'de:
```javascript
development: {
    enableConsoleLogging: true,
    // ...
}
```

Bu durumda console'da detaylı loglar göreceksiniz.

## 🎯 Hangi Dosyalar Değişti?

### Değişen Dosyalar:
- `scripts/create-post.js` - Tamamen yeniden yazıldı
- `styles/create-post.css` - Loading overlay stilleri eklendi
- `create-post.html` - Initialization düzeltmesi

### Database Migrations:
1. `fix_posts_permissions` - RLS politikaları düzeltildi
2. `fix_profile_creation_trigger` - Profile oluşturma trigger'ı
3. `fix_tag_system` - Tag handling functions
4. `debug_posts_permissions` - Permission test

## ✨ Yeni Özellikler

### 1. Auto-save Draft
- Her 2 saniyede bir localStorage'a otomatik kayıt
- Page refresh'te draft restore seçeneği

### 2. Character Counters
- Title: 100 karakter max
- Excerpt: 300 karakter max  
- Meta description: 160 karakter max
- Color coding (warning when approaching limit)

### 3. Better Error Messages
- Specific error messages için user-friendly text
- Console'da technical details

### 4. Image Upload Improvements
- Drag & drop support
- Preview functionality
- File validation
- Remove/change options

## 📋 Test Checklist

- [ ] Page açılıyor mu?
- [ ] Authentication çalışıyor mu?
- [ ] Form fields doldurulabiliyor mu?
- [ ] Save Draft çalışıyor mu?
- [ ] Publish çalışıyor mu?
- [ ] Tags eklenebiliyor mu?
- [ ] Image upload çalışıyor mu?
- [ ] Error handling uygun mu?
- [ ] Success message gösteriliyor mu?
- [ ] Post page'e redirect oluyor mu?

## 🆘 Hala Sorun Var İse

1. **Browser cache'i temizleyin**
2. **Hard refresh yapın** (Ctrl+F5)
3. **Private/incognito mode'da test edin**
4. **Console error'ları screenshot alın**
5. **Network tab'daki failed requests'leri kontrol edin**

Bu adımları takip ederek blog yazılarınızı başarıyla kaydedebilir ve yayınlayabilirsiniz! 🎉 