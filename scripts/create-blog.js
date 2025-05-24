// Create Blog JavaScript

// DOM Elements
const createBlogForm = document.getElementById('createBlogForm');
const titleInput = document.getElementById('blogTitle');
const contentTextarea = document.getElementById('blogContent');
const imageInput = document.getElementById('blogImage');
const imageUploadArea = document.getElementById('imageUploadArea');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImageBtn = document.getElementById('removeImage');
const saveDraftBtn = document.getElementById('saveDraftBtn');
const titleCount = document.getElementById('titleCount');
const contentCount = document.getElementById('contentCount');

// State
let uploadedImageFile = null;
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Create Blog page loaded');
    
    checkAuthentication();
    setupEventListeners();
    setupCharacterCounters();
});

// Check if user is authenticated
const checkAuthentication = async () => {
    try {
        if (!window.supabaseClient) {
            console.log('⏳ Waiting for Supabase...');
            setTimeout(checkAuthentication, 1000);
            return;
        }

        const { data: { user }, error } = await window.supabaseClient.auth.getUser();
        
        if (error) throw error;
        
        if (!user) {
            // User not logged in, redirect to login
            showMessage('Blog yazısı oluşturmak için önce hesabınıza giriş yapmanız gerekiyor.', 'warning', 'Giriş Gerekli');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
            return;
        }
        
        currentUser = user;
        console.log('✅ User authenticated:', user.email);
        showMessage(`Hoş geldiniz! Blog yazısı oluşturmaya hazırsınız.`, 'success', 'Hazırsınız!');
        
    } catch (error) {
        console.error('Authentication error:', error);
        showMessage('Kimlik doğrulama sırasında bir sorun oluştu. Lütfen tekrar giriş yapmayı deneyin.', 'error', 'Kimlik Doğrulama Hatası');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);
    }
};

// Setup Event Listeners
const setupEventListeners = () => {
    // Form submission
    createBlogForm.addEventListener('submit', handlePublishPost);
    
    // Save draft button
    saveDraftBtn.addEventListener('click', handleSaveDraft);
    
    // Image upload
    imageUploadArea.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleImageUpload);
    removeImageBtn.addEventListener('click', removeImage);
    
    // Prevent form submission on Enter in text inputs
    titleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            contentTextarea.focus();
        }
    });
};

// Setup Character Counters
const setupCharacterCounters = () => {
    titleInput.addEventListener('input', updateTitleCount);
    contentTextarea.addEventListener('input', updateContentCount);
};

// Update title character count
const updateTitleCount = () => {
    const count = titleInput.value.length;
    titleCount.textContent = count;
    
    if (count > 90) {
        titleCount.style.color = '#dc3545';
    } else if (count > 80) {
        titleCount.style.color = '#ffc107';
    } else {
        titleCount.style.color = '#8B6F47';
    }
};

// Update content character count
const updateContentCount = () => {
    const count = contentTextarea.value.length;
    contentCount.textContent = count;
};

// Handle Image Upload
const handleImageUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showMessage('Lütfen geçerli bir resim dosyası seçin (PNG, JPG, GIF).', 'error', 'Geçersiz Dosya');
        return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showMessage('Resim boyutu 5MB\'dan küçük olmalıdır. Lütfen daha küçük bir resim seçin.', 'error', 'Dosya Çok Büyük');
        return;
    }
    
    uploadedImageFile = file;
    
    // Show success message
    showMessage(`Resim seçildi: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`, 'success', 'Resim Yüklendi');
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        imageUploadArea.querySelector('.upload-placeholder').style.display = 'none';
        imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
};

// Remove Image
const removeImage = () => {
    uploadedImageFile = null;
    imageInput.value = '';
    previewImg.src = '';
    imageUploadArea.querySelector('.upload-placeholder').style.display = 'flex';
    imagePreview.style.display = 'none';
};

// Validate Form
const validateForm = () => {
    clearErrors();
    let isValid = true;
    
    // Title validation
    if (!titleInput.value.trim()) {
        showFieldError(titleInput, 'Başlık gereklidir');
        isValid = false;
    } else if (titleInput.value.length > 100) {
        showFieldError(titleInput, 'Başlık 100 karakterden az olmalıdır');
        isValid = false;
    }
    
    // Category validation
    const categorySelect = document.getElementById('blogCategory');
    if (!categorySelect.value) {
        showFieldError(categorySelect, 'Lütfen bir kategori seçin');
        isValid = false;
    }
    
    // Content validation
    if (!contentTextarea.value.trim()) {
        showFieldError(contentTextarea, 'İçerik gereklidir');
        isValid = false;
    } else if (contentTextarea.value.length < 50) {
        showFieldError(contentTextarea, 'İçerik en az 50 karakter olmalıdır');
        isValid = false;
    }
    
    return isValid;
};

// Handle Save Draft
const handleSaveDraft = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        showMessage('Taslak kaydetmek için lütfen giriş yapın.', 'error', 'Giriş Gerekli');
        return;
    }
    
    // Show loading
    saveDraftBtn.classList.add('loading');
    saveDraftBtn.disabled = true;
    
    // Show start message
    showMessage('Taslak kaydediliyor...', 'info', 'İşlem Başladı');
    
    try {
        const postData = await preparePostData(true); // true for draft
        const result = await saveBlogPost(postData);
        
        if (result.success) {
            showMessage('Taslak başarıyla kaydedildi! İstediğiniz zaman geri gelip düzenleyebilirsiniz.', 'success', 'Taslak Kaydedildi');
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error saving draft:', error);
        showMessage(`Taslak kaydedilirken bir sorun oluştu: ${error.message}`, 'error', 'Kaydetme Hatası');
    } finally {
        saveDraftBtn.classList.remove('loading');
        saveDraftBtn.disabled = false;
    }
};

// Handle Publish Post
const handlePublishPost = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        showMessage('Blog yazısı yayınlamak için lütfen giriş yapın.', 'error', 'Giriş Gerekli');
        return;
    }
    
    if (!validateForm()) {
        showMessage('Lütfen tüm gerekli alanları doldurun ve hataları düzeltin.', 'warning', 'Form Eksik');
        return;
    }
    
    // Show loading
    const submitBtn = createBlogForm.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Show start message
    showMessage('Blog yazısı yayınlanıyor...', 'info', 'Yayınlanıyor');
    
    try {
        const postData = await preparePostData(false); // false for published
        const result = await saveBlogPost(postData);
        
        if (result.success) {
            showMessage('Blog yazınız başarıyla yayınlandı! Tüm kullanıcılar artık okuyabilir. Blog sayfasına yönlendiriliyorsunuz...', 'success', 'Yayınlandı!');
            setTimeout(() => {
                window.location.href = 'blogs.html';
            }, 3000);
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error publishing post:', error);
        showMessage(`Blog yazısı yayınlanırken bir sorun oluştu: ${error.message}`, 'error', 'Yayınlama Hatası');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
};

// Prepare Post Data
const preparePostData = async (isDraft = false) => {
    const formData = new FormData(createBlogForm);
    
    // Process tags
    const tagsInput = formData.get('tags');
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // Upload image if exists
    let imageUrl = null;
    if (uploadedImageFile) {
        imageUrl = await uploadImage(uploadedImageFile);
    }
    
    return {
        title: formData.get('title').trim(),
        content: formData.get('content').trim(),
        category: formData.get('category'),
        tags: tags,
        image_url: imageUrl,
        author_id: currentUser.id,
        author_name: currentUser.user_metadata?.display_name || `${currentUser.user_metadata?.first_name || ''} ${currentUser.user_metadata?.last_name || ''}`.trim() || currentUser.email,
        status: isDraft ? 'draft' : 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
};

// Upload Image to Supabase Storage
const uploadImage = async (file) => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `blog-images/${currentUser.id}/${Date.now()}.${fileExt}`;
        
        const { data, error } = await window.supabaseClient.storage
            .from('blog-images')
            .upload(fileName, file);
        
        if (error) throw error;
        
        // Get public URL
        const { data: urlData } = window.supabaseClient.storage
            .from('blog-images')
            .getPublicUrl(fileName);
        
        return urlData.publicUrl;
        
    } catch (error) {
        console.error('Image upload error:', error);
        throw new Error('Resim yüklenirken hata oluştu');
    }
};

// Save Blog Post to Database
const saveBlogPost = async (postData) => {
    try {
        // First check if posts table exists, if not create it
        const { error: insertError } = await window.supabaseClient
            .from('posts')
            .insert([postData]);
        
        if (insertError) {
            // If table doesn't exist, we'll get an error
            console.error('Insert error:', insertError);
            throw insertError;
        }
        
        return { success: true };
        
    } catch (error) {
        console.error('Database error:', error);
        return { success: false, error: error.message };
    }
};

// Show Message using Toast System
const showMessage = (message, type = 'info', title = '') => {
    // Use the global toast system
    if (window.toast) {
        switch (type) {
            case 'success':
                window.toast.success(message, title || 'Başarılı!');
                break;
            case 'error':
                window.toast.error(message, title || 'Hata!');
                break;
            case 'warning':
                window.toast.warning(message, title || 'Uyarı!');
                break;
            default:
                window.toast.info(message, title || 'Bilgi');
        }
    } else {
        // Fallback to console if toast system not available
        console.log(`${type.toUpperCase()}: ${message}`);
    }
};

// Show Field Error with Toast
const showFieldError = (field, message) => {
    field.classList.add('error');
    
    // Show toast notification for the error
    showMessage(message, 'error', 'Form Hatası');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    // Add visual styling to error
    errorDiv.style.cssText = `
        color: #721c24;
        font-size: 12px;
        margin-top: 4px;
        font-weight: 500;
    `;
    
    field.parentNode.appendChild(errorDiv);
};

// Clear Errors
const clearErrors = () => {
    document.querySelectorAll('.field-error').forEach(error => error.remove());
    document.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
};

// Auto-save draft every 2 minutes
let autoSaveInterval;
const startAutoSave = () => {
    autoSaveInterval = setInterval(() => {
        if (titleInput.value.trim() || contentTextarea.value.trim()) {
            console.log('🔄 Auto-saving draft...');
            handleSaveDraft(new Event('click'));
        }
    }, 120000); // 2 minutes
};

// Start auto-save when user starts typing
titleInput.addEventListener('input', () => {
    if (!autoSaveInterval) {
        startAutoSave();
    }
});

contentTextarea.addEventListener('input', () => {
    if (!autoSaveInterval) {
        startAutoSave();
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
}); 