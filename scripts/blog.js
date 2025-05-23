/**
 * Blog Management Module
 * 
 * Handles blog post CRUD operations, comments, likes, saved posts,
 * and search functionality using Supabase.
 */

class BlogManager {
    constructor() {
        this.postsPerPage = 6;
        this.currentPage = 1;
        this.currentSort = 'newest';
        this.currentSearch = '';
        this.isLoading = false;
        
        this.init();
    }
    
    /**
     * Initialize the blog manager
     */
    async init() {
        try {
            this.setupEventListeners();
            await this.loadPosts();
            console.log('Blog manager initialized successfully');
        } catch (error) {
            console.error('Error initializing blog manager:', error);
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchInput && searchBtn) {
            const debouncedSearch = SupabaseConfig.debounce(() => {
                this.handleSearch(searchInput.value);
            }, 500);
            
            searchInput.addEventListener('input', debouncedSearch);
            searchBtn.addEventListener('click', () => this.handleSearch(searchInput.value));
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(searchInput.value);
                }
            });
        }
        
        // Sort functionality
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSort(e.target.value);
            });
        }
        
        // Create post button
        const createPostBtn = document.getElementById('create-post-btn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => this.showPostEditor());
        }
        
        // Hero buttons
        const startReadingBtn = document.getElementById('start-reading');
        const startWritingBtn = document.getElementById('start-writing');
        
        if (startReadingBtn) {
            startReadingBtn.addEventListener('click', () => {
                document.getElementById('posts').scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        if (startWritingBtn) {
            startWritingBtn.addEventListener('click', () => {
                if (window.authManager && window.authManager.isAuthenticated()) {
                    this.showPostEditor();
                } else {
                    window.authManager?.showAuthModal('login');
                }
            });
        }
    }
    
    /**
     * Load posts from database
     * @param {number} page - Page number
     * @param {boolean} append - Whether to append to existing posts
     */
    async loadPosts(page = 1, append = false) {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            const postsGrid = document.getElementById('posts-grid');
            
            if (!append) {
                this.showLoadingState(postsGrid);
            }
            
            const { from, to } = SupabaseConfig.getPaginationParams(page, this.postsPerPage);
            
            let query = SupabaseConfig.client
                .from('posts')
                .select(`
                    *,
                    profiles (
                        id,
                        display_name,
                        avatar_url
                    ),
                    likes (count),
                    comments (count)
                `)
                .eq('published', true)
                .range(from, to);
            
            // Apply search filter
            if (this.currentSearch) {
                query = query.or(`title.ilike.%${this.currentSearch}%, content.ilike.%${this.currentSearch}%`);
            }
            
            // Apply sorting
            switch (this.currentSort) {
                case 'oldest':
                    query = query.order('created_at', { ascending: true });
                    break;
                case 'popular':
                    query = query.order('likes_count', { ascending: false });
                    break;
                default: // newest
                    query = query.order('created_at', { ascending: false });
                    break;
            }
            
            const { data: posts, error, count } = await query;
            
            if (error) throw error;
            
            if (!append) {
                this.renderPosts(posts);
                this.renderPagination(page, count);
            } else {
                this.appendPosts(posts);
            }
            
            this.currentPage = page;
            
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showErrorState('Failed to load posts. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }
    
    /**
     * Render posts in the grid
     * @param {Array} posts - Array of post objects
     */
    renderPosts(posts) {
        const postsGrid = document.getElementById('posts-grid');
        if (!postsGrid) return;
        
        if (!posts || posts.length === 0) {
            postsGrid.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-file-alt"></i>
                    <h3>No posts found</h3>
                    <p>${this.currentSearch ? 'Try adjusting your search terms.' : 'Be the first to create a post!'}</p>
                </div>
            `;
            return;
        }
        
        postsGrid.innerHTML = posts.map(post => this.createPostCard(post)).join('');
        
        // Add click listeners to post cards
        this.addPostCardListeners();
        
        // Animate post cards
        this.animatePostCards();
    }
    
    /**
     * Append posts to existing grid
     * @param {Array} posts - Array of post objects
     */
    appendPosts(posts) {
        const postsGrid = document.getElementById('posts-grid');
        if (!postsGrid || !posts || posts.length === 0) return;
        
        const newPostsHTML = posts.map(post => this.createPostCard(post)).join('');
        postsGrid.insertAdjacentHTML('beforeend', newPostsHTML);
        
        // Add click listeners to new post cards
        this.addPostCardListeners();
        
        // Animate new post cards
        this.animatePostCards();
    }
    
    /**
     * Create post card HTML
     * @param {Object} post - Post object
     * @returns {string} - Post card HTML
     */
    createPostCard(post) {
        const author = post.profiles || {};
        const authorName = author.display_name || 'Anonymous';
        const authorAvatar = this.getAvatarHTML(authorName);
        const excerpt = SupabaseConfig.generateExcerpt(post.content);
        const formattedDate = SupabaseConfig.formatRelativeTime(post.created_at);
        const likesCount = post.likes?.[0]?.count || 0;
        const commentsCount = post.comments?.[0]?.count || 0;
        
        return `
            <article class="post-card fade-in" data-post-id="${post.id}">
                <div class="post-card-image">
                    ${post.featured_image ? 
                        `<img src="${post.featured_image}" alt="${post.title}" loading="lazy">` :
                        '<div class="post-card-placeholder"></div>'
                    }
                </div>
                
                <div class="post-card-content">
                    <div class="post-card-meta">
                        <span class="post-category">${post.category || 'General'}</span>
                        <span class="post-date">${formattedDate}</span>
                    </div>
                    
                    <h3 class="post-card-title">${SupabaseConfig.sanitizeHTML(post.title)}</h3>
                    
                    <p class="post-card-excerpt">${SupabaseConfig.sanitizeHTML(excerpt)}</p>
                    
                    <div class="post-card-footer">
                        <div class="post-author">
                            <div class="author-avatar">${authorAvatar}</div>
                            <p class="author-name">${SupabaseConfig.sanitizeHTML(authorName)}</p>
                        </div>
                        
                        <div class="post-stats">
                            <div class="post-stat">
                                <i class="far fa-heart"></i>
                                <span>${likesCount}</span>
                            </div>
                            <div class="post-stat">
                                <i class="far fa-comment"></i>
                                <span>${commentsCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }
    
    /**
     * Add click listeners to post cards
     */
    addPostCardListeners() {
        const postCards = document.querySelectorAll('.post-card[data-post-id]');
        postCards.forEach(card => {
            if (!card.hasAttribute('data-listener-added')) {
                card.addEventListener('click', () => {
                    const postId = card.getAttribute('data-post-id');
                    this.navigateToPost(postId);
                });
                card.setAttribute('data-listener-added', 'true');
            }
        });
    }
    
    /**
     * Animate post cards
     */
    animatePostCards() {
        if (typeof gsap !== 'undefined') {
            gsap.from('.post-card:not(.animated)', {
                duration: 0.6,
                y: 50,
                opacity: 0,
                stagger: 0.1,
                ease: 'power2.out',
                onComplete: function() {
                    document.querySelectorAll('.post-card').forEach(card => {
                        card.classList.add('animated');
                    });
                }
            });
        } else {
            // Fallback CSS animation
            setTimeout(() => {
                document.querySelectorAll('.post-card:not(.visible)').forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('visible');
                    }, index * 100);
                });
            }, 100);
        }
    }
    
    /**
     * Navigate to post page
     * @param {string} postId - Post ID
     */
    navigateToPost(postId) {
        window.location.href = `post.html?id=${postId}`;
    }
    
    /**
     * Handle search
     * @param {string} query - Search query
     */
    async handleSearch(query) {
        this.currentSearch = query.trim();
        this.currentPage = 1;
        await this.loadPosts(1, false);
    }
    
    /**
     * Handle sort change
     * @param {string} sortType - Sort type
     */
    async handleSort(sortType) {
        this.currentSort = sortType;
        this.currentPage = 1;
        await this.loadPosts(1, false);
    }
    
    /**
     * Render pagination
     * @param {number} currentPage - Current page
     * @param {number} totalCount - Total number of posts
     */
    renderPagination(currentPage, totalCount) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;
        
        const totalPages = Math.ceil(totalCount / this.postsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        if (currentPage > 1) {
            paginationHTML += `
                <button class="pagination-btn" data-page="${currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
        } else {
            paginationHTML += `
                <button class="pagination-btn disabled">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
        }
        
        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            paginationHTML += `<button class="pagination-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                        data-page="${i}">${i}</button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
        }
        
        // Next button
        if (currentPage < totalPages) {
            paginationHTML += `
                <button class="pagination-btn" data-page="${currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        } else {
            paginationHTML += `
                <button class="pagination-btn disabled">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }
        
        paginationContainer.innerHTML = paginationHTML;
        
        // Add click listeners
        paginationContainer.querySelectorAll('.pagination-btn:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.getAttribute('data-page'));
                if (page && page !== currentPage) {
                    this.loadPosts(page, false);
                }
            });
        });
    }
    
    /**
     * Show post editor modal
     * @param {Object} post - Post object for editing (optional)
     */
    showPostEditor(post = null) {
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            window.authManager?.showAuthModal('login');
            return;
        }
        
        const editorModal = document.getElementById('editor-modal');
        const editorContainer = document.getElementById('editor-container');
        
        if (!editorModal || !editorContainer) return;
        
        const isEdit = !!post;
        
        editorContainer.innerHTML = `
            <div class="editor-header">
                <h3>${isEdit ? 'Edit Post' : 'Create New Post'}</h3>
            </div>
            
            <form id="post-editor-form" class="editor-form">
                <div class="form-group">
                    <label for="post-title" class="form-label">Title</label>
                    <input type="text" id="post-title" class="form-input" 
                           value="${isEdit ? SupabaseConfig.sanitizeHTML(post.title) : ''}" required>
                    <div class="form-error" id="post-title-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="post-category" class="form-label">Category</label>
                    <input type="text" id="post-category" class="form-input" 
                           value="${isEdit ? SupabaseConfig.sanitizeHTML(post.category || '') : ''}" 
                           placeholder="e.g., Technology, Travel, Lifestyle">
                    <div class="form-error" id="post-category-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="post-content" class="form-label">Content</label>
                    <textarea id="post-content" class="form-textarea" 
                              placeholder="Write your post content here..." required>${isEdit ? SupabaseConfig.sanitizeHTML(post.content) : ''}</textarea>
                    <div class="form-error" id="post-content-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="post-tags" class="form-label">Tags</label>
                    <input type="text" id="post-tags" class="form-input" 
                           value="${isEdit ? (post.tags || []).join(', ') : ''}"
                           placeholder="Enter tags separated by commas">
                    <small>Separate tags with commas (e.g., javascript, web development, tutorial)</small>
                </div>
                
                <div class="form-group">
                    <label for="post-image" class="form-label">Featured Image</label>
                    <input type="file" id="post-image" class="form-input" accept="image/*">
                    <small>Optional: Upload a featured image for your post</small>
                    ${isEdit && post.featured_image ? `
                        <div class="current-image">
                            <img src="${post.featured_image}" alt="Current featured image" style="max-width: 200px; border-radius: 8px; margin-top: 8px;">
                        </div>
                    ` : ''}
                </div>
                
                <div class="editor-actions">
                    <button type="button" class="btn btn-outline" id="cancel-post">Cancel</button>
                    <button type="button" class="btn btn-outline" id="save-draft">Save Draft</button>
                    <button type="submit" class="btn btn-primary" id="publish-post">
                        ${isEdit ? 'Update Post' : 'Publish Post'}
                    </button>
                </div>
            </form>
        `;
        
        this.setupPostEditorListeners(isEdit ? post.id : null);
        editorModal.classList.add('show');
    }
    
    /**
     * Set up post editor event listeners
     * @param {string} postId - Post ID for editing (optional)
     */
    setupPostEditorListeners(postId = null) {
        const form = document.getElementById('post-editor-form');
        const cancelBtn = document.getElementById('cancel-post');
        const saveDraftBtn = document.getElementById('save-draft');
        const editorModal = document.getElementById('editor-modal');
        const editorModalClose = document.getElementById('editor-modal-close');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                editorModal.classList.remove('show');
            });
        }
        
        if (editorModalClose) {
            editorModalClose.addEventListener('click', () => {
                editorModal.classList.remove('show');
            });
        }
        
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => {
                this.savePost(form, false, postId);
            });
        }
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePost(form, true, postId);
            });
        }
    }
    
    /**
     * Save post to database
     * @param {HTMLFormElement} form - Post form
     * @param {boolean} publish - Whether to publish the post
     * @param {string} postId - Post ID for editing (optional)
     */
    async savePost(form, publish = true, postId = null) {
        const user = window.authManager?.getCurrentUser();
        if (!user) {
            window.authManager?.showAuthModal('login');
            return;
        }
        
        const submitBtn = form.querySelector('#publish-post');
        const title = form.querySelector('#post-title').value.trim();
        const category = form.querySelector('#post-category').value.trim();
        const content = form.querySelector('#post-content').value.trim();
        const tagsInput = form.querySelector('#post-tags').value.trim();
        const imageFile = form.querySelector('#post-image').files[0];
        
        // Validate inputs
        if (!this.validatePostForm(title, content)) return;
        
        try {
            this.setSubmitButtonLoading(submitBtn, true);
            
            let featuredImageUrl = null;
            
            // Upload image if provided
            if (imageFile) {
                const uploadResult = await SupabaseConfig.uploadFile(imageFile, 'post-images');
                if (uploadResult.success) {
                    featuredImageUrl = uploadResult.url;
                } else {
                    throw new Error(uploadResult.error);
                }
            }
            
            // Prepare post data
            const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            
            const postData = {
                title,
                content,
                category: category || 'General',
                tags,
                published: publish,
                author_id: user.id,
                updated_at: new Date().toISOString()
            };
            
            if (featuredImageUrl) {
                postData.featured_image = featuredImageUrl;
            }
            
            if (!postId) {
                postData.created_at = new Date().toISOString();
            }
            
            let result;
            if (postId) {
                // Update existing post
                result = await SupabaseConfig.client
                    .from('posts')
                    .update(postData)
                    .eq('id', postId)
                    .eq('author_id', user.id)
                    .select()
                    .single();
            } else {
                // Create new post
                result = await SupabaseConfig.client
                    .from('posts')
                    .insert(postData)
                    .select()
                    .single();
            }
            
            if (result.error) throw result.error;
            
            // Close modal
            document.getElementById('editor-modal').classList.remove('show');
            
            // Show success message
            window.authManager?.showToast(
                postId ? 'Post Updated!' : 'Post Created!',
                publish ? 'Your post has been published successfully.' : 'Your post has been saved as draft.',
                'success'
            );
            
            // Refresh posts if on main page
            if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
                await this.loadPosts(1, false);
            }
            
            // Navigate to post if published
            if (publish && result.data) {
                setTimeout(() => {
                    this.navigateToPost(result.data.id);
                }, 1000);
            }
            
        } catch (error) {
            console.error('Error saving post:', error);
            const errorMessage = SupabaseConfig.handleError(error, 'Save post');
            window.authManager?.showToast('Error', errorMessage, 'error');
        } finally {
            this.setSubmitButtonLoading(submitBtn, false);
        }
    }
    
    /**
     * Validate post form
     * @param {string} title - Post title
     * @param {string} content - Post content
     * @returns {boolean} - Is valid
     */
    validatePostForm(title, content) {
        let isValid = true;
        
        if (!title || title.length < 3) {
            this.showFormError('post-title', 'Title must be at least 3 characters');
            isValid = false;
        }
        
        if (!content || content.length < 50) {
            this.showFormError('post-content', 'Content must be at least 50 characters');
            isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * Show form error
     * @param {string} fieldId - Field ID
     * @param {string} message - Error message
     */
    showFormError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        if (field) {
            field.classList.add('error');
        }
        
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
    
    /**
     * Set submit button loading state
     * @param {HTMLButtonElement} button - Submit button
     * @param {boolean} loading - Loading state
     */
    setSubmitButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        } else {
            button.disabled = false;
            button.innerHTML = button.getAttribute('data-original-text') || 'Publish Post';
        }
    }
    
    /**
     * Show loading state
     * @param {HTMLElement} container - Container element
     */
    showLoadingState(container) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading posts...</p>
            </div>
        `;
    }
    
    /**
     * Show error state
     * @param {string} message - Error message
     */
    showErrorState(message) {
        const postsGrid = document.getElementById('posts-grid');
        if (postsGrid) {
            postsGrid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Oops! Something went wrong</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="window.blogManager.loadPosts()">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
    
    /**
     * Get avatar HTML
     * @param {string} displayName - User's display name
     * @returns {string} - Avatar HTML
     */
    getAvatarHTML(displayName) {
        const initials = this.getInitials(displayName);
        return initials;
    }
    
    /**
     * Get user initials
     * @param {string} name - User's name
     * @returns {string} - User initials
     */
    getInitials(name) {
        if (!name) return 'A';
        
        const words = name.split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
}

// Initialize blog manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogManager = new BlogManager();
});

// Export for global access
window.BlogManager = BlogManager; 