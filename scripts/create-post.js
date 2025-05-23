/**
 * Post Editor Class
 * Simple version for blog post creation
 */
class PostEditor {
    constructor() {
        this.currentUser = null;
        this.quill = null;
        this.isDraft = false;
        
        this.init();
    }

    /**
     * Initialize post editor
     */
    async init() {
        try {
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
        } catch (error) {
            console.error('Error initializing post editor:', error);
        }
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
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['blockquote', 'link'],
            ['clean']
        ];

        this.quill = new Quill('#post-content', {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions
            },
            placeholder: 'Start writing your amazing post...'
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

        // Title input - auto generate slug
        const titleInput = document.getElementById('post-title');
        if (titleInput) {
            titleInput.addEventListener('input', () => {
                this.generateSlug();
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
            alert('Post title is required');
            return;
        }

        if (!content || content.length < 10) {
            alert('Post content is too short');
            return;
        }

        await this.savePost();
    }

    /**
     * Save post to database
     */
    async savePost() {
        try {
            // Show loading
            this.showLoading(true);

            // Prepare post data
            const postData = this.getPostData();
            console.log('Saving post data:', postData);

            // Save to database
            const { data, error } = await supabaseClient
                .from('posts')
                .insert([postData])
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Post saved successfully:', data);
            
            const action = this.isDraft ? 'saved as draft' : 'published';
            alert(`Post ${action} successfully!`);

            // Redirect to post page
            setTimeout(() => {
                window.location.href = `post.html?id=${data.id}`;
            }, 1000);

        } catch (error) {
            console.error('Error saving post:', error);
            alert('Failed to save post: ' + error.message);
        } finally {
            this.showLoading(false);
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
     * Show/hide loading state
     */
    showLoading(show) {
        const buttons = document.querySelectorAll('#save-draft-btn, #publish-btn');
        buttons.forEach(btn => {
            btn.disabled = show;
            btn.textContent = show ? 'Saving...' : btn.id === 'save-draft-btn' ? 'Save Draft' : 'Publish';
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.postEditor = new PostEditor();
}); 