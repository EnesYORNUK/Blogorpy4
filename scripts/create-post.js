/**
 * Post Editor Class
 * Handles post creation and editing functionality
 */
class PostEditor {
    constructor() {
        this.currentUser = null;
        this.quill = null;
        this.tags = [];
        this.featuredImageFile = null;
        this.featuredImageUrl = null;
        this.isDraft = false;
        
        this.init();
    }

    /**
     * Initialize post editor
     */
    async init() {
        // Check authentication
        const user = await this.getCurrentUser();
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        this.currentUser = user;
        this.initializeEditor();
        this.setupEventListeners();
        this.setupCharacterCounters();
        this.setupImageUpload();
        this.setupTagsInput();
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await SupabaseConfig.client.auth.getUser();
            if (error) throw error;
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Initialize Quill rich text editor
     */
    initializeEditor() {
        const toolbarOptions = [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['clean']
        ];

        this.quill = new Quill('#post-content', {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions
            },
            placeholder: 'Start writing your amazing post...'
        });

        // Auto-save on content change
        this.quill.on('text-change', () => {
            this.autoSave();
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Save draft button
        const saveDraftBtn = document.getElementById('save-draft-btn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.saveDraft());
        }

        // Publish button
        const publishBtn = document.getElementById('publish-btn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => this.publishPost());
        }

        // Form submission
        const postForm = document.getElementById('post-form');
        if (postForm) {
            postForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Title change - auto generate slug
        const titleInput = document.getElementById('post-title');
        if (titleInput) {
            titleInput.addEventListener('input', () => {
                this.generateSlug();
            });
        }

        // Toggle switches
        const publishedToggle = document.getElementById('published');
        if (publishedToggle) {
            publishedToggle.addEventListener('change', (e) => {
                this.isDraft = !e.target.checked;
            });
        }
    }

    /**
     * Setup character counters
     */
    setupCharacterCounters() {
        const inputs = [
            { input: '#post-title', counter: '#title-char-count' },
            { input: '#post-excerpt', counter: '#excerpt-char-count' },
            { input: '#meta-description', counter: '#meta-char-count' }
        ];

        inputs.forEach(({ input, counter }) => {
            const inputElement = document.querySelector(input);
            const counterElement = document.querySelector(counter);
            
            if (inputElement && counterElement) {
                inputElement.addEventListener('input', () => {
                    counterElement.textContent = inputElement.value.length;
                });
            }
        });
    }

    /**
     * Setup image upload functionality
     */
    setupImageUpload() {
        const uploadArea = document.getElementById('upload-area');
        const featuredImageInput = document.getElementById('featured-image');
        const imagePreview = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');
        const changeImageBtn = document.getElementById('change-image');
        const removeImageBtn = document.getElementById('remove-image');

        // Click to upload
        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                featuredImageInput.click();
            });
        }

        // File input change
        if (featuredImageInput) {
            featuredImageInput.addEventListener('change', (e) => {
                this.handleImageSelect(e.target.files[0]);
            });
        }

        // Change image button
        if (changeImageBtn) {
            changeImageBtn.addEventListener('click', () => {
                featuredImageInput.click();
            });
        }

        // Remove image button
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => {
                this.removeImage();
            });
        }

        // Drag and drop
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('drag-over');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleImageSelect(files[0]);
                }
            });
        }
    }

    /**
     * Setup tags input functionality
     */
    setupTagsInput() {
        const tagInput = document.getElementById('tag-input');
        const tagsContainer = document.getElementById('tags-container');

        if (tagInput) {
            tagInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    this.addTag(tagInput.value.trim());
                    tagInput.value = '';
                }
            });

            tagInput.addEventListener('blur', () => {
                if (tagInput.value.trim()) {
                    this.addTag(tagInput.value.trim());
                    tagInput.value = '';
                }
            });
        }
    }

    /**
     * Handle image selection
     */
    handleImageSelect(file) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showToast('Error', 'Please select a valid image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            this.showToast('Error', 'Image size must be less than 5MB', 'error');
            return;
        }

        this.featuredImageFile = file;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const uploadArea = document.getElementById('upload-area');
            const imagePreview = document.getElementById('image-preview');
            const previewImg = document.getElementById('preview-img');

            previewImg.src = e.target.result;
            uploadArea.classList.add('hidden');
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    /**
     * Remove featured image
     */
    removeImage() {
        this.featuredImageFile = null;
        this.featuredImageUrl = null;

        const uploadArea = document.getElementById('upload-area');
        const imagePreview = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');

        previewImg.src = '';
        uploadArea.classList.remove('hidden');
        imagePreview.classList.add('hidden');
    }

    /**
     * Add tag
     */
    addTag(tagText) {
        if (!tagText || this.tags.includes(tagText.toLowerCase())) return;

        const tag = tagText.toLowerCase();
        this.tags.push(tag);

        const tagsContainer = document.getElementById('tags-container');
        const tagElement = document.createElement('div');
        tagElement.className = 'tag';
        tagElement.innerHTML = `
            <span>${tag}</span>
            <button type="button" class="tag-remove" data-tag="${tag}">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add remove listener
        tagElement.querySelector('.tag-remove').addEventListener('click', () => {
            this.removeTag(tag);
        });

        tagsContainer.appendChild(tagElement);
    }

    /**
     * Remove tag
     */
    removeTag(tag) {
        this.tags = this.tags.filter(t => t !== tag);
        
        const tagsContainer = document.getElementById('tags-container');
        const tagElement = tagsContainer.querySelector(`[data-tag="${tag}"]`);
        if (tagElement) {
            tagElement.parentElement.remove();
        }
    }

    /**
     * Generate URL slug from title
     */
    generateSlug() {
        const titleInput = document.getElementById('post-title');
        const slugInput = document.getElementById('post-slug');
        
        if (!titleInput || !slugInput || slugInput.value) return;

        const slug = titleInput.value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);

        slugInput.value = slug;
    }

    /**
     * Upload featured image to Supabase
     */
    async uploadFeaturedImage() {
        if (!this.featuredImageFile) return null;

        try {
            const fileExt = this.featuredImageFile.name.split('.').pop();
            const fileName = `${this.currentUser.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await SupabaseConfig.client.storage
                .from('images')
                .upload(fileName, this.featuredImageFile);

            if (uploadError) throw uploadError;

            const { data } = SupabaseConfig.client.storage
                .from('images')
                .getPublicUrl(fileName);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    /**
     * Save post as draft
     */
    async saveDraft() {
        this.isDraft = true;
        await this.savePost();
    }

    /**
     * Publish post
     */
    async publishPost() {
        this.isDraft = false;
        
        // Validate required fields
        const title = document.getElementById('post-title').value.trim();
        const content = this.quill.getText().trim();

        if (!title) {
            this.showToast('Error', 'Post title is required', 'error');
            return;
        }

        if (!content || content.length < 50) {
            this.showToast('Error', 'Post content must be at least 50 characters long', 'error');
            return;
        }

        await this.savePost();
    }

    /**
     * Save post to database
     */
    async savePost() {
        try {
            this.showLoadingOverlay();

            // Upload featured image if exists
            if (this.featuredImageFile) {
                this.featuredImageUrl = await this.uploadFeaturedImage();
            }

            // Prepare post data
            const postData = this.getPostData();

            // Save to database
            const { data, error } = await SupabaseConfig.client
                .from('posts')
                .insert([postData])
                .select()
                .single();

            if (error) throw error;

            const action = this.isDraft ? 'saved as draft' : 'published';
            this.showToast('Success', `Post ${action} successfully!`, 'success');

            // Redirect to post page
            setTimeout(() => {
                window.location.href = `post.html?id=${data.id}`;
            }, 1500);

        } catch (error) {
            console.error('Error saving post:', error);
            this.showToast('Error', 'Failed to save post', 'error');
        } finally {
            this.hideLoadingOverlay();
        }
    }

    /**
     * Get post data for saving
     */
    getPostData() {
        const title = document.getElementById('post-title').value.trim();
        const excerpt = document.getElementById('post-excerpt').value.trim();
        const category = document.getElementById('post-category').value;
        const metaDescription = document.getElementById('meta-description').value.trim();
        const slug = document.getElementById('post-slug').value.trim();
        const commentsEnabled = document.getElementById('comments-enabled').checked;

        const content = this.quill.root.innerHTML;
        const plainTextContent = this.quill.getText();

        return {
            title,
            content,
            excerpt: excerpt || this.generateExcerpt(plainTextContent),
            featured_image: this.featuredImageUrl,
            category: category || null,
            tags: this.tags.length > 0 ? this.tags : null,
            meta_description: metaDescription,
            slug: slug || this.generateSlugFromTitle(title),
            published: !this.isDraft,
            comments_enabled: commentsEnabled,
            author_id: this.currentUser.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }

    /**
     * Generate excerpt from content
     */
    generateExcerpt(content, maxLength = 300) {
        if (!content) return '';
        
        const plainText = content.replace(/<[^>]*>/g, '').trim();
        
        if (plainText.length <= maxLength) {
            return plainText;
        }
        
        return plainText.substring(0, maxLength).trim() + '...';
    }

    /**
     * Generate slug from title
     */
    generateSlugFromTitle(title) {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);
    }

    /**
     * Auto-save functionality
     */
    autoSave() {
        // Clear existing timeout
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        // Set new timeout
        this.autoSaveTimeout = setTimeout(() => {
            this.saveToLocalStorage();
        }, 2000);
    }

    /**
     * Save to local storage
     */
    saveToLocalStorage() {
        const data = {
            title: document.getElementById('post-title').value,
            excerpt: document.getElementById('post-excerpt').value,
            content: this.quill.root.innerHTML,
            category: document.getElementById('post-category').value,
            tags: this.tags,
            metaDescription: document.getElementById('meta-description').value,
            slug: document.getElementById('post-slug').value,
            timestamp: Date.now()
        };

        localStorage.setItem('blog_post_draft', JSON.stringify(data));
    }

    /**
     * Load from local storage
     */
    loadFromLocalStorage() {
        const saved = localStorage.getItem('blog_post_draft');
        if (!saved) return;

        try {
            const data = JSON.parse(saved);
            
            // Check if data is recent (less than 24 hours old)
            if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('blog_post_draft');
                return;
            }

            // Ask user if they want to restore
            if (confirm('We found a draft from your previous session. Would you like to restore it?')) {
                this.restoreDraft(data);
            }
        } catch (error) {
            console.error('Error loading draft:', error);
            localStorage.removeItem('blog_post_draft');
        }
    }

    /**
     * Restore draft data
     */
    restoreDraft(data) {
        document.getElementById('post-title').value = data.title || '';
        document.getElementById('post-excerpt').value = data.excerpt || '';
        document.getElementById('post-category').value = data.category || '';
        document.getElementById('meta-description').value = data.metaDescription || '';
        document.getElementById('post-slug').value = data.slug || '';

        if (data.content) {
            this.quill.root.innerHTML = data.content;
        }

        if (data.tags) {
            data.tags.forEach(tag => this.addTag(tag));
        }

        // Update character counters
        this.updateCharacterCounters();

        this.showToast('Success', 'Draft restored successfully', 'success');
    }

    /**
     * Update character counters
     */
    updateCharacterCounters() {
        const inputs = [
            { input: '#post-title', counter: '#title-char-count' },
            { input: '#post-excerpt', counter: '#excerpt-char-count' },
            { input: '#meta-description', counter: '#meta-char-count' }
        ];

        inputs.forEach(({ input, counter }) => {
            const inputElement = document.querySelector(input);
            const counterElement = document.querySelector(counter);
            
            if (inputElement && counterElement) {
                counterElement.textContent = inputElement.value.length;
            }
        });
    }

    /**
     * Show loading overlay
     */
    showLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    /**
     * Show toast notification
     */
    showToast(title, message, type = 'success') {
        // Use existing toast system from auth.js or create simple alert
        if (window.authManager && typeof window.authManager.showToast === 'function') {
            window.authManager.showToast(title, message, type);
        } else {
            alert(`${title}: ${message}`);
        }
    }

    /**
     * Handle form submission
     */
    handleFormSubmit() {
        const publishedToggle = document.getElementById('published');
        if (publishedToggle && publishedToggle.checked) {
            this.publishPost();
        } else {
            this.saveDraft();
        }
    }
}

// Export for global use
window.PostEditor = PostEditor; 