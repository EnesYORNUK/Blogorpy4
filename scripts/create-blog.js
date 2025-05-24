// Create Blog JavaScript

// Test function to check Supabase connection and auth
const testSupabaseConnection = async () => {
    console.log('🧪 Testing Supabase connection and auth...');
    
    try {
        // Test 1: Check if Supabase client exists
        if (!window.supabaseClient) {
            console.error('❌ Supabase client not found');
            if (window.toast) {
                window.toast.error('Supabase bağlantısı bulunamadı!');
            } else {
                alert('Supabase bağlantısı bulunamadı!');
            }
            return;
        }
        console.log('✅ Supabase client found');
        
        // Test 2: Check authentication
        const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();
        if (authError) {
            console.error('❌ Auth error:', authError);
            if (window.toast) {
                window.toast.error('Kimlik doğrulama hatası: ' + authError.message);
            } else {
                alert('Kimlik doğrulama hatası: ' + authError.message);
            }
            return;
        }
        
        if (!user) {
            console.error('❌ No authenticated user');
            if (window.toast) {
                window.toast.error('Kullanıcı giriş yapmamış!');
            } else {
                alert('Kullanıcı giriş yapmamış!');
            }
            return;
        }
        
        console.log('✅ User authenticated:', {
            id: user.id,
            email: user.email,
            metadata: user.user_metadata
        });
        
        // Test 3: Try to insert a test post
        const testPost = {
            title: 'Test Post - ' + new Date().toISOString(),
            content: 'Bu bir test blog yazısıdır. Supabase bağlantısını test etmek için oluşturulmuştur. Test test test test test test test test test test test test test.',
            category: 'technology',
            tags: ['test'],
            image_url: null,
            author_id: user.id,
            author_name: user.email,
            status: 'published'
        };
        
        console.log('🧪 Inserting test post:', testPost);
        
        const { data, error } = await window.supabaseClient
            .from('posts')
            .insert([testPost])
            .select();
        
        if (error) {
            console.error('❌ Insert error:', error);
            if (window.toast) {
                window.toast.error('Test post ekleme hatası: ' + error.message);
            } else {
                alert('Test post ekleme hatası: ' + error.message);
            }
            return;
        }
        
        console.log('✅ Test post inserted successfully:', data);
        if (window.toast) {
            window.toast.success('Test başarılı! Post oluşturuldu: ' + testPost.title);
        } else {
            alert('Test başarılı! Post oluşturuldu: ' + testPost.title);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        if (window.toast) {
            window.toast.error('Test başarısız: ' + error.message);
        } else {
            alert('Test başarısız: ' + error.message);
        }
    }
};

// Make function globally available
window.testSupabaseConnection = testSupabaseConnection;

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

// Debug DOM Elements
console.log('🔍 DOM Elements Check:', {
    createBlogForm: !!createBlogForm,
    titleInput: !!titleInput,
    contentTextarea: !!contentTextarea,
    imageInput: !!imageInput,
    imageUploadArea: !!imageUploadArea,
    imagePreview: !!imagePreview,
    previewImg: !!previewImg,
    removeImageBtn: !!removeImageBtn,
    saveDraftBtn: !!saveDraftBtn,
    titleCount: !!titleCount,
    contentCount: !!contentCount
});

// State
let uploadedImageFile = null;
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Create Blog page loaded');
    
    // Add test button programmatically
    const header = document.querySelector('.create-blog-header');
    if (header) {
        const testButton = document.createElement('button');
        testButton.type = 'button';
        testButton.innerHTML = '🧪 Test Supabase Connection';
        testButton.style.cssText = `
            background: #CD853F; 
            color: white; 
            padding: 8px 16px; 
            border: none; 
            border-radius: 4px; 
            margin: 10px 0; 
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        `;
        testButton.addEventListener('click', testSupabaseConnection);
        header.appendChild(testButton);
        console.log('✅ Test button added');
    }
    
    // Test toast system immediately
    setTimeout(() => {
        if (window.toast) {
            console.log('✅ Toast system available');
            window.toast.info('Sayfa yüklendi, sistem hazır!', 'Test');
        } else {
            console.error('❌ Toast system not available');
            alert('Toast sistem yüklenemedi!');
        }
    }, 500);
    
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
            showMessage('Blog yazısı oluşturmak için önce hesabınıza giriş yapmanız gerekiyor.', 'warning', 'Giriş Gerekli');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
            return;
        }
        
        currentUser = user;
        console.log('✅ User authenticated:', user.email);
        if (!window.authCheckCompleted) {
            showMessage(`Hoş geldiniz! Blog yazısı oluşturmaya hazırsınız.`, 'success', 'Hazırsınız!');
            window.authCheckCompleted = true;
        }
        
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
    console.log('🔧 Setting up event listeners...');
    
    if (createBlogForm) {
        console.log('✅ Form found, adding submit listener');
        createBlogForm.addEventListener('submit', (e) => {
            console.log('📝 Form submit event triggered');
            handlePublishPost(e);
        });
    } else {
        console.error('❌ Form not found!');
    }
    
    if (saveDraftBtn) {
        console.log('✅ Save draft button found');
        saveDraftBtn.addEventListener('click', (e) => {
            console.log('💾 Save draft clicked');
            handleSaveDraft(e);
        });
    } else {
        console.error('❌ Save draft button not found!');
    }
    
    if (imageUploadArea && imageInput) {
        console.log('✅ Image upload elements found');
        imageUploadArea.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', handleImageUpload);
    }
    
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', removeImage);
    }
    
    if (titleInput) {
        titleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                contentTextarea.focus();
            }
        });
    }
    
    console.log('✅ Event listeners setup complete');
};

// Setup Character Counters
const setupCharacterCounters = () => {
    if (titleInput) titleInput.addEventListener('input', updateTitleCount);
    if (contentTextarea) contentTextarea.addEventListener('input', updateContentCount);
};

// Update title character count
const updateTitleCount = () => {
    const count = titleInput.value.length;
    if (titleCount) {
        titleCount.textContent = count;
        
        if (count > 90) {
            titleCount.style.color = '#dc3545';
        } else if (count > 80) {
            titleCount.style.color = '#ffc107';
        } else {
            titleCount.style.color = '#8B6F47';
        }
    }
};

// Update content character count
const updateContentCount = () => {
    const count = contentTextarea.value.length;
    if (contentCount) {
        contentCount.textContent = count;
    }
};

// Handle Image Upload
const handleImageUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showMessage('Lütfen geçerli bir resim dosyası seçin (PNG, JPG, GIF).', 'error', 'Geçersiz Dosya');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showMessage('Resim boyutu 5MB\'dan küçük olmalıdır. Lütfen daha küçük bir resim seçin.', 'error', 'Dosya Çok Büyük');
        return;
    }
    
    uploadedImageFile = file;
    showMessage(`Resim seçildi: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`, 'success', 'Resim Yüklendi');
    
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
    console.log('🔍 Starting form validation...');
    clearErrors();
    let isValid = true;
    
    console.log('📝 Title value:', titleInput?.value);
    if (!titleInput.value.trim()) {
        console.log('❌ Title validation failed: empty');
        showFieldError(titleInput, 'Başlık gereklidir');
        isValid = false;
    } else if (titleInput.value.length > 100) {
        console.log('❌ Title validation failed: too long');
        showFieldError(titleInput, 'Başlık 100 karakterden az olmalıdır');
        isValid = false;
    } else {
        console.log('✅ Title validation passed');
    }
    
    const categorySelect = document.getElementById('blogCategory');
    console.log('📂 Category value:', categorySelect?.value);
    if (!categorySelect.value) {
        console.log('❌ Category validation failed: not selected');
        showFieldError(categorySelect, 'Lütfen bir kategori seçin');
        isValid = false;
    } else {
        console.log('✅ Category validation passed');
    }
    
    console.log('📄 Content value length:', contentTextarea?.value?.length);
    if (!contentTextarea.value.trim()) {
        console.log('❌ Content validation failed: empty');
        showFieldError(contentTextarea, 'İçerik gereklidir');
        isValid = false;
    } else if (contentTextarea.value.length < 50) {
        console.log('❌ Content validation failed: too short');
        showFieldError(contentTextarea, 'İçerik en az 50 karakter olmalıdır');
        isValid = false;
    } else {
        console.log('✅ Content validation passed');
    }
    
    console.log('🔍 Form validation result:', isValid);
    return isValid;
};

// Handle Save Draft
const handleSaveDraft = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        showMessage('Taslak kaydetmek için lütfen giriş yapın.', 'error', 'Giriş Gerekli');
        return;
    }
    
    saveDraftBtn.classList.add('loading');
    saveDraftBtn.disabled = true;
    
    showMessage('Taslak kaydediliyor...', 'info', 'İşlem Başladı');
    
    try {
        const postData = await preparePostData(true);
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
    console.log('🚀 handlePublishPost called');
    e.preventDefault();
    
    console.log('👤 Current user:', currentUser);
    console.log('🔧 Window objects:', {
        supabaseClient: !!window.supabaseClient,
        toast: !!window.toast,
        AppConfig: !!window.AppConfig
    });
    
    if (!currentUser) {
        console.log('❌ No current user');
        showMessage('Blog yazısı yayınlamak için lütfen giriş yapın.', 'error', 'Giriş Gerekli');
        return;
    }
    
    console.log('✅ User authenticated, validating form...');
    if (!validateForm()) {
        console.log('❌ Form validation failed');
        showMessage('Lütfen tüm gerekli alanları doldurun ve hataları düzeltin.', 'warning', 'Form Eksik');
        return;
    }
    
    console.log('✅ Form validation passed');
    
    const submitBtn = createBlogForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        console.log('✅ Submit button found, setting loading state');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
    } else {
        console.error('❌ Submit button not found');
    }
    
    console.log('📢 Showing start message');
    showMessage('Blog yazısı yayınlanıyor...', 'info', 'Yayınlanıyor');
    
    try {
        console.log('📦 Preparing post data...');
        const postData = await preparePostData(false);
        console.log('📦 Post data prepared:', postData);
        
        console.log('💾 Saving to database...');
        const result = await saveBlogPost(postData);
        console.log('💾 Save result:', result);
        
        if (result.success) {
            console.log('✅ Post saved successfully');
            showMessage('Blog yazınız başarıyla yayınlandı! Tüm kullanıcılar artık okuyabilir. Blog sayfasına yönlendiriliyorsunuz...', 'success', 'Yayınlandı!');
            setTimeout(() => {
                console.log('🔄 Redirecting to blogs page...');
                window.location.href = 'blogs.html';
            }, 3000);
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('❌ Error publishing post:', error);
        showMessage(`Blog yazısı yayınlanırken bir sorun oluştu: ${error.message}`, 'error', 'Yayınlama Hatası');
    } finally {
        if (submitBtn) {
            console.log('🔄 Removing loading state');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }
};

// Prepare Post Data
const preparePostData = async (isDraft = false) => {
    console.log('📦 preparePostData called, isDraft:', isDraft);
    
    const formData = new FormData(createBlogForm);
    
    const tagsInput = formData.get('tags');
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    let imageUrl = null;
    if (uploadedImageFile) {
        console.log('📸 Uploading image...');
        imageUrl = await uploadImage(uploadedImageFile);
        console.log('📸 Image uploaded:', imageUrl);
    }
    
    const authorName = currentUser.user_metadata?.display_name || 
                      `${currentUser.user_metadata?.first_name || ''} ${currentUser.user_metadata?.last_name || ''}`.trim() || 
                      currentUser.email;
    
    const postData = {
        title: formData.get('title').trim(),
        content: formData.get('content').trim(),
        category: formData.get('category'),
        tags: tags,
        image_url: imageUrl,
        author_id: currentUser.id,
        author_name: authorName,
        status: isDraft ? 'draft' : 'published'
    };
    
    console.log('📦 Prepared post data:', postData);
    return postData;
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
    console.log('💾 saveBlogPost called with data:', postData);
    
    try {
        console.log('🔗 Checking Supabase client:', !!window.supabaseClient);
        
        if (!window.supabaseClient) {
            throw new Error('Supabase client not available');
        }
        
        console.log('📡 Inserting data to posts table...');
        const { data, error: insertError } = await window.supabaseClient
            .from('posts')
            .insert([postData])
            .select();
        
        console.log('📡 Insert response:', { data, error: insertError });
        
        if (insertError) {
            console.error('❌ Insert error details:', insertError);
            throw insertError;
        }
        
        console.log('✅ Post saved successfully:', data);
        return { success: true, data };
        
    } catch (error) {
        console.error('❌ Database error:', error);
        return { success: false, error: error.message };
    }
};

// Show Message using Toast System
const showMessage = (message, type = 'info', title = '') => {
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
        console.log(`${type.toUpperCase()}: ${message}`);
    }
};

// Show Field Error with Toast
const showFieldError = (field, message) => {
    field.classList.add('error');
    showMessage(message, 'error', 'Form Hatası');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
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