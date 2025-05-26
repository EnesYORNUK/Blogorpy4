// Blogs page JavaScript

// Extended blog posts data (fallback mock data)
const allBlogPosts = [
    {
        id: 1,
        title: "The Art of Minimalist Design",
        excerpt: "Exploring the principles of minimalism in modern web design and how less can truly be more when creating user experiences.",
        category: "technology",
        author: "Sarah Chen",
        date: "2024-01-15",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&h=600&fit=crop"
    },
    {
        id: 2,
        title: "Building Sustainable Web Applications",
        excerpt: "Learn how to create eco-friendly web applications that minimize carbon footprint while maintaining high performance.",
        category: "technology",
        author: "Alex Rivera",
        date: "2024-01-12",
        readTime: "8 min read",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop"
    },
    {
        id: 3,
        title: "The Future of Remote Work",
        excerpt: "Insights into how remote work is reshaping the modern workplace and what it means for the future of collaboration.",
        category: "business",
        author: "Maya Patel",
        date: "2024-01-10",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
    },
    {
        id: 4,
        title: "Typography in Digital Design",
        excerpt: "A deep dive into choosing the right typefaces and creating harmonious typography systems for digital products.",
        category: "technology",
        author: "James Wilson",
        date: "2024-01-08",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=800&h=600&fit=crop"
    },
    {
        id: 5,
        title: "Mindful Living in a Digital Age",
        excerpt: "Finding balance between technology and well-being in our increasingly connected world.",
        category: "lifestyle",
        author: "Emma Thompson",
        date: "2024-01-03",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop"
    },
    {
        id: 6,
        title: "Startup Growth Strategies",
        excerpt: "Proven strategies for scaling your startup from idea to successful business.",
        category: "business",
        author: "David Kim",
        date: "2023-12-25",
        readTime: "9 min read",
        image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop"
    }
];

// State management
let currentFilter = 'all';
let searchQuery = '';
let displayedPosts = 6;
const postsPerLoad = 3;

// DOM elements
const blogsGrid = document.getElementById('blogsGrid');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const resultsCount = document.getElementById('resultsCount');
const newsletterForm = document.getElementById('newsletterForm');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    
    // Supabase bağlantısı kontrolü için kısa bir bekleyelim
    setTimeout(() => {
        // Hata ayıklama bilgisi
        console.log('📱 Window supabase:', window.supabase ? 'Loaded' : 'Not loaded');
        console.log('📱 Window supabaseClient:', window.supabaseClient ? 'Available' : 'Not available');
        
        loadBlogPosts();
    }, 1000);
});

// Setup event listeners
const setupEventListeners = () => {
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', BlogorpyUtils.debounce((e) => {
            searchQuery = e.target.value.toLowerCase();
            displayedPosts = 6;
            renderBlogPosts();
        }, 300));
    }

    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.category;
            displayedPosts = 6;
            renderBlogPosts();
        });
    });

    // Load more functionality
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePosts);
    }

    // Newsletter form
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }

    // Category links in footer
    document.querySelectorAll('[data-category]').forEach(link => {
        link.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const category = e.target.dataset.category;
                setFilterAndScroll(category);
            }
        });
    });
};

// Load blog posts from Supabase
const loadBlogPosts = async () => {
    try {
        // Supabase client kontrol et
        if (!window.supabaseClient) {
            console.error('❌ Supabase client not initialized');
            if (window.toast) {
                window.toast.error('Connection issue, showing sample data.', 'Connection Failed');
            }
            renderBlogPosts(); // Örnek verileri göster
            return;
        }

        console.log('🔄 Loading blog posts from Supabase...');
        
        // Bağlantı kontrolü
        try {
            // Test sorgusu
            const { data: testData, error: testError } = await window.supabaseClient
                .from('posts')
                .select('count')
                .limit(1);
                
            if (testError) {
                console.error('❌ Test query failed:', testError);
                if (window.toast) {
                    window.toast.error('Database query failed, showing sample data.', 'Query Error');
                }
                renderBlogPosts();
                return;
            }
            
            console.log('✅ Test query successful:', testData);
        } catch (testErr) {
            console.error('❌ Connection test failed:', testErr);
            if (window.toast) {
                window.toast.error('Could not reach database server', 'Network error');
            }
            renderBlogPosts();
            return;
        }
        
        // Show loading notification
        if (window.toast) {
            window.toast.info('Loading blog posts...', 'Loading');
        }
        
        // Asıl veri sorgusu
        const { data: posts, error } = await window.supabaseClient
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        console.log('📡 Supabase response:', { posts: posts?.length, error });

        if (error) {
            console.error('❌ Error loading posts:', error);
            if (window.toast) {
                window.toast.warning('Database query failed, showing sample data.', 'Query Error');
            }
            renderBlogPosts();
            return;
        }

        if (posts && posts.length > 0) {
            // Gerçek verilerle değiştir
            allBlogPosts.splice(0, allBlogPosts.length);
            
            posts.forEach(post => {
                console.log('📝 Processing post:', { id: post.id, title: post.title });
                allBlogPosts.push({
                    id: post.id,
                    title: post.title,
                    excerpt: post.excerpt || 
                            (post.content && post.content.length > 150 ? 
                            post.content.substring(0, 150) + '...' : 
                            'Content not available...'),
                    category: post.category,
                    author_name: post.author_name,
                    author: post.author_name, // Uyumluluk için
                    date: new Date(post.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    }),
                    readTime: post.content ? 
                             Math.max(1, Math.ceil(post.content.split(' ').length / 200)) + ' min read' :
                             '1 min read',
                    image_url: post.image_url,
                    image: post.image_url, // Uyumluluk için
                    content: post.content,
                    likes_count: post.likes_count || 0
                });
            });
            
            console.log(`✅ Loaded ${posts.length} blog posts from Supabase`);
            
            if (window.toast) {
                window.toast.success(`${posts.length} blog posts loaded successfully!`, 'Loading Complete');
            }
        } else {
            console.log('📝 No published posts found, using mock data');
            if (window.toast) {
                window.toast.info('No published blog posts found yet, showing sample data.', 'No Posts Found');
            }
        }
        
        renderBlogPosts();

    } catch (error) {
        console.error('❌ Error loading blog posts:', error);
        if (window.toast) {
            window.toast.error('Error loading blog posts, showing sample data.', 'Loading Error');
        }
        renderBlogPosts();
    }
};

// Filter and search posts
const getFilteredPosts = () => {
    return allBlogPosts.filter(post => {
        const matchesFilter = currentFilter === 'all' || post.category === currentFilter;
        const matchesSearch = searchQuery === '' || 
            post.title.toLowerCase().includes(searchQuery) ||
            post.excerpt.toLowerCase().includes(searchQuery) ||
            post.author.toLowerCase().includes(searchQuery);
        
        return matchesFilter && matchesSearch;
    });
};

// Render blog posts
const renderBlogPosts = () => {
    const filteredPosts = getFilteredPosts();
    const postsToShow = filteredPosts.slice(0, displayedPosts);
    
    // Clear grid
    blogsGrid.innerHTML = '';
    
    if (postsToShow.length === 0) {
        renderNoResults();
        loadMoreBtn.style.display = 'none';
        updateResultsCount(0);
        return;
    }
    
    // Render posts
    postsToShow.forEach((post, index) => {
        const blogCard = createBlogCard(post);
        blogCard.style.animationDelay = `${index * 0.1}s`;
        blogsGrid.appendChild(blogCard);
    });
    
    // Update load more button visibility
    if (displayedPosts >= filteredPosts.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-flex';
    }
    
    updateResultsCount(filteredPosts.length);
};

// Create blog card
const createBlogCard = (post) => {
    // Post verilerini kontrol et ve logla
    console.log('🖼️ Creating card for post:', { 
        id: post.id, 
        title: post.title,
        imageUrl: post.image_url || post.image
    });
    
    const card = document.createElement('article');
    card.className = 'blog-card';
    
    // Güvenli placeholder resim URL'si
    const placeholderImage = 'https://via.placeholder.com/300x200?text=No+Image';
    
    // image_url veya image alanını kontrol et
    const imageUrl = post.image_url || post.image || placeholderImage;
    
    card.innerHTML = `
        <img 
            class="blog-card-image" 
            src="${imageUrl}" 
            alt="${post.title}"
            loading="lazy"
            onerror="this.onerror=null; this.src='${placeholderImage}';"
        >
        <div class="blog-card-content">
            <span class="blog-card-category">${post.category}</span>
            <h3 class="blog-card-title">${post.title}</h3>
            <p class="blog-card-excerpt">${post.excerpt || 'No excerpt available'}</p>
            <div class="blog-card-meta">
                <span>${post.author_name || post.author || 'Unknown Author'}</span>
                <span>${post.readTime || (post.content ? calculateReadTime(post.content) + ' min read' : '1 min read')}</span>
            </div>
            <div class="blog-card-actions">
                <button class="blog-card-like-btn ${post.is_liked ? 'liked' : ''}" data-post-id="${post.id}" onclick="toggleBlogLike(event, '${post.id}')">
                    <svg class="heart-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span class="like-count">${post.likes_count || 0}</span>
                </button>
                <button class="read-more-btn" onclick="navigateToBlog('${post.id}')">
                    <span>Read More →</span>
                </button>
            </div>
        </div>
    `;
    
    // Load like status for this post (only check if current user has liked it)
    loadBlogCardLikeStatus(post.id);
    
    return card;
};

// Render no results state
const renderNoResults = () => {
    blogsGrid.innerHTML = `
        <div class="no-results">
            <div class="no-results-icon">🔍</div>
            <h3 class="no-results-title">No articles found</h3>
            <p class="no-results-text">Try adjusting your search or filter criteria</p>
        </div>
    `;
};

// Load more posts
const loadMorePosts = () => {
    loadMoreBtn.classList.add('loading');
    
    // Simulate loading delay
    setTimeout(() => {
        displayedPosts += postsPerLoad;
        renderBlogPosts();
        loadMoreBtn.classList.remove('loading');
    }, 600);
};

// Update results count
const updateResultsCount = (count) => {
    if (searchQuery) {
        resultsCount.textContent = `Found ${count} articles matching "${searchQuery}"`;
    } else if (currentFilter !== 'all') {
        resultsCount.textContent = `Showing ${count} articles in ${currentFilter}`;
    } else {
        resultsCount.textContent = `Showing all ${count} articles`;
    }
};

// Handle newsletter submission
const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    const email = emailInput.value;
    
    // In a real app, this would send to a backend
    console.log(`Newsletter subscription for: ${email}`);
    
    // Show success message
    const originalText = newsletterForm.querySelector('.newsletter-btn').textContent;
    newsletterForm.querySelector('.newsletter-btn').textContent = 'Subscribed!';
    emailInput.value = '';
    
    setTimeout(() => {
        newsletterForm.querySelector('.newsletter-btn').textContent = originalText;
    }, 3000);
};

// Set filter and scroll to blogs section
const setFilterAndScroll = (category) => {
    currentFilter = category;
    displayedPosts = 6;
    
    // Update active filter button
    filterButtons.forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderBlogPosts();
    
    // Scroll to blogs section
    const blogsSection = document.querySelector('.blogs-section');
    if (blogsSection) {
        blogsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// Handle deep linking for specific posts
const handleDeepLink = () => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#post-')) {
        const postId = parseInt(hash.replace('#post-', ''));
        const post = allBlogPosts.find(p => p.id === postId);
        if (post) {
            // In a real app, this would open the full blog post
            console.log(`Opening post: ${post.title}`);
        }
    }
};

// Check for deep links on load
window.addEventListener('load', handleDeepLink);
window.addEventListener('hashchange', handleDeepLink); 

// Navigation function for blog cards
const navigateToBlog = (postId) => {
    try {
        if (!postId) {
            console.error('❌ Invalid post ID for navigation');
            return;
        }
        
        console.log(`🔗 Navigating to blog detail for post ${postId}`);
        window.location.href = `blog-detail.html?id=${postId}`;
    } catch (error) {
        console.error('❌ Error navigating to blog:', error);
    }
};

// Load like status for blog card
const loadBlogCardLikeStatus = async (postId) => {
    try {
        if (!window.supabaseClient) return;
        
        // Sadece kullanıcının beğeni durumunu kontrol et
        const user = await window.checkAuth();
        if (user) {
            const { data: userLike, error: userLikeError } = await window.supabaseClient
                .from('user_favorites')
                .select('*')
                .eq('post_id', postId)
                .eq('user_id', user.id)
                .eq('type', 'like')
                .single();
                
            if (!userLikeError && userLike) {
                updateBlogCardLikeDisplay(postId, true, null);
            }
        }
        
    } catch (error) {
        console.error('❌ Error loading blog card like status:', error);
    }
};

// Toggle like for blog card
const toggleBlogLike = async (event, postId) => {
    event.stopPropagation(); // Prevent card click
    
    try {
        const user = await window.checkAuth();
        if (!user) {
            if (window.toast) {
                window.toast.error('You must be logged in to like posts', 'Login Required');
            } else {
                alert('You must be logged in to like posts');
            }
            return;
        }
        
        const likeBtn = document.querySelector(`[data-post-id="${postId}"]`);
        if (!likeBtn) return;
        
        const isLiked = likeBtn.classList.contains('liked');
        likeBtn.disabled = true;
        
        // Optimistik UI güncellemesi
        const likeCount = parseInt(likeBtn.querySelector('.like-count').textContent || '0');
        updateBlogCardLikeDisplay(postId, !isLiked, isLiked ? likeCount - 1 : likeCount + 1);
        
        if (isLiked) {
            // Remove like
            const { error } = await window.supabaseClient
                .from('user_favorites')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', user.id)
                .eq('type', 'like');
            
            if (error) {
                console.error('❌ Error removing like:', error);
                // UI'ı geri al
                updateBlogCardLikeDisplay(postId, true, likeCount);
            }
        } else {
            // Add like
            const { error } = await window.supabaseClient
                .from('user_favorites')
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    type: 'like'
                });
            
            if (error) {
                console.error('❌ Error adding like:', error);
                // UI'ı geri al
                updateBlogCardLikeDisplay(postId, false, likeCount);
            }
        }
        
        likeBtn.disabled = false;
        
    } catch (error) {
        console.error('❌ Error toggling like:', error);
    }
};

// Update like display for blog card
const updateBlogCardLikeDisplay = (postId, isLiked, likeCount) => {
    const likeBtn = document.querySelector(`[data-post-id="${postId}"]`);
    if (!likeBtn) return;
    
    // Beğeni durumunu güncelle
    if (isLiked) {
        likeBtn.classList.add('liked');
    } else {
        likeBtn.classList.remove('liked');
    }
    
    // Beğeni sayısını güncelle (eğer belirtilmişse)
    if (likeCount !== null && likeCount !== undefined) {
        const likeCountEl = likeBtn.querySelector('.like-count');
        if (likeCountEl) {
            likeCountEl.textContent = likeCount;
        }
    }
};

// Calculate reading time for content
const calculateReadTime = (content) => {
    try {
        if (!content) return 1;
        
        // İçerik bir string değilse dönüştürmeyi dene
        const contentText = typeof content === 'string' ? content : String(content);
        
        const wordsPerMinute = 200;
        const wordCount = contentText.split(/\s+/).length;
        const readTime = Math.ceil(wordCount / wordsPerMinute);
        
        return Math.max(1, readTime);
    } catch (error) {
        console.error('❌ Error calculating read time:', error);
        return 1;
    }
}; 