// Admin giriş bilgileri
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin'
};

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    // Zaten giriş yapılmış mı kontrol et
    checkExistingSession();
    
    // Form submit event listener
    const loginForm = document.getElementById('adminLoginForm');
    loginForm.addEventListener('submit', handleLogin);
    
    // Şifre göster/gizle toggle
    const passwordToggle = document.getElementById('passwordToggle');
    passwordToggle.addEventListener('click', togglePassword);
});

// Mevcut oturum kontrolü
function checkExistingSession() {
    const adminSession = sessionStorage.getItem('adminSession');
    if (adminSession) {
        const sessionData = JSON.parse(adminSession);
        const now = new Date().getTime();
        
        // Oturum 24 saat geçerli
        if (now - sessionData.timestamp < 24 * 60 * 60 * 1000) {
            console.log('Mevcut admin oturumu bulundu, yönlendiriliyor...');
            window.location.href = 'admin.html';
            return;
        } else {
            // Süresi dolmuş oturumu temizle
            sessionStorage.removeItem('adminSession');
        }
    }
}

// Giriş form işleme
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoading = loginBtn.querySelector('.btn-loading');
    
    // Loading durumunu göster
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
    loginBtn.disabled = true;
    
    // Simüle edilmiş giriş gecikmesi
    setTimeout(() => {
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            // Başarılı giriş
            console.log('Admin girişi başarılı!');
            
            // Oturum bilgilerini kaydet
            const sessionData = {
                username: username,
                timestamp: new Date().getTime(),
                role: 'admin'
            };
            sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
            
            // Admin paneline yönlendir
            window.location.href = 'admin.html';
        } else {
            // Hatalı giriş
            console.log('Hatalı giriş bilgileri!');
            alert('Hatalı kullanıcı adı veya şifre!\n\nDoğru bilgiler:\nKullanıcı Adı: admin\nŞifre: admin');
            
            // Loading durumunu gizle
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            loginBtn.disabled = false;
            
            // Alanları temizle
            document.getElementById('password').value = '';
            document.getElementById('username').focus();
        }
    }, 1500);
}

// Şifre göster/gizle
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.querySelector('.eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" fill="none"/>
            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
        `;
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = `
            <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="2" fill="none"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
        `;
    }
} 