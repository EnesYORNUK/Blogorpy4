/**
 * Post Page Module
 * 
 * Handles individual post page functionality including
 * post loading, comments, likes, saved posts, and sharing.
 */

class PostManager {
    constructor() {
        this.currentPost = null;
        this.currentUser = null;
        this.postId = null;
        this.isLoading = false;
        
        this.init();
    }
    
    /**
     * Initialize the post manager
     */
    async init() {
        try {
            // Get post ID from URL
            this.postId = this.getPostIdFromURL();
            
            if (!this.postId) {
                this.showError('Post not found');
                return;
            }
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load post data
            await this.loadPost();
            
            // Load comments
            await this.loadComments();
            
            // Check user authentication status
            this.checkAuthStatus();
            
            console.log('Post manager initialized successfully');
            
        } catch (error) {
            console.error('Error initializing post manager:', error);
            this.showError('Failed to load post');
        }
    }
    
    /**
     * Get post ID from URL parameters
     * @returns {string|null} - Post ID
     */
    getPostIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Like button
        const likeBtn = document.getElementById('like-btn');
        if (likeBtn) {
            likeBtn.addEventListener('click', () => this.toggleLike());
        }
        
        // Save button
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.toggleSave());
        }
        
        // Share button
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.showShareModal());
        }
        
        // Edit button
        const editBtn = document.getElementById('edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.editPost());
        }
        
        // Delete button
        const deleteBtn = document.getElementById('delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deletePost());
        }
        
        // Comment form
        const commentForm = document.getElementById('comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitComment();
            });
        }
        
        // Cancel comment
        const cancelCommentBtn = document.getElementById('cancel-comment');
        if (cancelCommentBtn) {
            cancelCommentBtn.addEventListener('click', () => {
                document.getElementById('comment-textarea').value = '';
            });
        }
        
        // Login to comment link
        const loginToCommentLink = document.getElementById('login-to-comment-link');
        if (loginToCommentLink) {
            loginToCommentLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.authManager?.showAuthModal('login');
            });
        }
        
        // Share modal
        this.setupShareModalListeners();
        
        // Listen for auth state changes
        window.addEventListener('authStateChange', () => {
            this.checkAuthStatus();
        });
    }
    
    /**
     * Set up share modal event listeners
     */
    setupShareModalListeners() {
        const shareModal = document.getElementById('share-modal');
        const shareModalClose = document.getElementById('share-modal-close');
        const copyLinkBtn = document.getElementById('copy-link');
        
        if (shareModalClose) {
            shareModalClose.addEventListener('click', () => {
                shareModal.classList.remove('show');
            });
        }
        
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', () => this.copyLink());
        }
        
        // Social sharing buttons
        const shareOptions = document.querySelectorAll('.share-option[data-platform]');
        shareOptions.forEach(option => {
            option.addEventListener('click', () => {
                const platform = option.getAttribute('data-platform');
                this.shareOnPlatform(platform);
            });
        });
        
        // Close modal on backdrop click
        if (shareModal) {
            shareModal.addEventListener('click', (e) => {
                if (e.target === shareModal) {
                    shareModal.classList.remove('show');
                }
            });
        }
    }
    
    /**
     * Load post data from database
     */
    async loadPost() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            
                                    const { data: post, error } = await supabaseClient                .from('posts')                .select(`                    *,                    profiles (                        id,                        display_name,                        avatar_url,                        bio                    )                `)                .eq('id', this.postId)                .eq('published', true)                .single();
            
            if (error) throw error;
            
            if (!post) {
                this.showError('Post not found');
                return;
            }
            
            this.currentPost = post;
            this.renderPost(post);
            await this.loadPostStats();
            await this.checkUserInteractions();
            await this.loadRelatedPosts();
            
        } catch (error) {
            console.error('Error loading post:', error);
            this.showError('Failed to load post');
        } finally {
            this.isLoading = false;
        }
    }
    
    /**
     * Render post content
     * @param {Object} post - Post object
     */
    renderPost(post) {
        // Update page title
        document.title = `${post.title} - EnsonBlog`;
        
        // Update post header
        const postCategory = document.getElementById('post-category');
        const postDate = document.getElementById('post-date');
        const postTitle = document.getElementById('post-title');
        const authorAvatar = document.getElementById('author-avatar');
        const authorName = document.getElementById('author-name');
        const authorBio = document.getElementById('author-bio');
        
        if (postCategory) postCategory.textContent = post.category || 'General';
        if (postDate) postDate.textContent = SupabaseConfig.formatDate(post.created_at);
        if (postTitle) postTitle.textContent = post.title;
        
        if (authorAvatar) {
            const displayName = post.profiles?.display_name || 'Anonymous';
            authorAvatar.innerHTML = `<span>${this.getInitials(displayName)}</span>`;
        }
        
        if (authorName) {
            authorName.textContent = post.profiles?.display_name || 'Anonymous';
        }
        
        if (authorBio) {
            authorBio.textContent = post.profiles?.bio || 'Blog author';
        }
        
        // Update post image
        const postImageContainer = document.getElementById('post-image-container');
        if (postImageContainer) {
            if (post.featured_image) {
                postImageContainer.innerHTML = `
                    <img src="${post.featured_image}" alt="${post.title}" loading="lazy">
                `;
            } else {
                postImageContainer.innerHTML = '';
            }
        }
        
        // Update post content
        const postContent = document.getElementById('post-content');
        if (postContent) {
            postContent.innerHTML = this.formatPostContent(post.content);
        }
        
        // Update post tags
        const postTags = document.getElementById('post-tags');
        if (postTags && post.tags && post.tags.length > 0) {
            postTags.innerHTML = post.tags.map(tag => 
                `<span class="tag">${SupabaseConfig.sanitizeHTML(tag)}</span>`
            ).join('');
        }
        
        // Show owner actions if current user is the author
        this.updateOwnerActions();
    }
    
    /**
     * Format post content for display
     * @param {string} content - Raw post content
     * @returns {string} - Formatted HTML content
     */
    formatPostContent(content) {
        // Basic formatting (you can enhance this with a markdown parser)
        let formatted = content
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        // Wrap in paragraphs
        formatted = `<p>${formatted}</p>`;
        
        // Remove empty paragraphs
        formatted = formatted.replace(/<p><\/p>/g, '');
        
        return formatted;
    }
    
    /**
     * Load post statistics (likes, comments count)
     */
    async loadPostStats() {
        try {
            // Load likes count
            const { count: likesCount } = await supabaseClient
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', this.postId);
            
            // Load comments count
            const { count: commentsCount } = await supabaseClient
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', this.postId);
            
            // Update UI
            const likesCountEl = document.getElementById('likes-count');
            const commentsCountEl = document.getElementById('comments-count');
            
            if (likesCountEl) likesCountEl.textContent = likesCount || 0;
            if (commentsCountEl) commentsCountEl.textContent = commentsCount || 0;
            
        } catch (error) {
            console.error('Error loading post stats:', error);
        }
    }
    
    /**
     * Check user interactions (likes, saves)
     */
    async checkUserInteractions() {
        const user = window.authManager?.getCurrentUser();
        if (!user) return;
        
        try {
            // Check if user has liked the post
            const { data: like } = await SupabaseConfig.client
                .from('likes')
                .select('id')
                .eq('post_id', this.postId)
                .eq('user_id', user.id)
                .single();
            
            const likeBtn = document.getElementById('like-btn');
            if (likeBtn) {
                if (like) {
                    likeBtn.classList.add('active');
                    likeBtn.querySelector('i').className = 'fas fa-heart';
                } else {
                    likeBtn.classList.remove('active');
                    likeBtn.querySelector('i').className = 'far fa-heart';
                }
            }
            
            // Check if user has saved the post
            const { data: saved } = await SupabaseConfig.client
                .from('saved_posts')
                .select('id')
                .eq('post_id', this.postId)
                .eq('user_id', user.id)
                .single();
            
            const saveBtn = document.getElementById('save-btn');
            if (saveBtn) {
                if (saved) {
                    saveBtn.classList.add('active');
                    saveBtn.querySelector('i').className = 'fas fa-bookmark';
                } else {
                    saveBtn.classList.remove('active');
                    saveBtn.querySelector('i').className = 'far fa-bookmark';
                }
            }
            
        } catch (error) {
            console.error('Error checking user interactions:', error);
        }
    }
    
    /**
     * Toggle like status
     */
    async toggleLike() {
        const user = window.authManager?.getCurrentUser();
        if (!user) {
            window.authManager?.showAuthModal('login');
            return;
        }
        
        try {
            const likeBtn = document.getElementById('like-btn');
            const likesCountEl = document.getElementById('likes-count');
            const isLiked = likeBtn.classList.contains('active');
            
            if (isLiked) {
                // Remove like
                await SupabaseConfig.client
                    .from('likes')
                    .delete()
                    .eq('post_id', this.postId)
                    .eq('user_id', user.id);
                
                likeBtn.classList.remove('active');
                likeBtn.querySelector('i').className = 'far fa-heart';
                
                // Update count
                const currentCount = parseInt(likesCountEl.textContent) || 0;
                likesCountEl.textContent = Math.max(0, currentCount - 1);
                
            } else {
                // Add like
                await SupabaseConfig.client
                    .from('likes')
                    .insert({
                        post_id: this.postId,
                        user_id: user.id,
                        created_at: new Date().toISOString()
                    });
                
                likeBtn.classList.add('active');
                likeBtn.querySelector('i').className = 'fas fa-heart';
                
                // Update count
                const currentCount = parseInt(likesCountEl.textContent) || 0;
                likesCountEl.textContent = currentCount + 1;
                
                // Animate like button
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(likeBtn, {
                        scale: 1
                    }, {
                        scale: 1.2,
                        duration: 0.2,
                        yoyo: true,
                        repeat: 1,
                        ease: 'power2.out'
                    });
                }
            }
            
        } catch (error) {
            console.error('Error toggling like:', error);
            window.authManager?.showToast('Error', 'Failed to update like status', 'error');
        }
    }
    
    /**
     * Toggle save status
     */
    async toggleSave() {
        const user = window.authManager?.getCurrentUser();
        if (!user) {
            window.authManager?.showAuthModal('login');
            return;
        }
        
        try {
            const saveBtn = document.getElementById('save-btn');
            const isSaved = saveBtn.classList.contains('active');
            
            if (isSaved) {
                // Remove from saved
                await SupabaseConfig.client
                    .from('saved_posts')
                    .delete()
                    .eq('post_id', this.postId)
                    .eq('user_id', user.id);
                
                saveBtn.classList.remove('active');
                saveBtn.querySelector('i').className = 'far fa-bookmark';
                saveBtn.querySelector('span').textContent = 'Save';
                
                window.authManager?.showToast('Removed', 'Post removed from saved list', 'success');
                
            } else {
                // Add to saved
                await SupabaseConfig.client
                    .from('saved_posts')
                    .insert({
                        post_id: this.postId,
                        user_id: user.id,
                        created_at: new Date().toISOString()
                    });
                
                saveBtn.classList.add('active');
                saveBtn.querySelector('i').className = 'fas fa-bookmark';
                saveBtn.querySelector('span').textContent = 'Saved';
                
                window.authManager?.showToast('Saved!', 'Post added to your saved list', 'success');
            }
            
        } catch (error) {
            console.error('Error toggling save:', error);
            window.authManager?.showToast('Error', 'Failed to update save status', 'error');
        }
    }
    
    /**
     * Show share modal
     */
    showShareModal() {
        const shareModal = document.getElementById('share-modal');
        if (shareModal) {
            shareModal.classList.add('show');
        }
    }
    
    /**
     * Share on social platform
     * @param {string} platform - Social platform name
     */
    shareOnPlatform(platform) {
        const postUrl = window.location.href;
        const postTitle = this.currentPost?.title || 'Check out this post';
        
        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`
        };
        
        const shareUrl = shareUrls[platform];
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }
    
    /**
     * Copy post link to clipboard
     */
    async copyLink() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            window.authManager?.showToast('Copied!', 'Post link copied to clipboard', 'success');
            
            // Close share modal
            document.getElementById('share-modal').classList.remove('show');
            
        } catch (error) {
            console.error('Error copying link:', error);
            window.authManager?.showToast('Error', 'Failed to copy link', 'error');
        }
    }
    
    /**
     * Edit post (for post owner)
     */
    editPost() {
        if (window.blogManager) {
            window.blogManager.showPostEditor(this.currentPost);
        }
    }
    
    /**
     * Delete post (for post owner)
     */
    async deletePost() {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }
        
        const user = window.authManager?.getCurrentUser();
        if (!user || user.id !== this.currentPost?.author_id) {
            window.authManager?.showToast('Error', 'You are not authorized to delete this post', 'error');
            return;
        }
        
        try {
            const { error } = await SupabaseConfig.client
                .from('posts')
                .delete()
                .eq('id', this.postId)
                .eq('author_id', user.id);
            
            if (error) throw error;
            
            window.authManager?.showToast('Deleted!', 'Post has been deleted successfully', 'success');
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            console.error('Error deleting post:', error);
            window.authManager?.showToast('Error', 'Failed to delete post', 'error');
        }
    }
    
    /**
     * Load comments for the post
     */
    async loadComments() {
        try {
            const { data: comments, error } = await SupabaseConfig.client
                .from('comments')
                .select(`
                    *,
                    profiles (
                        id,
                        display_name,
                        avatar_url
                    )
                `)
                .eq('post_id', this.postId)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            
            this.renderComments(comments || []);
            
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }
    
    /**
     * Render comments
     * @param {Array} comments - Array of comment objects
     */
    renderComments(comments) {
        const commentsList = document.getElementById('comments-list');
        if (!commentsList) return;
        
        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div class="no-comments">
                    <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
            `;
            return;
        }
        
        commentsList.innerHTML = comments.map((comment, index) => {
            const author = comment.profiles || {};
            const authorName = author.display_name || 'Anonymous';
            const authorAvatar = this.getInitials(authorName);
            const formattedDate = SupabaseConfig.formatRelativeTime(comment.created_at);
            
            return `
                <div class="comment" style="--index: ${index}">
                    <div class="comment-header">
                        <div class="comment-author">
                            <div class="author-avatar">${authorAvatar}</div>
                            <div class="comment-author-info">
                                <p class="author-name">${SupabaseConfig.sanitizeHTML(authorName)}</p>
                                <p class="comment-date">${formattedDate}</p>
                            </div>
                        </div>
                        <div class="comment-actions">
                            <button class="comment-action">
                                <i class="far fa-heart"></i>
                            </button>
                            <button class="comment-action">
                                <i class="fas fa-reply"></i>
                            </button>
                        </div>
                    </div>
                    <p class="comment-content">${SupabaseConfig.sanitizeHTML(comment.content)}</p>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Submit a new comment
     */
    async submitComment() {
        const user = window.authManager?.getCurrentUser();
        if (!user) {
            window.authManager?.showAuthModal('login');
            return;
        }
        
        const textarea = document.getElementById('comment-textarea');
        const content = textarea.value.trim();
        
        if (!content) {
            window.authManager?.showToast('Error', 'Please enter a comment', 'error');
            return;
        }
        
        try {
            const { data, error } = await SupabaseConfig.client
                .from('comments')
                .insert({
                    post_id: this.postId,
                    user_id: user.id,
                    content,
                    created_at: new Date().toISOString()
                })
                .select(`
                    *,
                    profiles (
                        id,
                        display_name,
                        avatar_url
                    )
                `)
                .single();
            
            if (error) throw error;
            
            // Clear form
            textarea.value = '';
            
            // Add new comment to list
            this.addCommentToList(data);
            
            // Update comments count
            const commentsCountEl = document.getElementById('comments-count');
            if (commentsCountEl) {
                const currentCount = parseInt(commentsCountEl.textContent) || 0;
                commentsCountEl.textContent = currentCount + 1;
            }
            
            window.authManager?.showToast('Success!', 'Your comment has been posted', 'success');
            
        } catch (error) {
            console.error('Error submitting comment:', error);
            window.authManager?.showToast('Error', 'Failed to post comment', 'error');
        }
    }
    
    /**
     * Add new comment to the comments list
     * @param {Object} comment - Comment object
     */
    addCommentToList(comment) {
        const commentsList = document.getElementById('comments-list');
        if (!commentsList) return;
        
        // Remove no comments message if it exists
        const noComments = commentsList.querySelector('.no-comments');
        if (noComments) {
            noComments.remove();
        }
        
        const author = comment.profiles || {};
        const authorName = author.display_name || 'Anonymous';
        const authorAvatar = this.getInitials(authorName);
        const formattedDate = SupabaseConfig.formatRelativeTime(comment.created_at);
        
        const commentHTML = `
            <div class="comment new-comment">
                <div class="comment-header">
                    <div class="comment-author">
                        <div class="author-avatar">${authorAvatar}</div>
                        <div class="comment-author-info">
                            <p class="author-name">${SupabaseConfig.sanitizeHTML(authorName)}</p>
                            <p class="comment-date">${formattedDate}</p>
                        </div>
                    </div>
                    <div class="comment-actions">
                        <button class="comment-action">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="comment-action">
                            <i class="fas fa-reply"></i>
                        </button>
                    </div>
                </div>
                <p class="comment-content">${SupabaseConfig.sanitizeHTML(comment.content)}</p>
            </div>
        `;
        
        commentsList.insertAdjacentHTML('beforeend', commentHTML);
        
        // Animate new comment
        const newComment = commentsList.querySelector('.new-comment');
        if (newComment && typeof gsap !== 'undefined') {
            gsap.fromTo(newComment, {
                opacity: 0,
                y: 20
            }, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
            
            newComment.classList.remove('new-comment');
        }
    }
    
    /**
     * Load related posts
     */
    async loadRelatedPosts() {
        if (!this.currentPost) return;
        
        try {
            const { data: relatedPosts, error } = await SupabaseConfig.client
                .from('posts')
                .select(`
                    id,
                    title,
                    featured_image,
                    created_at,
                    category
                `)
                .eq('published', true)
                .neq('id', this.postId)
                .or(`category.eq.${this.currentPost.category},tags.cs.{${this.currentPost.tags?.join(',') || ''}}`)
                .limit(3);
            
            if (error) throw error;
            
            this.renderRelatedPosts(relatedPosts || []);
            
        } catch (error) {
            console.error('Error loading related posts:', error);
        }
    }
    
    /**
     * Render related posts
     * @param {Array} posts - Array of related post objects
     */
    renderRelatedPosts(posts) {
        const relatedPostsGrid = document.getElementById('related-posts-grid');
        if (!relatedPostsGrid || posts.length === 0) return;
        
        relatedPostsGrid.innerHTML = posts.map(post => {
            const formattedDate = SupabaseConfig.formatRelativeTime(post.created_at);
            
            return `
                <article class="related-post-card" data-post-id="${post.id}">
                    <div class="related-post-image">
                        ${post.featured_image ? 
                            `<img src="${post.featured_image}" alt="${post.title}" loading="lazy">` :
                            '<div class="post-card-placeholder"></div>'
                        }
                    </div>
                    <div class="related-post-content">
                        <h4 class="related-post-title">${SupabaseConfig.sanitizeHTML(post.title)}</h4>
                        <p class="related-post-meta">${formattedDate} • ${post.category || 'General'}</p>
                    </div>
                </article>
            `;
        }).join('');
        
        // Add click listeners
        relatedPostsGrid.querySelectorAll('.related-post-card').forEach(card => {
            card.addEventListener('click', () => {
                const postId = card.getAttribute('data-post-id');
                window.location.href = `post.html?id=${postId}`;
            });
        });
    }
    
    /**
     * Check authentication status and update UI
     */
    checkAuthStatus() {
        this.currentUser = window.authManager?.getCurrentUser();
        this.updateOwnerActions();
        this.updateCommentForm();
    }
    
    /**
     * Update owner actions visibility
     */
    updateOwnerActions() {
        const ownerActions = document.getElementById('post-owner-actions');
        if (!ownerActions) return;
        
        if (this.currentUser && this.currentPost && this.currentUser.id === this.currentPost.author_id) {
            ownerActions.classList.remove('hidden');
        } else {
            ownerActions.classList.add('hidden');
        }
    }
    
    /**
     * Update comment form visibility
     */
    updateCommentForm() {
        const commentFormContainer = document.getElementById('comment-form-container');
        const loginToComment = document.getElementById('login-to-comment');
        
        if (commentFormContainer && loginToComment) {
            if (this.currentUser) {
                commentFormContainer.classList.remove('hidden');
                loginToComment.classList.add('hidden');
            } else {
                commentFormContainer.classList.add('hidden');
                loginToComment.classList.remove('hidden');
            }
        }
    }
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const postContent = document.getElementById('post-content');
        if (postContent) {
            postContent.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="window.location.href='index.html'">
                        Go Back Home
                    </button>
                </div>
            `;
        }
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

// Initialize post manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.postManager = new PostManager();
});

// Export for global access
window.PostManager = PostManager; 