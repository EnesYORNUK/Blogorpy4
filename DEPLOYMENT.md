# Netlify Deployment Guide

## 🚀 Quick Deploy

1. **Git Repository'yi bağla**
   - Netlify Dashboard'a git
   - "New site from Git" seç
   - GitHub/GitLab/Bitbucket hesabını bağla
   - Repo'yu seç

2. **Build Settings**
   ```
   Build command: echo 'No build needed for static site'
   Publish directory: .
   ```

3. **Environment Variables** (Gerekirse)
   - Site Settings > Environment variables
   - `NETLIFY_DEPLOY` = `true` ekle

## 🔧 Netlify Konfigürasyon Dosyaları

Proje şu dosyaları içerir:
- `netlify.toml` - Build ve header ayarları
- `_redirects` - SPA routing için yönlendirmeler

## 🏥 Supabase Ayarları

### 1. Domain Yetkilendirmesi
Supabase Dashboard'da:
1. Authentication > URL Configuration
2. Site URL: `https://your-site-name.netlify.app`
3. Additional redirect URLs'e ekle:
   ```
   https://your-site-name.netlify.app
   https://your-site-name.netlify.app/**
   ```

### 2. CORS Ayarları
Supabase automatically handles CORS for whitelisted domains.

## 🐛 Sorun Giderme

### Problem: Site yükleniyor ama JavaScript çalışmıyor

**Çözüm:**
1. Browser console'u aç (F12)
2. Network tab'inde failed requests kontrol et
3. `NetlifyDebug.showLogs()` komutu çalıştır

### Problem: Supabase bağlanamıyor

**Debug Adımları:**
```javascript
// Console'da çalıştır:
NetlifyDebug.testSupabaseConnection()
NetlifyDebug.checkResources()
```

**Yaygın Nedenler:**
- CDN blocked: Supabase CDN'i engelleniyor
- Domain not whitelisted: Netlify domain Supabase'de tanımlı değil
- Network issues: Geçici ağ sorunu

### Problem: Authentication çalışmıyor

**Kontrol Listesi:**
- [ ] Netlify domain Supabase'de tanımlı mı?
- [ ] HTTPS kullanılıyor mu?
- [ ] Browser'da 3rd party cookies enabled mi?
- [ ] Local storage çalışıyor mu?

## 📊 Performance Optimizasyonu

### 1. Script Loading
Scripts şu sırayla yükleniyor:
```html
<script src="scripts/config.js"></script>
<script src="https://unpkg.com/@supabase/supabase-js@2.49.8/dist/umd/supabase.js"></script>
<script src="scripts/debug.js"></script>
<script src="scripts/supabase.js"></script>
```

### 2. Caching
`netlify.toml` static assets için caching yapılandırıldı:
- CSS/JS files: 1 year cache
- HTML files: No cache (for updates)

## 🔍 Debug Modes

### Development Debug
Local'de otomatik olarak aktif.

### Production Debug
URL'ye `?debug=true` ekle:
```
https://your-site.netlify.app?debug=true
```

### Persistent Debug
Console'da:
```javascript
localStorage.setItem('debug-mode', 'true')
```

## 📱 Mobile Testing

Netlify'de deploy sonrası:
1. Mobile browser'da test et
2. PWA uyumluluğunu kontrol et
3. Touch events'i test et

## 🚨 Common Errors

### 404 on Page Refresh
- **Cause:** SPA routing
- **Fix:** `_redirects` dosyası mevcut

### Mixed Content Errors
- **Cause:** HTTP resources on HTTPS site
- **Fix:** All resources should use HTTPS

### Slow Initial Load
- **Cause:** CDN or large assets
- **Fix:** Use performance monitoring tools

## 📈 Monitoring

### Built-in Debug Tools
```javascript
// Check current status
NetlifyDebug.init()

// View logs
NetlifyDebug.showLogs()

// Test Supabase
NetlifyDebug.testSupabaseConnection()
```

### External Monitoring
Consider adding:
- Google Analytics
- Sentry for error tracking
- Performance monitoring tools

## 🔐 Security

### Headers
Security headers configured in `netlify.toml`:
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff

### Environment Variables
Never commit:
- API keys
- Database passwords
- Secret tokens

Store in Netlify Environment Variables instead.

## ⚡ Quick Fixes

### Force Redeploy
```bash
# Trigger redeploy without changes
git commit --allow-empty -m "Force redeploy"
git push
```

### Clear Build Cache
Netlify dashboard > Site settings > Build & deploy > Clear cache

### Debug Command
URL'ye `?debug=true&verbose=true` ekleyerek tüm debug bilgilerini göster.

---

## 📞 Support

If issues persist:
1. Check browser console logs
2. Run debug commands
3. Check Netlify function logs
4. Verify Supabase settings
5. Test with different browsers

**Emergency Debug URL:**
`https://your-site.netlify.app?debug=true&verbose=true&test=true` 