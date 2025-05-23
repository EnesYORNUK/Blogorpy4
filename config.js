/**
 * EnsonBlog Configuration
 * 
 * This file contains all the configurable settings for your blog.
 * Modify these values to customize your blog's behavior and appearance.
 */

const BLOG_CONFIG = {
    // =========================================
    // SITE INFORMATION
    // =========================================
    site: {
        name: 'Blogorpy',
        tagline: 'Modern Blogging Platform',
        description: 'Discover amazing stories, share your thoughts, and connect with writers worldwide',
        url: 'https://blogorpy4.netlify.app/',
        logo: '/assets/logo.png', // Optional: path to your logo
        favicon: '/assets/favicon.ico' // Optional: path to your favicon
    },

    // =========================================
    // SUPABASE CONFIGURATION
    // =========================================
    supabase: {
        url: 'https://bczjcjnanweoslrsbbfp.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjempjam5hbndlb3NscnNiYmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjI4MzAsImV4cCI6MjA2MzU5ODgzMH0.8gg3ck6xqpllatRy54_0Psyv2pv4oqf_-ZSm0Nsij40',
        
        // Storage bucket names
        buckets: {
            images: 'images',
            avatars: 'avatars',
            banners: 'banners',
            documents: 'documents'
        }
    },

    // =========================================
    // CONTENT SETTINGS
    // =========================================
    content: {
        // Post settings
        postsPerPage: 10,
        excerptLength: 150,
        maxPostTitleLength: 100,
        
        // Comment settings
        maxCommentLength: 1000,
        allowNestedComments: true,
        maxCommentNesting: 3,
        
        // File upload settings
        maxImageSize: 5 * 1024 * 1024, // 5MB in bytes
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        
        // Rich text editor settings
        allowedHtmlTags: [
            'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'code', 'pre'
        ]
    },

    // =========================================
    // AUTHENTICATION SETTINGS
    // =========================================
    auth: {
        // Password requirements
        minPasswordLength: 6,
        requireEmailConfirmation: true,
        
        // Registration settings
        allowPublicRegistration: true,
        requireUsernameOnSignup: true,
        
        // Social auth providers (configure in Supabase dashboard)
        providers: {
            google: false,
            github: false,
            twitter: false,
            facebook: false
        }
    },

    // =========================================
    // USER INTERFACE SETTINGS
    // =========================================
    ui: {
        // Theme settings
        theme: {
            primaryColor: '#8B4513',
            secondaryColor: '#5D2F0A',
            accentColor: '#D2B48C',
            backgroundColor: '#F5F5DC',
            textColor: '#333333'
        },
        
        // Animation settings
        animations: {
            enableGSAP: true,
            enableParallax: true,
            enableFloatingCards: true,
            transitionDuration: 300 // milliseconds
        },
        
        // Layout settings
        layout: {
            showHeroSection: true,
            showSearchBar: true,
            showFooter: true,
            stickyNavbar: true
        },
        
        // Post display settings
        posts: {
            showFeaturedImage: true,
            showAuthorAvatar: true,
            showPostStats: true,
            showTags: true,
            showReadTime: true
        }
    },

    // =========================================
    // FEATURE FLAGS
    // =========================================
    features: {
        // Core features
        comments: true,
        likes: true,
        savedPosts: true,
        userProfiles: true,
        
        // Advanced features
        notifications: true,
        realTimeUpdates: true,
        searchFilter: true,
        tagSystem: true,
        
        // Social features
        shareButtons: true,
        followUsers: false, // Not implemented yet
        privatePosts: false, // Not implemented yet
        
        // Admin features
        moderateComments: false, // Not implemented yet
        analytics: false, // Not implemented yet
        
        // Application features
        enableComments: true,
        enableLikes: true,
        enableSavedPosts: true,
        enableTags: true,
        enableSearch: true,
        enableDarkMode: false, // Future feature
        enableNotifications: false, // Future feature
        enableSocialLogin: false // Future feature
    },

    // =========================================
    // SEARCH SETTINGS
    // =========================================
    search: {
        debounceDelay: 300, // milliseconds
        minSearchLength: 2,
        maxResults: 50,
        searchFields: ['title', 'content', 'excerpt'],
        enableHighlighting: true
    },

    // =========================================
    // PERFORMANCE SETTINGS
    // =========================================
    performance: {
        // Image optimization
        lazyLoadImages: true,
        imageQuality: 80, // 1-100
        generateThumbnails: true,
        
        // Caching
        cacheTimeout: 5 * 60 * 1000, // 5 minutes in milliseconds
        
        // Pagination
        infiniteScroll: false, // Use pagination instead
        preloadNextPage: true
    },

    // =========================================
    // SOCIAL SHARING
    // =========================================
    socialSharing: {
        platforms: ['twitter', 'facebook', 'linkedin', 'email', 'copy'],
        showOnPosts: true,
        showOnHomepage: false
    },

    // =========================================
    // SEO SETTINGS
    // =========================================
    seo: {
        // Meta defaults
        defaultTitle: 'Blogorpy - Modern Blogging Platform',
        titleSeparator: ' | ',
        defaultDescription: 'Discover amazing stories, share your thoughts, and connect with writers worldwide',
        defaultKeywords: 'blog, writing, stories, community',
        
        // Open Graph defaults
        ogImage: '/assets/og-image.jpg',
        twitterCard: 'summary_large_image',
        
        // Application settings
        appDescription: 'A modern blogging platform with beautiful design and smooth animations.',
        appKeywords: 'blog, blogging, modern, clean, responsive'
    },

    // =========================================
    // NOTIFICATION SETTINGS
    // =========================================
    notifications: {
        // Toast notification settings
        defaultDuration: 4000, // milliseconds
        maxVisible: 3,
        position: 'top-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
        
        // Auto-dismiss settings
        successDuration: 3000,
        errorDuration: 6000,
        warningDuration: 5000
    },

    // =========================================
    // DEVELOPMENT SETTINGS
    // =========================================
    development: {
        // Debug settings
        enableConsoleLogging: false,
        enableErrorReporting: true,
        showLoadingStates: true,
        
        // Demo data
        loadSampleData: false,
        samplePostsCount: 10,
        
        // Application settings
        appName: 'EnsonBlog',
        appVersion: '1.0.0',
        appDescription: 'Modern Blogging Platform',
        appKeywords: 'blog, blogging, modern, clean, responsive',
        
        // API settings
        apiTimeouts: {
            default: 10000, // 10 seconds
            upload: 30000,  // 30 seconds
            longRunning: 60000 // 1 minute
        },
        apiRetryAttempts: 3,
        apiRetryDelay: 1000 // 1 second
    },

    // =========================================
    // APPLICATION SETTINGS
    // =========================================
    app: {
        name: 'EnsonBlog',
        description: 'Modern Blogging Platform',
        version: '1.0.0',
        
        // Pagination settings
        commentsPerPage: 20,
        
        // Content settings
        maxExcerptLength: 150,
        maxImageSize: 5 * 1024 * 1024, // 5MB in bytes
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        
        // UI settings
        animationDuration: 300,
        toastDuration: 3000,
        
        // SEO settings
        defaultMetaDescription: 'A modern blogging platform with beautiful design and smooth animations.',
        defaultMetaKeywords: 'blog, blogging, modern, clean, responsive',
        
        // Social media settings (optional)
        social: {
            twitter: '',
            facebook: '',
            instagram: '',
            linkedin: ''
        }
    },

    // =========================================
    // THEME CONFIGURATION
    // =========================================
    theme: {
        primaryColor: '#8B4513',
        secondaryColor: '#5D2F0A',
        accentColor: '#D2B48C',
        backgroundColor: '#F5F5DC',
        textColor: '#333333'
    },

    // =========================================
    // API SETTINGS
    // =========================================
    api: {
        timeouts: {
            default: 10000, // 10 seconds
            upload: 30000,  // 30 seconds
            longRunning: 60000 // 1 minute
        },
        retryAttempts: 3,
        retryDelay: 1000 // 1 second
    }
};

// =========================================
// ALTERNATIVE COLOR SCHEMES
// =========================================
const COLOR_SCHEMES = {
    'warm-brown': {
        primary: '#8B4513',
        dark: '#5D2F0A',
        light: '#D2B48C',
        cream: '#F5F5DC',
        accent: '#CD853F'
    },
    'rich-brown': {
        primary: '#964B00',
        dark: '#4A2C17',
        light: '#C8B99C',
        cream: '#F7F3E9',
        accent: '#D2691E'
    },
    'light-brown': {
        primary: '#A0522D',
        dark: '#654321',
        light: '#DEB887',
        cream: '#F8F4E6',
        accent: '#E9967A'
    }
};

// =========================================
// UTILITY FUNCTIONS
// =========================================

/**
 * Get configuration value with fallback
 * @param {string} path - Dot notation path to config value
 * @param {any} fallback - Fallback value if path doesn't exist
 * @returns {any} Configuration value or fallback
 */
function getConfig(path, fallback = null) {
    const keys = path.split('.');
    let value = BLOG_CONFIG;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return fallback;
        }
    }
    
    return value;
}

/**
 * Apply custom color scheme to CSS variables
 * @param {string} scheme - Color scheme name or 'custom'
 */
function applyColorScheme(scheme = 'warm-brown') {
    const root = document.documentElement;
    let colors;
    
    if (scheme === 'custom') {
        colors = BLOG_CONFIG.ui.theme.customColors;
    } else {
        colors = COLOR_SCHEMES[scheme] || COLOR_SCHEMES['warm-brown'];
    }
    
    if (colors.primary) root.style.setProperty('--primary-brown', colors.primary);
    if (colors.dark) root.style.setProperty('--dark-brown', colors.dark);
    if (colors.light) root.style.setProperty('--light-brown', colors.light);
    if (colors.cream) root.style.setProperty('--cream', colors.cream);
    if (colors.accent) root.style.setProperty('--accent-orange', colors.accent);
}

/**
 * Initialize configuration
 */
function initializeConfig() {
    try {
        // Apply color scheme
        applyColorScheme();
        
        // Set favicon if specified
        if (BLOG_CONFIG.site.favicon) {
            const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = BLOG_CONFIG.site.favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        
        // Update page title
        document.title = BLOG_CONFIG.seo.defaultTitle || BLOG_CONFIG.site.name;
        
        // Set meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', BLOG_CONFIG.seo.defaultDescription || BLOG_CONFIG.site.description);
        }
        
        console.log('Blog configuration initialized successfully');
        
    } catch (error) {
        console.error('Error initializing configuration:', error);
    }
}

// SupabaseConfig uyumluluk katmanı
window.SupabaseConfig = {
    client: null, // supabaseClient ile doldurulacak
    sanitizeHTML: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    generateExcerpt: function(content, maxLength = 150) {
        const textContent = content.replace(/<[^>]*>/g, '');
        if (textContent.length <= maxLength) {
            return textContent;
        }
        return textContent.substring(0, maxLength).trim() + '...';
    },
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    formatRelativeTime: function(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };
        
        for (const [unit, seconds] of Object.entries(intervals)) {
            const interval = Math.floor(diffInSeconds / seconds);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }
        
        return 'Just now';
    },
    handleError: function(error, operation = 'Operation') {
        console.error(`${operation} failed:`, error);
        return error.message || 'An unexpected error occurred. Please try again.';
    },
    getCurrentUser: function() {
        return supabaseClient?.auth?.getUser();
    },
    getUserProfile: function(userId) {
        return supabaseClient?.from('profiles')?.select('*')?.eq('id', userId)?.single();
    }
};

// Sayfa yüklendiğinde yapılandırmayı başlat
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeConfig);
    } else {
        initializeConfig();
    }
}

// Global erişim için
if (typeof window !== 'undefined') {
    window.BLOG_CONFIG = BLOG_CONFIG;
    window.getConfig = getConfig;
    window.applyColorScheme = applyColorScheme;
    window.initializeConfig = initializeConfig;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BLOG_CONFIG, COLOR_SCHEMES, getConfig, applyColorScheme };
}

// Make config globally available
window.BLOG_CONFIG = BLOG_CONFIG;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BLOG_CONFIG;
} 