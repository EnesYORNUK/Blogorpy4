/**
 * Blog Management Module
 * Simple version for displaying posts on homepage
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
            let searchTimeout;
            const debouncedSearch = () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(searchInput.value);
                }, 500);
            };
            
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
            createPostBtn.addEventListener('click', () => {
                window.location.href = 'create-post.html';
            });
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
                    window.location.href = 'create-post.html';
                } else {
                    window.authManager?.showAuthModal('login');
                }
            });
        }
    }
    
    /**
     * Load posts from database
     */
    async loadPosts(page = 1, append = false) {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            const postsGrid = document.getElementById('posts-grid');
            
            if (!append) {
                this.showLoadingState(postsGrid);
            }
            
            console.log('Loading posts from database...');
            
            // Query with profiles join
            let query = supabaseClient
                .from('posts')
                .select(`
                    *,
                    profiles (
                        id,
                        username,
                        full_name,
                        avatar_url
                    )
                `)
                .eq('published', true);
            
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
            
            // Add pagination
            const from = (page - 1) * this.postsPerPage;
            const to = from + this.postsPerPage - 1;
            query = query.range(from, to);
            
            const { data: posts, error, count } = await query;
            
            console.log('Posts loaded:', posts);
            console.log('Error:', error);
            
            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            
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
        
        // Animate post cards if GSAP is available
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
     */
    createPostCard(post) {
        const author = post.profiles || {};
        const authorName = author.full_name || author.username || 'Anonymous';
        const excerpt = this.generateSimpleExcerpt(post.content);
        const formattedDate = this.formatDate(post.created_at);
        
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
                        <span class="post-category">General</span>
                        <span class="post-date">${formattedDate}</span>
                    </div>
                    
                    <h3 class="post-card-title">${this.escapeHtml(post.title)}</h3>
                    
                    <p class="post-card-excerpt">${this.escapeHtml(excerpt)}</p>
                    
                    <div class="post-card-footer">
                        <div class="post-author">
                            <div class="author-avatar">
                                ${author.avatar_url ? 
                                    `<img src="${author.avatar_url}" alt="${authorName}">` :
                                    `<span>${this.getInitials(authorName)}</span>`
                                }
                            </div>
                            <p class="author-name">${this.escapeHtml(authorName)}</p>
                        </div>
                        
                        <div class="post-stats">
                            <div class="post-stat">
                                <i class="far fa-heart"></i>
                                <span>${post.likes_count || 0}</span>
                            </div>
                            <div class="post-stat">
                                <i class="far fa-comment"></i>
                                <span>${post.comments_count || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }
    
    /**
     * Get user initials for avatar
     */
    getInitials(name) {
        if (!name) return 'A';
        
        const words = name.split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    /**
     * Generate simple excerpt from content
     */
    generateSimpleExcerpt(content, maxLength = 150) {
        if (!content) return '';
        
        const plainText = content.replace(/<[^>]*>/g, '').trim();
        
        if (plainText.length <= maxLength) {
            return plainText;
        }
        
        return plainText.substring(0, maxLength).trim() + '...';
    }
    
    /**
     * Format date simply
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
        }
    }
    
    /**
     * Navigate to post page
     */
    navigateToPost(postId) {
        window.location.href = `post.html?id=${postId}`;
    }
    
    /**
     * Handle search
     */
    async handleSearch(query) {
        this.currentSearch = query.trim();
        this.currentPage = 1;
        await this.loadPosts(1, false);
    }
    
    /**
     * Handle sort change
     */
    async handleSort(sortType) {
        this.currentSort = sortType;
        this.currentPage = 1;
        await this.loadPosts(1, false);
    }
    
    /**
     * Render pagination (simplified)
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
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
            `;
        }
        
        // Current page info
        paginationHTML += `
            <span class="pagination-info">
                Page ${currentPage} of ${totalPages}
            </span>
        `;
        
        // Next button
        if (currentPage < totalPages) {
            paginationHTML += `
                <button class="pagination-btn" data-page="${currentPage + 1}">
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }
        
        paginationContainer.innerHTML = paginationHTML;
        
        // Add click listeners
        paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.getAttribute('data-page'));
                if (page && page !== currentPage) {
                    this.loadPosts(page, false);
                }
            });
        });
    }
    
    /**
     * Show loading state
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
}

// Initialize blog manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogManager = new BlogManager();
});

// Export for global access
window.BlogManager = BlogManager; 