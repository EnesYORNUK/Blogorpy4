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
 * Initialize configuration on page load
 */
function initializeConfig() {
    // Apply color scheme
    const colorScheme = getConfig('ui.theme.colorScheme', 'warm-brown');
    applyColorScheme(colorScheme);
    
    // Set site title
    const siteName = getConfig('site.name', 'Blogorpy');
    document.title = siteName;
    
    // Set favicon if specified
    const favicon = getConfig('site.favicon');
    if (favicon) {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = favicon;
        document.head.appendChild(link);
    }
    
    // Update meta description
    const description = getConfig('site.description');
    if (description) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = description;
    }
}

// Auto-initialize when DOM is loaded
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeConfig);
    } else {
        initializeConfig();
    }
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