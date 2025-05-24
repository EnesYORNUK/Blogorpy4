// Blog Detail JavaScript

let currentBlogId = null;
let currentBlogData = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Blog detail page loaded');
    
    // Get blog ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentBlogId = urlParams.get('id');
    
    console.log('🔍 URL parameters:', window.location.search);
    console.log('🔍 Extracted blog ID:', currentBlogId);
    console.log('🔍 All URL params:', Object.fromEntries(urlParams));
    
    if (!currentBlogId) {
        console.error('❌ No blog ID provided');
        showBlogError('Blog ID bulunamadı. URL\'de ?id=123 formatında ID bulunmuyor.');
        return;
    }
    
    console.log('📖 Loading blog with ID:', currentBlogId);
    loadBlogPost();
    setupScrollToTop();
});

// Load blog post data
const loadBlogPost = async () => {
    try {
        console.log('🔄 Starting loadBlogPost function');
        
        // Show loading state
        document.getElementById('loadingState').style.display = 'flex';
        document.getElementById('errorState').style.display = 'none';
        document.getElementById('blogContent').style.display = 'none';
        
        // Wait for Supabase to be ready
        if (!window.supabaseClient) {
            console.log('⏳ Waiting for Supabase...');
            setTimeout(loadBlogPost, 1000);
            return;
        }
        
        console.log('📡 Supabase client ready, fetching blog post...');
        console.log('🔍 Searching for post with ID:', currentBlogId, 'Type:', typeof currentBlogId);
        
        // First, let's see what posts exist in the database
        const { data: allPosts, error: listError } = await window.supabaseClient
            .from('posts')
            .select('id, title, status')
            .limit(10);
            
        if (listError) {
            console.error('❌ Error listing posts:', listError);
        } else {
            console.log('📋 Available posts in database:', allPosts);
        }
        
        // Try to fetch blog post from Supabase with the exact ID
        const { data, error } = await window.supabaseClient
            .from('posts')
            .select('*')
            .eq('id', currentBlogId)
            .eq('status', 'published')
            .single();
        
        console.log('📡 Database query result:', { data, error });
        
        if (error) {
            console.error('❌ Database error:', error);
            
            if (error.code === 'PGRST116') {
                // No rows found - let's try without status filter
                console.log('🔍 Trying without status filter...');
                const { data: dataWithoutStatus, error: errorWithoutStatus } = await window.supabaseClient
                    .from('posts')
                    .select('*')
                    .eq('id', currentBlogId)
                    .single();
                    
                console.log('📡 Query without status filter:', { dataWithoutStatus, errorWithoutStatus });
                
                if (errorWithoutStatus) {
                    showBlogError(`Blog yazısı bulunamadı. ID: ${currentBlogId} veritabanında mevcut değil.`);
                } else {
                    showBlogError(`Blog yazısı taslak durumda veya yayınlanmamış. Status: ${dataWithoutStatus.status}`);
                }
            } else {
                showBlogError('Blog yüklenirken bir hata oluştu: ' + error.message);
            }
            return;
        }
        
        if (!data) {
            console.error('❌ No blog post found');
            showBlogError('Blog yazısı bulunamadı');
            return;
        }
        
        console.log('✅ Blog post loaded successfully:', data);
        currentBlogData = data;
        
        // Hide loading and show content
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('blogContent').style.display = 'block';
        
        // Populate blog data
        populateBlogData(data);
        
        // Load related posts
        loadRelatedPosts(data.category, data.id);
        
    } catch (error) {
        console.error('❌ Error loading blog post:', error);
        showBlogError('Blog yüklenirken beklenmeyen bir hata oluştu: ' + error.message);
    }
};

// Populate blog data in the UI
const populateBlogData = (blog) => {
    try {
        console.log('🎨 Populating blog data in UI...');
        
        // Update page title
        document.title = `${blog.title} - Blogorpy`;
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            const excerpt = blog.excerpt || 
                           (blog.content.substring(0, 150) + '...');
            metaDescription.setAttribute('content', excerpt);
        }
        
        // Breadcrumb
        document.getElementById('breadcrumbTitle').textContent = blog.title;
        
        // Blog header
        document.getElementById('blogCategory').textContent = formatCategory(blog.category);
        document.getElementById('blogDate').textContent = formatDate(blog.created_at);
        document.getElementById('blogTitle').textContent = blog.title;
        
        // Blog excerpt (if available)
        if (blog.excerpt && blog.excerpt.trim()) {
            const excerptContainer = document.getElementById('blogExcerpt');
            const excerptText = document.getElementById('blogExcerptText');
            excerptText.textContent = blog.excerpt;
            excerptContainer.style.display = 'block';
        }
        
        // Author info
        const authorName = blog.author_name || 'Anonymous';
        document.getElementById('authorName').textContent = authorName;
        document.getElementById('authorInitials').textContent = getInitials(authorName);
        
        // Calculate read time
        const readTime = calculateReadTime(blog.content);
        document.getElementById('readTime').textContent = `${readTime} dk okuma`;
        
        // Featured image
        if (blog.image_url) {
            const featuredImageContainer = document.getElementById('featuredImageContainer');
            const featuredImage = document.getElementById('featuredImage');
            featuredImage.src = blog.image_url;
            featuredImage.alt = blog.title;
            featuredImageContainer.style.display = 'block';
        }
        
        // Blog content
        const blogContentEl = document.getElementById('blogContentText');
        blogContentEl.innerHTML = formatBlogContent(blog.content);
        
        // Tags
        populateTags(blog.tags || []);
        
        console.log('✅ Blog data populated successfully');
        
    } catch (error) {
        console.error('❌ Error populating blog data:', error);
    }
};

// Format blog content (convert line breaks to paragraphs)
const formatBlogContent = (content) => {
    if (!content) return '';
    
    // Split by double line breaks for paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map(paragraph => {
        // Convert single line breaks to <br>
        const formattedParagraph = paragraph.replace(/\n/g, '<br>');
        return `<p>${formattedParagraph}</p>`;
    }).join('');
};

// Populate tags
const populateTags = (tags) => {
    const tagsContainer = document.getElementById('blogTags');
    
    if (!tags || tags.length === 0) {
        tagsContainer.style.display = 'none';
        return;
    }
    
    tagsContainer.innerHTML = tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');
};

// Load related posts
const loadRelatedPosts = async (category, currentPostId) => {
    try {
        console.log('🔗 Loading related posts...');
        
        const { data, error } = await window.supabaseClient
            .from('posts')
            .select('id, title, content, created_at, author_name')
            .eq('category', category)
            .eq('status', 'published')
            .neq('id', currentPostId)
            .limit(3);
        
        if (error) {
            console.error('❌ Error loading related posts:', error);
            return;
        }
        
        if (data && data.length > 0) {
            populateRelatedPosts(data);
        } else {
            // Hide related posts section if no related posts
            document.getElementById('relatedPosts').style.display = 'none';
        }
        
    } catch (error) {
        console.error('❌ Error loading related posts:', error);
    }
};

// Populate related posts
const populateRelatedPosts = (posts) => {
    const grid = document.getElementById('relatedPostsGrid');
    
    grid.innerHTML = posts.map(post => {
        const excerpt = post.content.substring(0, 120) + '...';
        const formattedDate = formatDate(post.created_at);
        
        return `
            <a href="blog-detail.html?id=${post.id}" class="related-post-card">
                <h4 class="related-post-title">${post.title}</h4>
                <p class="related-post-excerpt">${excerpt}</p>
                <div class="related-post-meta">
                    ${post.author_name} • ${formattedDate}
                </div>
            </a>
        `;
    }).join('');
};

// Utility functions
const formatCategory = (category) => {
    const categoryMap = {
        'technology': 'Technology',
        'lifestyle': 'Lifestyle',
        'travel': 'Travel',
        'food': 'Food',
        'health': 'Health',
        'education': 'Education',
        'business': 'Business',
        'entertainment': 'Entertainment',
        'sports': 'Sports',
        'other': 'Other'
    };
    
    return categoryMap[category] || category;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const getInitials = (name) => {
    if (!name) return 'A';
    
    const words = name.trim().split(' ');
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    } else {
        return words[0][0].toUpperCase();
    }
};

const calculateReadTime = (content) => {
    if (!content) return 1;
    
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    
    return Math.max(1, readTime);
};

// Show error state
const showBlogError = (message) => {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('blogContent').style.display = 'none';
    document.getElementById('errorState').style.display = 'flex';
    
    const errorContent = document.querySelector('.error-content p');
    if (errorContent) {
        errorContent.textContent = message;
    }
    
    // Also show toast notification if available
    if (window.toast) {
        window.toast.error(message, 'Blog Hatası');
    }
};

// Back to top functionality
const setupScrollToTop = () => {
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
};

// Scroll to top function
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

// Share functions
const shareOnTwitter = () => {
    if (!currentBlogData) return;
    
    const text = `${currentBlogData.title} - Blogorpy'de okudum`;
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    
    window.open(twitterUrl, '_blank');
};

const shareOnLinkedIn = () => {
    if (!currentBlogData) return;
    
    const url = window.location.href;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    
    window.open(linkedInUrl, '_blank');
};

const copyToClipboard = async () => {
    try {
        const url = window.location.href;
        await navigator.clipboard.writeText(url);
        
        if (window.toast) {
            window.toast.success('Link kopyalandı!', 'Başarılı');
        } else {
            alert('Link kopyalandı!');
        }
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        
        if (window.toast) {
            window.toast.error('Link kopyalanamadı', 'Hata');
        } else {
            alert('Link kopyalanamadı');
        }
    }
}; 