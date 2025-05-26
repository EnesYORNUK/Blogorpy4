// Global değişkenler
let selectedUsers = [];
let selectedPosts = [];
let currentEditingUser = null;
let currentEditingPost = null;

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    // Admin oturum kontrolü
    checkAdminAuth();
    
    // Dashboard verilerini yükle
    loadDashboardStats();
    
    // Kullanıcıları yükle
    loadUsers();
    
    // Event listener'ları ekle
    setupEventListeners();
});

// Admin oturum kontrolü
function checkAdminAuth() {
    const adminSession = sessionStorage.getItem('adminSession');
    if (!adminSession) {
        console.log('Admin oturumu bulunamadı, giriş sayfasına yönlendiriliyor...');
        window.location.href = 'admin-login.html';
        return;
    }
    
    const sessionData = JSON.parse(adminSession);
    const now = new Date().getTime();
    
    // Oturum süresi kontrolü (24 saat)
    if (now - sessionData.timestamp > 24 * 60 * 60 * 1000) {
        console.log('Admin oturumu süresi dolmuş, giriş sayfasına yönlendiriliyor...');
        sessionStorage.removeItem('adminSession');
        window.location.href = 'admin-login.html';
        return;
    }
}

// Dashboard istatistiklerini yükle
async function loadDashboardStats() {
    try {
        // Kullanıcı sayısı
        const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id');
        
        const userCount = userData ? userData.length : 0;
        
        // Post sayısı
        const { count: postCount } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true });
        
        // Beğeni sayısı
        const { data: likeData, error: likeError } = await supabase
            .from('likes')
            .select('id');
            
        const likeCount = likeData ? likeData.length : 0;
        
        // Görüntüleme sayısı (posts tablosundaki views toplamı)
        const { data: viewsData } = await supabase
            .from('posts')
            .select('views');
        
        const totalViews = viewsData?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;
        
        // İstatistikleri güncelle
        document.getElementById('totalUsers').textContent = userCount || 0;
        document.getElementById('totalPosts').textContent = postCount || 0;
        document.getElementById('totalLikes').textContent = likeCount || 0;
        document.getElementById('totalViews').textContent = totalViews;
        
    } catch (error) {
        console.error('Dashboard istatistikleri yüklenirken hata:', error);
        // Hata durumunda varsayılan değerler
        document.getElementById('totalUsers').textContent = '0';
        document.getElementById('totalPosts').textContent = '0';
        document.getElementById('totalLikes').textContent = '0';
        document.getElementById('totalViews').textContent = '0';
    }
}

// Kullanıcıları yükle
async function loadUsers() {
    const container = document.getElementById('usersTableContainer');
    
    try {
        console.log('Kullanıcılar yükleniyor...');
        
        // Doğrudan SQL sorgusu çalıştıralım
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
            
        console.log('Kullanıcı sorgusu sonucu:', { data, error });
        
        if (error) throw error;
        
        // Eğer data null ise boş dizi kullan
        const users = data || [];
        
        if (!users || users.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <h3>Henüz kullanıcı yok</h3>
                    <p>Sistemde kayıtlı kullanıcı bulunmuyor.</p>
                </div>
            `;
            return;
        }
        
        const tableHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>
                            <input type="checkbox" class="checkbox" id="selectAllUsers" onchange="toggleSelectAllUsers()">
                        </th>
                        <th>Kullanıcı</th>
                        <th>E-posta</th>
                        <th>Kayıt Tarihi</th>
                        <th>Durum</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr id="user-${user.id}">
                            <td>
                                <input type="checkbox" class="checkbox user-checkbox" value="${user.id}" onchange="toggleUserSelection('${user.id}')">
                            </td>
                            <td>
                                <div class="user-info">
                                    <div class="user-avatar">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                                    <div class="user-details">
                                        <div class="user-name">${user.name || 'İsimsiz Kullanıcı'}</div>
                                        <div class="user-email">${user.bio || 'Biyografi yok'}</div>
                                    </div>
                                </div>
                            </td>
                            <td>${user.email}</td>
                            <td>${formatDate(user.created_at)}</td>
                            <td>
                                <span class="status-badge status-active">Aktif</span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="action-btn edit-btn" onclick="editUser('${user.id}')">Düzenle</button>
                                    <button class="action-btn delete-btn" onclick="deleteUser('${user.id}')">Sil</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        container.innerHTML = tableHTML;
        
    } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3>Hata oluştu</h3>
                <p>Kullanıcılar yüklenirken bir hata oluştu.</p>
            </div>
        `;
    }
}

// Postları yükle
async function loadPosts() {
    const container = document.getElementById('postsTableContainer');
    
    try {
        console.log('Postlar yükleniyor...');
        
        const { data: posts, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });
            
        console.log('Post sorgusu sonucu:', { posts, error });
        
        if (error) throw error;
        
        if (!posts || posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <h3>Henüz post yok</h3>
                    <p>Sistemde kayıtlı post bulunmuyor.</p>
                </div>
            `;
            return;
        }
        
        const tableHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>
                            <input type="checkbox" class="checkbox" id="selectAllPosts" onchange="toggleSelectAllPosts()">
                        </th>
                        <th>Post</th>
                        <th>Yazar</th>
                        <th>Kategori</th>
                        <th>Tarih</th>
                        <th>Durum</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    ${posts.map(post => `
                        <tr id="post-${post.id}">
                            <td>
                                <input type="checkbox" class="checkbox post-checkbox" value="${post.id}" onchange="togglePostSelection('${post.id}')">
                            </td>
                            <td>
                                <div class="post-info">
                                    <div class="post-thumbnail">${post.title ? post.title.charAt(0).toUpperCase() : 'P'}</div>
                                    <div class="post-details">
                                        <div class="post-title">${post.title}</div>
                                        <div class="post-excerpt">${post.excerpt || 'Özet yok'}</div>
                                    </div>
                                </div>
                            </td>
                            <td>${post.author_name || 'Bilinmeyen Yazar'}</td>
                            <td>
                                <span class="status-badge status-published">${getCategoryName(post.category)}</span>
                            </td>
                            <td>${formatDate(post.created_at)}</td>
                            <td>
                                <span class="status-badge ${post.status === 'published' ? 'status-published' : 'status-draft'}">
                                    ${post.status === 'published' ? 'Yayınlandı' : 'Taslak'}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="action-btn view-btn" onclick="viewPost('${post.id}')">Görüntüle</button>
                                    <button class="action-btn edit-btn" onclick="editPost('${post.id}')">Düzenle</button>
                                    <button class="action-btn delete-btn" onclick="deletePost('${post.id}')">Sil</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        container.innerHTML = tableHTML;
        
    } catch (error) {
        console.error('Postlar yüklenirken hata:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3>Hata oluştu</h3>
                <p>Postlar yüklenirken bir hata oluştu.</p>
            </div>
        `;
    }
}

// Tab değiştirme
function switchTab(tabName) {
    // Tab butonlarını güncelle
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    
    // Tab içeriklerini güncelle
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tabName === 'users') {
        document.getElementById('usersTab').classList.add('active');
        loadUsers();
    } else if (tabName === 'posts') {
        document.getElementById('postsTab').classList.add('active');
        loadPosts();
    }
}

// Kullanıcı seçimi
function toggleUserSelection(userId) {
    const checkbox = document.querySelector(`input[value="${userId}"]`);
    const row = document.getElementById(`user-${userId}`);
    
    if (checkbox.checked) {
        selectedUsers.push(userId);
        row.classList.add('selected');
    } else {
        selectedUsers = selectedUsers.filter(id => id !== userId);
        row.classList.remove('selected');
    }
    
    updateBulkDeleteButton('users');
}

// Tüm kullanıcıları seç/seçme
function toggleSelectAllUsers() {
    const selectAllCheckbox = document.getElementById('selectAllUsers');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    
    userCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
        toggleUserSelection(checkbox.value);
    });
}

// Post seçimi
function togglePostSelection(postId) {
    const checkbox = document.querySelector(`input[value="${postId}"]`);
    const row = document.getElementById(`post-${postId}`);
    
    if (checkbox.checked) {
        selectedPosts.push(postId);
        row.classList.add('selected');
    } else {
        selectedPosts = selectedPosts.filter(id => id !== postId);
        row.classList.remove('selected');
    }
    
    updateBulkDeleteButton('posts');
}

// Tüm postları seç/seçme
function toggleSelectAllPosts() {
    const selectAllCheckbox = document.getElementById('selectAllPosts');
    const postCheckboxes = document.querySelectorAll('.post-checkbox');
    
    postCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
        togglePostSelection(checkbox.value);
    });
}

// Toplu silme butonunu güncelle
function updateBulkDeleteButton(type) {
    const button = document.getElementById(`bulkDelete${type.charAt(0).toUpperCase() + type.slice(1)}`);
    const selectedItems = type === 'users' ? selectedUsers : selectedPosts;
    
    if (selectedItems.length > 0) {
        button.style.display = 'flex';
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21" stroke="currentColor" stroke-width="2"/>
                <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Seçilenleri Sil (${selectedItems.length})
        `;
    } else {
        button.style.display = 'none';
    }
}

// Post silme
function deletePost(postId) {
    currentEditingPost = { id: postId };
    document.getElementById('deleteModalText').textContent = 'Bu postu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.';
    
    document.getElementById('confirmDeleteBtn').onclick = async function() {
        try {
            console.log('Post siliniyor, ID:', postId);
            
            // 1. Adım: Önce ilişkili beğenileri sil
            console.log('Beğeniler siliniyor...');
            const { error: likesError } = await supabase
                .from('user_favorites')
                .delete()
                .eq('post_id', postId);
            
            if (likesError) {
                console.warn('Beğeniler silinirken uyarı:', likesError);
            }
            
            // 2. Adım: Postu sil
            console.log('Post siliniyor...');
            const { data: deleteData, error: deleteError } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId)
                .select();
            
            if (deleteError) {
                console.error('Post silme hatası:', deleteError);
                throw deleteError;
            }
            
            console.log('Silme işlemi yanıtı:', deleteData);
            
            // 3. Adım: Başarılı ise sayfayı güncelle
            console.log('Post başarıyla silindi');
            closeModal('deleteModal');
            loadPosts();
            loadDashboardStats();
            showToast('Post başarıyla silindi.');
            
        } catch (error) {
            console.error('Post silinirken hata:', error);
            alert('Post silinirken hata oluştu: ' + error.message);
        }
    };
    
    openModal('deleteModal');
}

// Toplu post silme
async function bulkDeletePosts() {
    if (selectedPosts.length === 0) return;
    
    if (!confirm(`${selectedPosts.length} postu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
        return;
    }
    
    try {
        console.log('Toplu post silme işlemi başlıyor, silinecek postlar:', selectedPosts);
        
        // Seçilen her post için silme işlemi yap
        let successCount = 0;
        let errorCount = 0;
        
        for (const postId of selectedPosts) {
            try {
                console.log(`Post siliniyor: ${postId}...`);
                
                // 1. Adım: Önce ilişkili beğenileri sil
                console.log(`Beğeniler siliniyor... (${postId})`);
                await supabase
                    .from('user_favorites')
                    .delete()
                    .eq('post_id', postId);
                
                // 2. Adım: Postu sil
                console.log(`Post siliniyor... (${postId})`);
                const { error: deleteError } = await supabase
                    .from('posts')
                    .delete()
                    .eq('id', postId);
                
                if (deleteError) {
                    console.error(`Post silme hatası (${postId}):`, deleteError);
                    throw deleteError;
                }
                
                console.log(`Post başarıyla silindi (${postId})`);
                successCount++;
                
            } catch (err) {
                console.error(`Post silme hatası (ID: ${postId}):`, err);
                errorCount++;
            }
        }
        
        // Listeyi temizle ve UI'ı güncelle
        selectedPosts = [];
        updateBulkDeleteButton('posts');
        loadPosts();
        loadDashboardStats();
        
        // Kullanıcıya bilgi ver
        if (errorCount > 0) {
            alert(`${successCount} post başarıyla silindi, ${errorCount} post silinirken hata oluştu.`);
        } else {
            showToast(`${successCount} post başarıyla silindi.`);
        }
        
    } catch (error) {
        console.error('Toplu post silme işlemi sırasında hata:', error);
        alert('Toplu silme işlemi sırasında bir hata oluştu.');
    }
}

// Toplu kullanıcı silme
async function bulkDeleteUsers() {
    if (selectedUsers.length === 0) return;
    
    if (!confirm(`${selectedUsers.length} kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
        return;
    }
    
    try {
        console.log('Toplu kullanıcı silme işlemi başlıyor, silinecek kullanıcılar:', selectedUsers);
        
        // Seçilen her kullanıcı için silme işlemi yap
        let successCount = 0;
        let errorCount = 0;
        
        for (const userId of selectedUsers) {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .delete()
                    .eq('id', userId);
                
                if (error) throw error;
                successCount++;
            } catch (err) {
                console.error(`Kullanıcı silme hatası (ID: ${userId}):`, err);
                errorCount++;
            }
        }
        
        // Listeyi temizle ve UI'ı güncelle
        selectedUsers = [];
        updateBulkDeleteButton('users');
        loadUsers();
        loadDashboardStats();
        
        // Kullanıcıya bilgi ver
        if (errorCount > 0) {
            alert(`${successCount} kullanıcı başarıyla silindi, ${errorCount} kullanıcı silinirken hata oluştu.`);
        } else {
            showToast(`${successCount} kullanıcı başarıyla silindi.`);
        }
        
    } catch (error) {
        console.error('Toplu kullanıcı silme işlemi sırasında hata:', error);
        alert('Toplu silme işlemi sırasında bir hata oluştu.');
    }
}

// Kullanıcı düzenleme
async function editUser(userId) {
    try {
        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        currentEditingUser = user;
        
        // Modal alanlarını doldur
        document.getElementById('editUserName').value = user.name || '';
        document.getElementById('editUserEmail').value = user.email || '';
        document.getElementById('editUserBio').value = user.bio || '';
        
        // Modal'ı aç
        openModal('editUserModal');
        
    } catch (error) {
        console.error('Kullanıcı bilgileri alınırken hata:', error);
        alert('Kullanıcı bilgileri alınırken hata oluştu.');
    }
}

// Kullanıcı silme
function deleteUser(userId) {
    currentEditingUser = { id: userId };
    document.getElementById('deleteModalText').textContent = 'Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.';
    
    document.getElementById('confirmDeleteBtn').onclick = async function() {
        try {
            // Profil kaydını sil (gerçek kullanıcı silinmez)
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);
            
            if (error) throw error;
            
            closeModal('deleteModal');
            loadUsers();
            loadDashboardStats();
            showToast('Kullanıcı başarıyla silindi.');
            
        } catch (error) {
            console.error('Kullanıcı silinirken hata:', error);
            alert('Kullanıcı silinirken hata oluştu: ' + error.message);
        }
    };
    
    openModal('deleteModal');
}

// Post düzenleme
async function editPost(postId) {
    try {
        const { data: post, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();
        
        if (error) throw error;
        
        currentEditingPost = post;
        
        // Modal alanlarını doldur
        document.getElementById('editPostTitle').value = post.title || '';
        document.getElementById('editPostCategory').value = post.category || '';
        document.getElementById('editPostExcerpt').value = post.excerpt || '';
        
        // Modal'ı aç
        openModal('editPostModal');
        
    } catch (error) {
        console.error('Post bilgileri alınırken hata:', error);
        alert('Post bilgileri alınırken hata oluştu.');
    }
}

// Post görüntüleme
function viewPost(postId) {
    window.open(`blog-detail.html?id=${postId}`, '_blank');
}

// Modal açma
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

// Modal kapatma
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Event listener'ları ayarla
function setupEventListeners() {
    // Kullanıcı düzenleme formu
    document.getElementById('editUserForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!currentEditingUser) return;
        
        try {
            // Doğrudan profili güncelle
            const { error } = await supabase
                .from('profiles')
                .update({
                    name: document.getElementById('editUserName').value,
                    bio: document.getElementById('editUserBio').value,
                    updated_at: new Date()
                })
                .eq('id', currentEditingUser.id);
            
            if (error) throw error;
            
            closeModal('editUserModal');
            loadUsers();
            showToast('Kullanıcı başarıyla güncellendi.');
            
        } catch (error) {
            console.error('Kullanıcı güncellenirken hata:', error);
            alert('Kullanıcı güncellenirken hata oluştu: ' + error.message);
        }
    });
    
    // Post düzenleme formu
    document.getElementById('editPostForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!currentEditingPost) return;
        
        try {
            const { error } = await supabase
                .from('posts')
                .update({
                    title: document.getElementById('editPostTitle').value,
                    category: document.getElementById('editPostCategory').value,
                    excerpt: document.getElementById('editPostExcerpt').value
                })
                .eq('id', currentEditingPost.id);
            
            if (error) throw error;
            
            closeModal('editPostModal');
            loadPosts();
            showToast('Post başarıyla güncellendi.');
            
        } catch (error) {
            console.error('Post güncellenirken hata:', error);
            alert('Post güncellenirken hata oluştu.');
        }
    });
    
    // Arama kutuları
    document.getElementById('userSearch').addEventListener('input', function() {
        // Kullanıcı arama fonksiyonu burada implement edilebilir
    });
    
    document.getElementById('postSearch').addEventListener('input', function() {
        // Post arama fonksiyonu burada implement edilebilir
    });
    
    // Kategori filtresi
    document.getElementById('categoryFilter').addEventListener('change', function() {
        // Kategori filtreleme fonksiyonu burada implement edilebilir
    });
}

// Çıkış yapma
function logout() {
    sessionStorage.removeItem('adminSession');
    window.location.href = 'admin-login.html';
}

// Yardımcı fonksiyonlar
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getCategoryName(category) {
    const categories = {
        'technology': 'Teknoloji',
        'lifestyle': 'Yaşam Tarzı',
        'travel': 'Seyahat',
        'food': 'Yemek',
        'health': 'Sağlık',
        'business': 'İş',
        'education': 'Eğitim',
        'entertainment': 'Eğlence'
    };
    return categories[category] || category;
}

function showToast(message) {
    // Basit toast bildirimi
    alert(message);
}

// Global fonksiyonları window objesine ekle
window.editUser = editUser;
window.deleteUser = deleteUser;
window.editPost = editPost;
window.deletePost = deletePost;
window.viewPost = viewPost;
window.toggleUserSelection = toggleUserSelection;
window.togglePostSelection = togglePostSelection;
window.toggleSelectAllUsers = toggleSelectAllUsers;
window.toggleSelectAllPosts = toggleSelectAllPosts;
window.bulkDeleteUsers = bulkDeleteUsers;
window.bulkDeletePosts = bulkDeletePosts;
window.switchTab = switchTab; 