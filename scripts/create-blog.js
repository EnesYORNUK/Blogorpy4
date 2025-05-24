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
            showMessage('Please login to create a blog post.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        currentUser = user;
        console.log('✅ User authenticated:', user.email);
        
    } catch (error) {
        console.error('Authentication error:', error);
        showMessage('Authentication failed. Please try again.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
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
        showMessage('Please select a valid image file.', 'error');
        return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showMessage('Image size must be less than 5MB.', 'error');
        return;
    }
    
    uploadedImageFile = file;
    
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
        showFieldError(titleInput, 'Title is required');
        isValid = false;
    } else if (titleInput.value.length > 100) {
        showFieldError(titleInput, 'Title must be 100 characters or less');
        isValid = false;
    }
    
    // Category validation
    const categorySelect = document.getElementById('blogCategory');
    if (!categorySelect.value) {
        showFieldError(categorySelect, 'Please select a category');
        isValid = false;
    }
    
    // Content validation
    if (!contentTextarea.value.trim()) {
        showFieldError(contentTextarea, 'Content is required');
        isValid = false;
    } else if (contentTextarea.value.length < 50) {
        showFieldError(contentTextarea, 'Content must be at least 50 characters');
        isValid = false;
    }
    
    return isValid;
};

// Handle Save Draft
const handleSaveDraft = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        showMessage('Please login to save drafts.', 'error');
        return;
    }
    
    // Show loading
    saveDraftBtn.classList.add('loading');
    saveDraftBtn.disabled = true;
    
    try {
        const postData = await preparePostData(true); // true for draft
        const result = await saveBlogPost(postData);
        
        if (result.success) {
            showMessage('Draft saved successfully!', 'success');
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error saving draft:', error);
        showMessage('Failed to save draft: ' + error.message, 'error');
    } finally {
        saveDraftBtn.classList.remove('loading');
        saveDraftBtn.disabled = false;
    }
};

// Handle Publish Post
const handlePublishPost = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        showMessage('Please login to publish posts.', 'error');
        return;
    }
    
    if (!validateForm()) {
        return;
    }
    
    // Show loading
    const submitBtn = createBlogForm.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        const postData = await preparePostData(false); // false for published
        const result = await saveBlogPost(postData);
        
        if (result.success) {
            showMessage('Blog post published successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'blogs.html';
            }, 2000);
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error publishing post:', error);
        showMessage('Failed to publish post: ' + error.message, 'error');
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
        throw new Error('Failed to upload image');
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

// Show Message
const showMessage = (message, type = 'info') => {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    
    const card = document.querySelector('.create-blog-card');
    card.insertBefore(messageDiv, card.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
};

// Show Field Error
const showFieldError = (field, message) => {
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
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