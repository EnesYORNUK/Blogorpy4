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

// Load featured posts
const loadFeaturedPosts = () => {
    const featuredGrid = document.getElementById('featuredPosts');
    if (!featuredGrid) return;
    
    // Clear loading state
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