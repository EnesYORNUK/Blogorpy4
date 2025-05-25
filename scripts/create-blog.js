// Create Blog JavaScript

// Test function to check Supabase connection and auth
const testSupabaseConnection = async () => {
    console.log('🧪 Testing Supabase connection and auth...');
    
    try {
        // Test 1: Check if Supabase client exists
        if (!window.supabaseClient) {
            console.error('❌ Supabase client not found');
            if (window.toast) {
                window.toast.error('Supabase connection not found!');
            } else {
                alert('Supabase connection not found!');
            }
            return;
        }
        console.log('✅ Supabase client found');
        
        // Test 2: Check authentication
        const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();
        if (authError) {
            console.error('❌ Auth error:', authError);
            if (window.toast) {
                window.toast.error('Authentication error: ' + authError.message);
            } else {
                alert('Authentication error: ' + authError.message);
            }
            return;
        }
        
        if (!user) {
            console.error('❌ No authenticated user');
            if (window.toast) {
                window.toast.error('User not logged in!');
            } else {
                alert('User not logged in!');
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
            content: 'This is a test blog post. It was created to test the Supabase connection. Test test test test test test test test test test test test test.',
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
                window.toast.error('Test post insertion error: ' + error.message);
            } else {
                alert('Test post insertion error: ' + error.message);
            }
            return;
        }
        
        console.log('✅ Test post inserted successfully:', data);
        if (window.toast) {
            window.toast.success('Test successful! Post created: ' + testPost.title);
        } else {
            alert('Test successful! Post created: ' + testPost.title);
        }
        
        // Test 4: Test storage access
        console.log('🧪 Testing storage access...');
        const { data: storageTest, error: storageError } = await window.supabaseClient.storage
            .from('blog-images')
            .list('', { limit: 1 });

        if (storageError) {
            console.error('❌ Storage test error:', storageError);
            if (window.toast) {
                window.toast.warning('Storage access issue: ' + storageError.message);
            }
        } else {
            console.log('✅ Storage access successful');
            if (window.toast) {
                window.toast.success('Storage access also successful!');
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        if (window.toast) {
            window.toast.error('Test failed: ' + error.message);
        } else {
            alert('Test failed: ' + error.message);
        }
    }
};

// Make function globally available
window.testSupabaseConnection = testSupabaseConnection;

// DOM Elements
const createBlogForm = document.getElementById('createBlogForm');
const titleInput = document.getElementById('blogTitle');
const excerptTextarea = document.getElementById('blogExcerpt');
const contentTextarea = document.getElementById('blogContent');
const imageInput = document.getElementById('blogImage');
const imageUploadArea = document.getElementById('imageUploadArea');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImageBtn = document.getElementById('removeImage');
const saveDraftBtn = document.getElementById('saveDraftBtn');
const titleCount = document.getElementById('titleCount');
const excerptCount = document.getElementById('excerptCount');
const contentCount = document.getElementById('contentCount');

// Tag System Elements
const tagInput = document.getElementById('tagInput');
const tagsDisplay = document.getElementById('tagsDisplay');
const blogTagsHidden = document.getElementById('blogTags');
const tagsSuggestions = document.getElementById('tagsSuggestions');

// Debug DOM Elements
console.log('🔍 DOM Elements Check:', {
    createBlogForm: !!createBlogForm,
    titleInput: !!titleInput,
    excerptTextarea: !!excerptTextarea,
    contentTextarea: !!contentTextarea,
    imageInput: !!imageInput,
    imageUploadArea: !!imageUploadArea,
    imagePreview: !!imagePreview,
    previewImg: !!previewImg,
    removeImageBtn: !!removeImageBtn,
    saveDraftBtn: !!saveDraftBtn,
    titleCount: !!titleCount,
    excerptCount: !!excerptCount,
    contentCount: !!contentCount
});

// State
let uploadedImageFile = null;
let currentUser = null;

// Tag System State
let selectedTags = [];
const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 30;

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
            window.toast.info('Page loaded, system ready!', 'Test');
        } else {
            console.error('❌ Toast system not available');
            alert('Toast system could not be loaded!');
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
            showMessage('You need to log in to your account first to create a blog post.', 'warning', 'Login Required');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
            return;
        }
        
        currentUser = user;
        console.log('✅ User authenticated:', user.email);
        if (!window.authCheckCompleted) {
            showMessage(`Welcome! You're ready to create a blog post.`, 'success', 'Ready!');
            window.authCheckCompleted = true;
        }
        
    } catch (error) {
        console.error('Authentication error:', error);
        showMessage('A problem occurred during authentication. Please try logging in again.', 'error', 'Authentication Error');
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
                excerptTextarea.focus();
            }
        });
    }
    
    // Tag System Event Listeners
    setupTagSystemListeners();
    
    console.log('✅ Event listeners setup complete');
};

// Setup Character Counters
const setupCharacterCounters = () => {
    if (titleInput) titleInput.addEventListener('input', updateTitleCount);
    if (excerptTextarea) excerptTextarea.addEventListener('input', updateExcerptCount);
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

// Update excerpt character count
const updateExcerptCount = () => {
    const count = excerptTextarea.value.length;
    if (excerptCount) {
        excerptCount.textContent = count;
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
        showMessage('Please select a valid image file (PNG, JPG, GIF).', 'error', 'Invalid File');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showMessage('Image size must be less than 5MB. Please select a smaller image.', 'error', 'File Too Large');
        return;
    }
    
    // Show image cropping modal
    showImageCropper(file);
};

// Image Cropper Variables
let cropCanvas, cropCtx, cropImage, cropModal;
let cropSelection = { x: 0, y: 0, width: 200, height: 200 };
let isDragging = false;
let isResizing = false;
let dragStart = { x: 0, y: 0 };
let resizeHandle = null;
let canvasRect = null;

// Show Image Cropper Modal
const showImageCropper = (file) => {
    cropModal = document.getElementById('cropModal');
    cropCanvas = document.getElementById('cropCanvas');
    cropCtx = cropCanvas.getContext('2d');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        cropImage = new Image();
        cropImage.onload = () => {
            setupCropCanvas();
            setupCropEventListeners();
            cropModal.style.display = 'flex';
            cropModal.classList.add('show');
        };
        cropImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

// Setup Crop Canvas
const setupCropCanvas = () => {
    const maxWidth = 600;
    const maxHeight = 400;
    
    let { width, height } = cropImage;
    
    // Scale image to fit canvas
    if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
    }
    
    cropCanvas.width = width;
    cropCanvas.height = height;
    cropCanvas.style.width = width + 'px';
    cropCanvas.style.height = height + 'px';
    
    // Draw image
    cropCtx.drawImage(cropImage, 0, 0, width, height);
    
    // Position overlay
    const overlay = document.getElementById('cropOverlay');
    overlay.style.width = width + 'px';
    overlay.style.height = height + 'px';
    
    // Set initial crop selection (center)
    cropSelection = {
        x: width * 0.2,
        y: height * 0.2,
        width: width * 0.6,
        height: height * 0.6
    };
    
    updateCropSelection();
};

// Update Crop Selection Display
const updateCropSelection = () => {
    const selection = document.getElementById('cropSelection');
    selection.style.left = cropSelection.x + 'px';
    selection.style.top = cropSelection.y + 'px';
    selection.style.width = cropSelection.width + 'px';
    selection.style.height = cropSelection.height + 'px';
};

// Setup Crop Event Listeners
const setupCropEventListeners = () => {
    const selection = document.getElementById('cropSelection');
    const handles = document.querySelectorAll('.crop-handle');
    
    // Get canvas rectangle
    canvasRect = cropCanvas.getBoundingClientRect();
    
    // Selection drag - improved to work better
    selection.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('crop-handle')) return;
        isDragging = true;
        
        // Get the actual position relative to the crop container
        const containerRect = document.querySelector('.crop-container').getBoundingClientRect();
        const canvasRect = cropCanvas.getBoundingClientRect();
        
        // Calculate offset from canvas to container
        const offsetX = canvasRect.left - containerRect.left;
        const offsetY = canvasRect.top - containerRect.top;
        
        dragStart = {
            x: e.clientX - (containerRect.left + offsetX + cropSelection.x),
            y: e.clientY - (containerRect.top + offsetY + cropSelection.y)
        };
        
        // Add visual feedback
        selection.style.cursor = 'grabbing';
        selection.style.transition = 'none';
        
        e.preventDefault();
    });
    
    // Handle resize
    handles.forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            resizeHandle = handle.className.split(' ')[1]; // get crop-handle-xx
            dragStart = { x: e.clientX, y: e.clientY };
            
            // Add visual feedback
            handle.style.transform = handle.style.transform.replace('scale(1.2)', '') + ' scale(1.3)';
            document.body.style.cursor = getComputedStyle(handle).cursor;
            
            e.preventDefault();
            e.stopPropagation();
        });
    });
    
    // Mouse move
    document.addEventListener('mousemove', handleCropMouseMove);
    
    // Mouse up
    document.addEventListener('mouseup', () => {
        if (isDragging || isResizing) {
            // Reset visual feedback
            selection.style.cursor = 'move';
            selection.style.transition = 'box-shadow 0.2s ease';
            document.body.style.cursor = 'default';
            
            // Reset handle scales
            handles.forEach(handle => {
                handle.style.transform = handle.style.transform.replace(/scale\([^)]*\)/, '');
            });
        }
        
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
    });
    
    // Cancel button
    document.getElementById('cropCancel').addEventListener('click', () => {
        closeCropModal();
    });
    
    // Apply button
    document.getElementById('cropApply').addEventListener('click', () => {
        applyCrop();
    });
    
    // Close on overlay click
    cropModal.addEventListener('click', (e) => {
        if (e.target === cropModal) {
            closeCropModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleCropKeyboard);
};

// Handle Keyboard Shortcuts for Cropping
const handleCropKeyboard = (e) => {
    if (!cropModal || cropModal.style.display === 'none') return;
    
    switch (e.key) {
        case 'Escape':
            closeCropModal();
            break;
        case 'Enter':
            applyCrop();
            break;
        case 'ArrowLeft':
            if (e.shiftKey) {
                cropSelection.width = Math.max(80, cropSelection.width - 10);
            } else {
                cropSelection.x = Math.max(0, cropSelection.x - 5);
            }
            updateCropSelection();
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (e.shiftKey) {
                cropSelection.width = Math.min(cropCanvas.width - cropSelection.x, cropSelection.width + 10);
            } else {
                cropSelection.x = Math.min(cropCanvas.width - cropSelection.width, cropSelection.x + 5);
            }
            updateCropSelection();
            e.preventDefault();
            break;
        case 'ArrowUp':
            if (e.shiftKey) {
                cropSelection.height = Math.max(80, cropSelection.height - 10);
            } else {
                cropSelection.y = Math.max(0, cropSelection.y - 5);
            }
            updateCropSelection();
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (e.shiftKey) {
                cropSelection.height = Math.min(cropCanvas.height - cropSelection.y, cropSelection.height + 10);
            } else {
                cropSelection.y = Math.min(cropCanvas.height - cropSelection.height, cropSelection.y + 5);
            }
            updateCropSelection();
            e.preventDefault();
            break;
    }
};

// Handle Mouse Move for Cropping
const handleCropMouseMove = (e) => {
    if (!isDragging && !isResizing) return;
    
    const containerRect = document.querySelector('.crop-container').getBoundingClientRect();
    const canvasRect = cropCanvas.getBoundingClientRect();
    
    // Calculate offset from canvas to container
    const offsetX = canvasRect.left - containerRect.left;
    const offsetY = canvasRect.top - containerRect.top;
    
    if (isDragging) {
        // Move selection with smooth constraints
        let newX = e.clientX - containerRect.left - offsetX - dragStart.x;
        let newY = e.clientY - containerRect.top - offsetY - dragStart.y;
        
        // Constrain to canvas with smooth boundaries
        newX = Math.max(0, Math.min(newX, cropCanvas.width - cropSelection.width));
        newY = Math.max(0, Math.min(newY, cropCanvas.height - cropSelection.height));
        
        cropSelection.x = newX;
        cropSelection.y = newY;
        
    } else if (isResizing) {
        // Resize selection with improved logic
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        let newX = cropSelection.x;
        let newY = cropSelection.y;
        let newWidth = cropSelection.width;
        let newHeight = cropSelection.height;
        
        switch (resizeHandle) {
            case 'crop-handle-se':
                newWidth = Math.max(80, Math.min(cropCanvas.width - cropSelection.x, cropSelection.width + deltaX));
                newHeight = Math.max(80, Math.min(cropCanvas.height - cropSelection.y, cropSelection.height + deltaY));
                break;
            case 'crop-handle-sw':
                newWidth = Math.max(80, cropSelection.width - deltaX);
                newHeight = Math.max(80, Math.min(cropCanvas.height - cropSelection.y, cropSelection.height + deltaY));
                newX = Math.max(0, Math.min(cropSelection.x + deltaX, cropSelection.x + cropSelection.width - 80));
                break;
            case 'crop-handle-ne':
                newWidth = Math.max(80, Math.min(cropCanvas.width - cropSelection.x, cropSelection.width + deltaX));
                newHeight = Math.max(80, cropSelection.height - deltaY);
                newY = Math.max(0, Math.min(cropSelection.y + deltaY, cropSelection.y + cropSelection.height - 80));
                break;
            case 'crop-handle-nw':
                newWidth = Math.max(80, cropSelection.width - deltaX);
                newHeight = Math.max(80, cropSelection.height - deltaY);
                newX = Math.max(0, Math.min(cropSelection.x + deltaX, cropSelection.x + cropSelection.width - 80));
                newY = Math.max(0, Math.min(cropSelection.y + deltaY, cropSelection.y + cropSelection.height - 80));
                break;
            case 'crop-handle-n':
                newHeight = Math.max(80, cropSelection.height - deltaY);
                newY = Math.max(0, Math.min(cropSelection.y + deltaY, cropSelection.y + cropSelection.height - 80));
                break;
            case 'crop-handle-s':
                newHeight = Math.max(80, Math.min(cropCanvas.height - cropSelection.y, cropSelection.height + deltaY));
                break;
            case 'crop-handle-w':
                newWidth = Math.max(80, cropSelection.width - deltaX);
                newX = Math.max(0, Math.min(cropSelection.x + deltaX, cropSelection.x + cropSelection.width - 80));
                break;
            case 'crop-handle-e':
                newWidth = Math.max(80, Math.min(cropCanvas.width - cropSelection.x, cropSelection.width + deltaX));
                break;
        }
        
        // Update selection
        cropSelection.x = newX;
        cropSelection.y = newY;
        cropSelection.width = newWidth;
        cropSelection.height = newHeight;
        
        dragStart = { x: e.clientX, y: e.clientY };
    }
    
    updateCropSelection();
};

// Apply Crop
const applyCrop = () => {
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    
    // Calculate scale factors
    const scaleX = cropImage.width / cropCanvas.width;
    const scaleY = cropImage.height / cropCanvas.height;
    
    // Set cropped canvas size
    const croppedWidth = cropSelection.width * scaleX;
    const croppedHeight = cropSelection.height * scaleY;
    
    croppedCanvas.width = croppedWidth;
    croppedCanvas.height = croppedHeight;
    
    // Draw cropped section
    croppedCtx.drawImage(
        cropImage,
        cropSelection.x * scaleX,
        cropSelection.y * scaleY,
        croppedWidth,
        croppedHeight,
        0,
        0,
        croppedWidth,
        croppedHeight
    );
    
    // Convert to blob and create file
    croppedCanvas.toBlob((blob) => {
        if (blob) {
            const croppedFile = new File(
                [blob],
                'cropped_image.jpg',
                { type: 'image/jpeg', lastModified: Date.now() }
            );
            
            uploadedImageFile = croppedFile;
            
            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                imageUploadArea.querySelector('.upload-placeholder').style.display = 'none';
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(croppedFile);
            
            showMessage(
                `Image successfully cropped! Size: ${Math.round(croppedWidth)}x${Math.round(croppedHeight)}px`,
                'success',
                'Image Ready! ✂️'
            );
            
            closeCropModal();
        }
    }, 'image/jpeg', 0.9);
};

// Close Crop Modal
const closeCropModal = () => {
    cropModal.style.display = 'none';
    cropModal.classList.remove('show');
    
    // Clean up event listeners
    document.removeEventListener('mousemove', handleCropMouseMove);
    document.removeEventListener('keydown', handleCropKeyboard);
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
const validateBlogForm = () => {
    console.log('🔍 Starting form validation...');
    clearErrors();
    let isValid = true;
    
    console.log('📝 Title value:', titleInput?.value);
    if (!titleInput.value.trim()) {
        console.log('❌ Title validation failed: empty');
        showFieldError(titleInput, 'Title is required');
        isValid = false;
    } else if (titleInput.value.length > 100) {
        console.log('❌ Title validation failed: too long');
        showFieldError(titleInput, 'Title must be less than 100 characters');
        isValid = false;
    } else {
        console.log('✅ Title validation passed');
    }
    
    const categorySelect = document.getElementById('blogCategory');
    console.log('📂 Category value:', categorySelect?.value);
    if (!categorySelect.value) {
        console.log('❌ Category validation failed: not selected');
        showFieldError(categorySelect, 'Please select a category');
        isValid = false;
    } else {
        console.log('✅ Category validation passed');
    }
    
    console.log('📄 Excerpt value length:', excerptTextarea?.value?.length);
    if (!excerptTextarea.value.trim()) {
        console.log('❌ Excerpt validation failed: empty');
        showFieldError(excerptTextarea, 'Blog description is required');
        isValid = false;
    } else if (excerptTextarea.value.length < 20) {
        console.log('❌ Excerpt validation failed: too short');
        showFieldError(excerptTextarea, 'Description must be at least 20 characters');
        isValid = false;
    } else if (excerptTextarea.value.length > 300) {
        console.log('❌ Excerpt validation failed: too long');
        showFieldError(excerptTextarea, 'Description must be less than 300 characters');
        isValid = false;
    } else {
        console.log('✅ Excerpt validation passed');
    }
    
    console.log('📄 Content value length:', contentTextarea?.value?.length);
    if (!contentTextarea.value.trim()) {
        console.log('❌ Content validation failed: empty');
        showFieldError(contentTextarea, 'Content is required');
        isValid = false;
    } else if (contentTextarea.value.length < 50) {
        console.log('❌ Content validation failed: too short');
        showFieldError(contentTextarea, 'Content must be at least 50 characters');
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
        showMessage('Please log in to save draft.', 'error', 'Login Required');
        return;
    }
    
    saveDraftBtn.classList.add('loading');
    saveDraftBtn.disabled = true;
    
    showMessage('Saving draft...', 'info', 'Process Started');
    
    try {
        const postData = await preparePostData(true);
        const result = await saveBlogPost(postData);
        
        if (result.success) {
            showMessage('Draft saved successfully! You can come back and edit it anytime.', 'success', 'Draft Saved');
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error saving draft:', error);
        showMessage(`A problem occurred while saving draft: ${error.message}`, 'error', 'Save Error');
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
        showMessage('Please log in to publish blog post.', 'error', 'Login Required');
        return;
    }
    
    console.log('✅ User authenticated, validating form...');
    if (!validateBlogForm()) {
        console.log('❌ Form validation failed');
        showMessage('Please fill in all required fields and fix errors.', 'warning', 'Form Incomplete');
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
    showMessage('Publishing blog post...', 'info', 'Publishing');
    
    try {
        console.log('📦 Preparing post data...');
        const postData = await preparePostData(false);
        console.log('📦 Post data prepared:', postData);
        
        console.log('💾 Saving to database...');
        const result = await saveBlogPost(postData);
        console.log('💾 Save result:', result);
        
        if (result.success) {
            console.log('✅ Post saved successfully');
            showMessage('Your blog post has been successfully published! All users can now read it. Redirecting to blogs page...', 'success', 'Published!');
            setTimeout(() => {
                console.log('🔄 Redirecting to blogs page...');
                window.location.href = 'blogs.html';
            }, 3000);
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('❌ Error publishing post:', error);
        showMessage(`A problem occurred while publishing blog post: ${error.message}`, 'error', 'Publishing Error');
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
    
    // Use new tag system
    const tags = getSelectedTags();
    
    let imageUrl = null;
    if (uploadedImageFile) {
        console.log('📸 Uploading image...');
        try {
            imageUrl = await uploadImage(uploadedImageFile);
            console.log('📸 Image uploaded:', imageUrl);
        } catch (uploadError) {
            console.error('📸 Image upload failed, continuing without image:', uploadError);
            // Show warning but don't stop the post creation
            if (window.toast) {
                window.toast.warning('Image could not be uploaded, blog post continues without image: ' + uploadError.message);
            }
            // Continue without image
            imageUrl = null;
        }
    }
    
    const authorName = currentUser.user_metadata?.display_name || 
                      `${currentUser.user_metadata?.first_name || ''} ${currentUser.user_metadata?.last_name || ''}`.trim() || 
                      currentUser.email;
    
    const postData = {
        title: formData.get('title').trim(),
        excerpt: formData.get('excerpt').trim(),
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
        console.log('📸 Starting image upload:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        // Validate file type again
        if (!file.type.startsWith('image/')) {
            throw new Error('Invalid file type: ' + file.type);
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('File too large: ' + (file.size / 1024 / 1024).toFixed(2) + 'MB');
        }

        const fileExt = file.name.split('.').pop().toLowerCase();
        const fileName = `blog-images/${currentUser.id}/${Date.now()}.${fileExt}`;
        
        console.log('📸 Uploading to path:', fileName);

        // Check if bucket exists and is accessible
        const { data: bucketData, error: bucketError } = await window.supabaseClient.storage
            .from('blog-images')
            .list('', { limit: 1 });

        if (bucketError) {
            console.error('❌ Bucket access error:', bucketError);
            throw new Error('Storage bucket access error: ' + bucketError.message);
        }

        console.log('✅ Bucket accessible, uploading file...');

        // Upload the file
        const { data, error } = await window.supabaseClient.storage
            .from('blog-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) {
            console.error('❌ Upload error:', error);
            throw new Error('Image upload error: ' + error.message);
        }

        console.log('✅ Upload successful:', data);
        
        // Get public URL
        const { data: urlData } = window.supabaseClient.storage
            .from('blog-images')
            .getPublicUrl(fileName);
        
        console.log('✅ Public URL generated:', urlData.publicUrl);
        return urlData.publicUrl;
        
    } catch (error) {
        console.error('❌ Image upload error details:', error);
        
        // Provide more specific error messages
        if (error.message.includes('not allowed to perform this operation')) {
            throw new Error('You do not have permission to upload images. Please log in and try again.');
        } else if (error.message.includes('File size')) {
            throw new Error('Image size too large. Maximum 5MB allowed.');
        } else if (error.message.includes('not found')) {
            throw new Error('Cannot access image storage. Please try again later.');
        } else {
            throw new Error('Error occurred while uploading image: ' + error.message);
        }
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
                window.toast.success(message, title || 'Success!');
                break;
            case 'error':
                window.toast.error(message, title || 'Error!');
                break;
            case 'warning':
                window.toast.warning(message, title || 'Warning!');
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
    showMessage(message, 'error', 'Form Error');
    
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

// Tag System Event Listeners
const setupTagSystemListeners = () => {
    console.log('🏷️ Setting up tag system listeners...');
    
    if (!tagInput || !tagsDisplay || !tagsSuggestions) {
        console.error('❌ Tag system elements not found');
        return;
    }
    
    // Tag input event listeners
    tagInput.addEventListener('keydown', handleTagInput);
    tagInput.addEventListener('input', handleTagInputChange);
    
    // Suggestion chips click handlers
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const tag = chip.dataset.tag;
            if (tag && !chip.classList.contains('used')) {
                addTag(tag);
            }
        });
    });
    
    // Click on container to focus input
    const tagsContainer = document.querySelector('.tags-input-container');
    if (tagsContainer) {
        tagsContainer.addEventListener('click', (e) => {
            if (e.target === tagsContainer || e.target === tagsDisplay) {
                tagInput.focus();
            }
        });
    }
    
    console.log('✅ Tag system listeners setup complete');
};

// Handle tag input keydown events
const handleTagInput = (e) => {
    const value = tagInput.value.trim();
    
    if (e.key === 'Enter') {
        e.preventDefault();
        if (value) {
            addTag(value);
        }
    } else if (e.key === 'Backspace' && !value && selectedTags.length > 0) {
        // Remove last tag when backspace on empty input
        removeTag(selectedTags[selectedTags.length - 1]);
    } else if (e.key === ',' || e.key === ';') {
        e.preventDefault();
        if (value) {
            addTag(value);
        }
    }
};

// Handle tag input change for validation
const handleTagInputChange = (e) => {
    const value = e.target.value;
    
    // Clear error state
    tagInput.classList.remove('error');
    const errorMsg = document.querySelector('.tag-error-message');
    if (errorMsg) errorMsg.remove();
    
    // Limit input length
    if (value.length > MAX_TAG_LENGTH) {
        e.target.value = value.substring(0, MAX_TAG_LENGTH);
        showTagError('Tag can be maximum 30 characters');
    }
    
    // Prevent certain characters
    const invalidChars = /[<>\/\\|"'`]/;
    if (invalidChars.test(value)) {
        e.target.value = value.replace(invalidChars, '');
        showTagError('Invalid characters cannot be used');
    }
};

// Add a new tag
const addTag = (tagText) => {
    const tag = tagText.toLowerCase().trim().replace(/\s+/g, '-');
    
    // Validation
    if (!tag) return;
    
    if (selectedTags.length >= MAX_TAGS) {
        showTagError(`You can add maximum ${MAX_TAGS} tags`);
        return;
    }
    
    if (selectedTags.includes(tag)) {
        showTagError('This tag has already been added');
        return;
    }
    
    if (tag.length > MAX_TAG_LENGTH) {
        showTagError('Tag is too long');
        return;
    }
    
    if (tag.length < 2) {
        showTagError('Tag must be at least 2 characters');
        return;
    }
    
    // Add tag
    selectedTags.push(tag);
    tagInput.value = '';
    
    // Update UI
    renderTags();
    updateHiddenInput();
    updateSuggestions();
    updateTagCount();
    
    // Success feedback
    if (window.toast) {
                    window.toast.success(`"${tag}" tag added`, 'Tag Added');
    }
    
    console.log('🏷️ Tag added:', tag);
};

// Remove a tag
const removeTag = (tagToRemove) => {
    const index = selectedTags.indexOf(tagToRemove);
    if (index > -1) {
        selectedTags.splice(index, 1);
        
        // Update UI
        renderTags();
        updateHiddenInput();
        updateSuggestions();
        updateTagCount();
        
        // Focus input
        tagInput.focus();
        
        console.log('🏷️ Tag removed:', tagToRemove);
    }
};

// Render tags in the display area
const renderTags = () => {
    tagsDisplay.innerHTML = selectedTags.map(tag => `
        <span class="tag-chip">
            ${tag}
            <button type="button" class="tag-chip-remove" onclick="removeTag('${tag}')" aria-label="Remove ${tag}">
                ×
            </button>
        </span>
    `).join('');
};

// Update hidden input for form submission
const updateHiddenInput = () => {
    if (blogTagsHidden) {
        blogTagsHidden.value = selectedTags.join(',');
    }
};

// Update suggestion chips status
const updateSuggestions = () => {
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        const tag = chip.dataset.tag;
        if (selectedTags.includes(tag)) {
            chip.classList.add('used');
        } else {
            chip.classList.remove('used');
        }
    });
};

// Update tag count display
const updateTagCount = () => {
    let countElement = document.querySelector('.tags-count');
    
    if (!countElement) {
        countElement = document.createElement('div');
        countElement.className = 'tags-count';
        tagsSuggestions.parentNode.insertBefore(countElement, tagsSuggestions.nextSibling);
    }
    
    countElement.textContent = `${selectedTags.length}/${MAX_TAGS} tags`;
    
    if (selectedTags.length >= MAX_TAGS) {
        countElement.classList.add('max-reached');
        tagInput.placeholder = 'Maximum tag limit reached';
        tagInput.disabled = true;
    } else {
        countElement.classList.remove('max-reached');
        tagInput.placeholder = 'Type a tag and press Enter';
        tagInput.disabled = false;
    }
};

// Show tag-specific error
const showTagError = (message) => {
    // Remove existing error
    const existingError = document.querySelector('.tag-error-message');
    if (existingError) existingError.remove();
    
    // Add error class to input
    tagInput.classList.add('error');
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'tag-error-message';
    errorDiv.textContent = message;
    
    // Insert after tags container
    const tagsContainer = document.querySelector('.tags-input-container');
    tagsContainer.parentNode.insertBefore(errorDiv, tagsContainer.nextSibling);
    
    // Remove error after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
        tagInput.classList.remove('error');
    }, 3000);
    
    // Show toast
    if (window.toast) {
        window.toast.error(message, 'Tag Error');
    }
};

// Get tags for form submission (update preparePostData to use this)
const getSelectedTags = () => {
    return selectedTags;
};

// Make removeTag globally accessible for onclick handlers
window.removeTag = removeTag; 