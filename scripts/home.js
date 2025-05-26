// Homepage specific JavaScript

// Sample blog posts data (in a real app, this would come from an API)
const blogPosts = [
    {
        id: 1,
        title: "The Art of Minimalist Design",
        excerpt: "Exploring the principles of minimalism in modern web design and how less can truly be more when creating user experiences.",
        category: "Design",
        author: "Sarah Chen",
        date: "2024-01-15",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&h=600&fit=crop"
    },
    {
        id: 2,
        title: "Building Sustainable Web Applications",
        excerpt: "Learn how to create eco-friendly web applications that minimize carbon footprint while maintaining high performance.",
        category: "Technology",
        author: "Alex Rivera",
        date: "2024-01-12",
        readTime: "8 min read",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop"
    },
    {
        id: 3,
        title: "The Future of Remote Work",
        excerpt: "Insights into how remote work is reshaping the modern workplace and what it means for the future of collaboration.",
        category: "Business",
        author: "Maya Patel",
        date: "2024-01-10",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
    }
];

// Get default category image based on category
const getCategoryImage = (category) => {
    const categoryImages = {
        'technology': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
        'lifestyle': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop',
        'travel': 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&h=600&fit=crop',
        'food': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop',
        'health': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop',
        'business': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
        'education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
        'entertainment': 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
        'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop'
    };
    
    return categoryImages[category?.toLowerCase()] || 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&h=600&fit=crop';
};

// Load featured posts
const loadFeaturedPosts = async () => {
    const featuredGrid = document.getElementById('featuredPosts');
    if (!featuredGrid) return;
    
    // Clear loading state
    featuredGrid.innerHTML = '';
    
    // Show loading skeleton
    featuredGrid.innerHTML = `
        <div class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton-category"></div>
                <div class="skeleton-title"></div>
                <div class="skeleton-excerpt"></div>
                <div class="skeleton-meta"></div>
            </div>
        </div>
        <div class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton-category"></div>
                <div class="skeleton-title"></div>
                <div class="skeleton-excerpt"></div>
                <div class="skeleton-meta"></div>
            </div>
        </div>
        <div class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton-category"></div>
                <div class="skeleton-title"></div>
                <div class="skeleton-excerpt"></div>
                <div class="skeleton-meta"></div>
            </div>
        </div>
    `;
    
    try {
        // Check if Supabase client is initialized
        if (!window.supabaseClient) {
            console.log('⏳ Waiting for Supabase...');
            setTimeout(loadFeaturedPosts, 1000);
            return;
        }
        
        // Fetch most liked posts from Supabase
        const { data: posts, error } = await window.supabaseClient
            .from('posts')
            .select('id, title, excerpt, content, category, author_name, image_url, created_at, likes_count')
            .eq('status', 'published')
            .order('likes_count', { ascending: false })
            .limit(3);
            
        if (error) {
            console.error('❌ Error loading most liked posts:', error);
            // Fallback to sample data if there's an error
            loadSampleFeaturedPosts(featuredGrid);
            return;
        }
        
        // Clear skeleton loading
        featuredGrid.innerHTML = '';
        
        if (posts && posts.length > 0) {
            // Create and append blog cards for the real data
            posts.forEach((post, index) => {
                // Format the post data
                const formattedPost = {
                    id: post.id,
                    title: post.title,
                    excerpt: post.excerpt || 
                            (post.content && post.content.length > 150 ? 
                            post.content.substring(0, 150) + '...' : 
                            'Content not available...'),
                    category: post.category,
                    author: post.author_name,
                    date: new Date(post.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    }),
                    readTime: post.content ? 
                             Math.max(1, Math.ceil(post.content.split(' ').length / 200)) + ' min read' :
                             '1 min read',
                    image: post.image_url || getCategoryImage(post.category),
                    likes_count: post.likes_count || 0
                };
                
                const blogCard = createBlogCard(formattedPost);
                blogCard.style.opacity = '0';
                blogCard.style.transform = 'translateY(20px)';
                featuredGrid.appendChild(blogCard);
                
                // Animate cards in sequence
                setTimeout(() => {
                    blogCard.style.transition = 'all 0.6s ease';
                    blogCard.style.opacity = '1';
                    blogCard.style.transform = 'translateY(0)';
                }, index * 100);
            });
        } else {
            console.log('📝 No published posts found, using sample data');
            loadSampleFeaturedPosts(featuredGrid);
        }
    } catch (error) {
        console.error('❌ Error loading posts:', error);
        loadSampleFeaturedPosts(featuredGrid);
    }
};

// Fallback to sample data if needed
const loadSampleFeaturedPosts = (featuredGrid) => {
    featuredGrid.innerHTML = '';
    
    // Create and append blog cards
    blogPosts.forEach((post, index) => {
        const blogCard = createBlogCard(post);
        blogCard.style.opacity = '0';
        blogCard.style.transform = 'translateY(20px)';
        featuredGrid.appendChild(blogCard);
        
        // Animate cards in sequence
        setTimeout(() => {
            blogCard.style.transition = 'all 0.6s ease';
            blogCard.style.opacity = '1';
            blogCard.style.transform = 'translateY(0)';
        }, index * 100);
    });
};

// Create blog card element
const createBlogCard = (post) => {
    const card = document.createElement('article');
    card.className = 'blog-card';
    card.innerHTML = `
        <img 
            class="blog-card-image" 
            src="${post.image}" 
            alt="${post.title}"
            loading="lazy"
        >
        <div class="blog-card-content">
            <span class="blog-card-category">${post.category}</span>
            <h3 class="blog-card-title">${post.title}</h3>
            <p class="blog-card-excerpt">${post.excerpt}</p>
            <div class="blog-card-meta">
                <span>${post.author}</span>
                <span>${post.readTime}</span>
            </div>
        </div>
    `;
    
    // Add click event
    card.addEventListener('click', () => {
        // In a real app, this would navigate to the blog post
        window.location.href = `blogs.html#post-${post.id}`;
    });
    
    // Add hover effect
    card.addEventListener('mouseenter', () => {
        card.style.cursor = 'pointer';
    });
    
    return card;
};

// Animate stats on scroll
const animateStats = () => {
    const stats = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const target = parseInt(stat.textContent);
                animateNumber(stat, target);
                observer.unobserve(stat);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
};

// Animate number counting
const animateNumber = (element, target) => {
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const updateNumber = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current) + '+';
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = target + '+';
        }
    };
    
    updateNumber();
};

// Hero button hover effect
const setupHeroButton = () => {
    const heroButton = document.querySelector('.hero-button');
    if (!heroButton) return;
    
    // Wrap text in span for animation
    const buttonText = heroButton.textContent;
    heroButton.innerHTML = `<span>${buttonText}</span>`;
};

// Parallax effect for hero decoration
const setupParallax = () => {
    const decoration = document.querySelector('.hero-decoration');
    if (!decoration) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        decoration.style.transform = `translate(${rate}px, -50%) rotate(${scrolled * 0.1}deg)`;
    });
};

// Initialize homepage
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedPosts();
    animateStats();
    setupHeroButton();
    setupParallax();
    
    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.8s ease';
        observer.observe(section);
    });
}); 