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
        this.loadFromLocalStorage();
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabaseClient.auth.getUser();
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
                this.autoSave();
            });
        }

        // Other inputs for auto-save
        const inputs = ['post-excerpt', 'meta-description', 'post-slug'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.autoSave());
            }
        });
    }

    /**
     * Setup character counters
     */
    setupCharacterCounters() {
        const inputs = [
            { input: '#post-title', counter: '#title-char-count', max: 100 },
            { input: '#post-excerpt', counter: '#excerpt-char-count', max: 300 },
            { input: '#meta-description', counter: '#meta-char-count', max: 160 }
        ];

        inputs.forEach(({ input, counter, max }) => {
            const inputElement = document.querySelector(input);
            const counterElement = document.querySelector(counter);
            
            if (inputElement && counterElement) {
                inputElement.addEventListener('input', () => {
                    const length = inputElement.value.length;
                    counterElement.textContent = `${length}/${max}`;
                    
                    // Add warning if approaching limit
                    if (length > max * 0.9) {
                        counterElement.style.color = '#e74c3c';
                    } else {
                        counterElement.style.color = '#666';
                    }
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
        const removeImageBtn = document.getElementById('remove-image');

        // Click to upload
        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                featuredImageInput?.click();
            });
        }

        // File input change
        if (featuredImageInput) {
            featuredImageInput.addEventListener('change', (e) => {
                this.handleImageSelect(e.target.files[0]);
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

    /**     * Setup tags input     */    setupTagsInput() {        const tagsInput = document.getElementById('tag-input');        const tagsContainer = document.getElementById('tags-container');                if (tagsInput) {            tagsInput.addEventListener('keydown', (e) => {                if (e.key === 'Enter' || e.key === ',') {                    e.preventDefault();                    const tagText = tagsInput.value.trim();                    if (tagText) {                        this.addTag(tagText);                        tagsInput.value = '';                    }                }            });        }    }

    /**
     * Handle image selection
     */
    handleImageSelect(file) {
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            this.showToast('Error', 'Please select a valid image file (JPEG, PNG, WebP)', 'error');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
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

            if (uploadArea && imagePreview && previewImg) {
                previewImg.src = e.target.result;
                uploadArea.style.display = 'none';
                imagePreview.style.display = 'block';
            }
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
        const featuredImageInput = document.getElementById('featured-image');

        if (uploadArea && imagePreview) {
            uploadArea.style.display = 'block';
            imagePreview.style.display = 'none';
        }

        if (featuredImageInput) {
            featuredImageInput.value = '';
        }
    }

    /**
     * Add tag
     */
    addTag(tagText) {
        const normalizedTag = tagText.toLowerCase().trim();
        
        // Check if tag already exists
        if (this.tags.includes(normalizedTag)) {
            this.showToast('Warning', 'Tag already exists', 'warning');
            return;
        }

        // Limit number of tags
        if (this.tags.length >= 5) {
            this.showToast('Warning', 'Maximum 5 tags allowed', 'warning');
            return;
        }

        this.tags.push(normalizedTag);
        this.renderTags();
        this.autoSave();
    }

    /**
     * Remove tag
     */
    removeTag(tag) {
        this.tags = this.tags.filter(t => t !== tag);
        this.renderTags();
        this.autoSave();
    }

        /**     * Render tags     */    renderTags() {        const tagsContainer = document.getElementById('tags-container');        if (!tagsContainer) return;        tagsContainer.innerHTML = this.tags.map(tag => `            <span class="tag">                ${tag}                <button type="button" onclick="postEditor.removeTag('${tag}')">&times;</button>            </span>        `).join('');    }

    /**
     * Generate slug from title
     */
    generateSlug() {
        const titleInput = document.getElementById('post-title');
        const slugInput = document.getElementById('post-slug');
        
        if (titleInput && slugInput && !slugInput.value) {
            const slug = this.generateSlugFromTitle(titleInput.value);
            slugInput.value = slug;
        }
    }

    /**
     * Upload featured image to Supabase
     */
    async uploadFeaturedImage() {
        if (!this.featuredImageFile) return null;

        try {
            const fileExt = this.featuredImageFile.name.split('.').pop();
            const fileName = `${this.currentUser.id}/${Date.now()}.${fileExt}`;

            const { data, error } = await supabaseClient.storage
                .from('images')
                .upload(fileName, this.featuredImageFile);

            if (error) throw error;

            const { data: { publicUrl } } = supabaseClient.storage
                .from('images')
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    /**
     * Save as draft
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
            
            console.log('Saving post data:', postData);

                                    // Save to database            const { data, error } = await supabaseClient                .from('posts')                .insert([postData])                .select()                .single();            if (error) {                console.error('Supabase error:', error);                throw error;            }            // Handle tags if any            if (this.tags.length > 0) {                try {                    await supabaseClient.rpc('handle_post_tags', {                        post_id: data.id,                        tag_names: this.tags                    });                } catch (tagError) {                    console.error('Error handling tags:', tagError);                    // Don't fail the whole operation for tag errors                }            }

            const action = this.isDraft ? 'saved as draft' : 'published';
            this.showToast('Success', `Post ${action} successfully!`, 'success');

            // Clear local storage draft
            localStorage.removeItem('blog_post_draft');

            // Redirect to post page
            setTimeout(() => {
                window.location.href = `post.html?id=${data.id}`;
            }, 1500);

        } catch (error) {
            console.error('Error saving post:', error);
            let errorMessage = 'Failed to save post';
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.error_description) {
                errorMessage = error.error_description;
            }
            
            this.showToast('Error', errorMessage, 'error');
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
        const metaDescription = document.getElementById('meta-description').value.trim();
        const slug = document.getElementById('post-slug').value.trim();

        const content = this.quill.root.innerHTML;
        const plainTextContent = this.quill.getText();

        return {
            title,
            content,
            excerpt: excerpt || this.generateExcerpt(plainTextContent),
            featured_image: this.featuredImageUrl,
            meta_description: metaDescription,
            slug: slug || this.generateSlugFromTitle(title),
            published: !this.isDraft,
            author_id: this.currentUser.id
        };
    }

    /**
     * Generate excerpt from content
     */
    generateExcerpt(content, maxLength = 150) {
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
        try {
            const data = {
                title: document.getElementById('post-title')?.value || '',
                excerpt: document.getElementById('post-excerpt')?.value || '',
                content: this.quill?.root?.innerHTML || '',
                tags: this.tags,
                metaDescription: document.getElementById('meta-description')?.value || '',
                slug: document.getElementById('post-slug')?.value || '',
                timestamp: Date.now()
            };

            localStorage.setItem('blog_post_draft', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
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
        if (data.title) document.getElementById('post-title').value = data.title;
        if (data.excerpt) document.getElementById('post-excerpt').value = data.excerpt;
        if (data.metaDescription) document.getElementById('meta-description').value = data.metaDescription;
        if (data.slug) document.getElementById('post-slug').value = data.slug;

        if (data.content && this.quill) {
            this.quill.root.innerHTML = data.content;
        }

        if (data.tags) {
            this.tags = data.tags;
            this.renderTags();
        }

        this.updateCharacterCounters();
    }

    /**
     * Update character counters
     */
    updateCharacterCounters() {
        const inputs = ['post-title', 'post-excerpt', 'meta-description'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.dispatchEvent(new Event('input'));
            }
        });
    }

    /**
     * Show loading overlay
     */
    showLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>Saving post...</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    /**
     * Hide loading overlay
     */
    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    /**
     * Show toast notification
     */
    showToast(title, message, type = 'success') {
        // Use existing toast system if available
        if (window.showToast) {
            window.showToast(title, message, type);
        } else {
            // Fallback to alert
            alert(`${title}: ${message}`);
        }
    }

    /**
     * Handle form submission
     */
    handleFormSubmit() {
        // Default to save as draft
        this.saveDraft();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.postEditor = new PostEditor();
}); 