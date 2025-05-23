/**
 * Supabase Configuration and Initialization
 * 
 * This file sets up the connection to Supabase and provides
 * utility functions for database operations.
 */

// Supabase Configuration
// Get configuration from BLOG_CONFIG if available, otherwise use fallback values
const getSupabaseConfig = () => {
    if (typeof BLOG_CONFIG !== 'undefined' && BLOG_CONFIG.supabase) {
        return {
            url: BLOG_CONFIG.supabase.url,
            anonKey: BLOG_CONFIG.supabase.anonKey
        };
    }
    
    // Fallback configuration - replace these with your actual Supabase project credentials
    return {
        url: 'https://your-project-url.supabase.co',
        anonKey: 'your-anon-key-here'
    };
};

const supabaseConfig = getSupabaseConfig();
const SUPABASE_URL = supabaseConfig.url;
const SUPABASE_ANON_KEY = supabaseConfig.anonKey;

// Initialize Supabase clientconst supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);// SupabaseConfig uyumluluğu için client'ı ataif (typeof window !== 'undefined' && window.SupabaseConfig) {    window.SupabaseConfig.client = supabaseClient;}

/**
 * Database Table Schemas
 * 
 * The following tables should be created in your Supabase database:
 * 
 * 1. profiles (extends auth.users)
 * 2. posts
 * 3. comments
 * 4. likes
 * 5. saved_posts
 * 6. tags
 * 7. post_tags
 */

/**
 * Supabase Error Handler
 * @param {Object} error - Supabase error object
 * @param {string} operation - Description of the operation that failed
 */
function handleSupabaseError(error, operation = 'Operation') {
    console.error(`${operation} failed:`, error);
    
    // User-friendly error messages
    const errorMessages = {
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'PGRST301': 'Unauthorized access.',
        'PGRST116': 'The requested resource was not found.',
        '23505': 'This item already exists.',
        '23503': 'Cannot delete item because it is referenced by other data.'
    };
    
    const userMessage = errorMessages[error.code] || 
                       errorMessages[error.error_description] ||
                       error.message || 
                       'An unexpected error occurred. Please try again.';
    
    return userMessage;
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is logged in
 */
function isAuthenticated() {
    const user = supabaseClient.auth.getUser();
    return user && user.data && user.data.user;
}

/**
 * Get current user
 * @returns {Object|null} - Current user object or null
 */
async function getCurrentUser() {
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
 * Get user profile with additional data
 * @param {string} userId - User ID
 * @returns {Object|null} - User profile object or null
 */
async function getUserProfile(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
}

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string} dateString - ISO date string
 * @returns {string} - Relative time string
 */
function formatRelativeTime(dateString) {
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
}

/**
 * Sanitize HTML content to prevent XSS
 * @param {string} html - HTML string
 * @returns {string} - Sanitized HTML
 */
function sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

/**
 * Generate excerpt from content
 * @param {string} content - Full content
 * @param {number} maxLength - Maximum length of excerpt
 * @returns {string} - Content excerpt
 */
function generateExcerpt(content, maxLength = 150) {
    // Remove HTML tags
    const textContent = content.replace(/<[^>]*>/g, '');
    
    if (textContent.length <= maxLength) {
        return textContent;
    }
    
    return textContent.substring(0, maxLength).trim() + '...';
}

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Upload file to Supabase Storage
 * @param {File} file - File to upload
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in bucket
 * @returns {Object} - Upload result
 */
async function uploadFile(file, bucket = 'images', path = '') {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = path ? `${path}/${fileName}` : fileName;
        
        const { data, error } = await supabaseClient.storage
            .from(bucket)
            .upload(filePath, file);
        
        if (error) throw error;
        
        // Get public URL
        const { data: { publicUrl } } = supabaseClient.storage
            .from(bucket)
            .getPublicUrl(filePath);
        
        return {
            success: true,
            url: publicUrl,
            path: filePath
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        return {
            success: false,
            error: handleSupabaseError(error, 'File upload')
        };
    }
}

/**
 * Real-time subscription management
 */
class RealtimeManager {
    constructor() {
        this.subscriptions = new Map();
    }
    
    /**
     * Subscribe to table changes
     * @param {string} table - Table name
     * @param {Function} callback - Callback function
     * @param {Object} filter - Optional filter
     * @returns {string} - Subscription ID
     */
    subscribe(table, callback, filter = {}) {
        const subscriptionId = `${table}_${Date.now()}_${Math.random()}`;
        
        let subscription = supabaseClient
            .channel(`public:${table}`)
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: table,
                    ...filter
                }, 
                callback
            )
            .subscribe();
        
        this.subscriptions.set(subscriptionId, subscription);
        return subscriptionId;
    }
    
    /**
     * Unsubscribe from table changes
     * @param {string} subscriptionId - Subscription ID to remove
     */
    unsubscribe(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            supabaseClient.removeChannel(subscription);
            this.subscriptions.delete(subscriptionId);
        }
    }
    
    /**
     * Unsubscribe from all subscriptions
     */
    unsubscribeAll() {
        this.subscriptions.forEach((subscription) => {
            supabaseClient.removeChannel(subscription);
        });
        this.subscriptions.clear();
    }
}

// Create global realtime manager instance
const realtimeManager = new RealtimeManager();

/**
 * Pagination helper
 * @param {number} page - Current page (1-based)
 * @param {number} limit - Items per page
 * @returns {Object} - Pagination parameters
 */
function getPaginationParams(page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    return { from, to, limit };
}

/**
 * Search helper for full-text search
 * @param {string} query - Search query
 * @param {Array} columns - Columns to search in
 * @returns {string} - Formatted search query
 */
function formatSearchQuery(query, columns = ['title', 'content']) {
    // Basic text search - can be enhanced with Supabase's full-text search
    const searchTerm = query.trim().toLowerCase();
    return searchTerm;
}

// Export all functions and objects for use in other scripts
window.SupabaseConfig = {
    client: supabaseClient,
    handleError: handleSupabaseError,
    isAuthenticated,
    getCurrentUser,
    getUserProfile,
    formatDate,
    formatRelativeTime,
    sanitizeHTML,
    generateExcerpt,
    debounce,
    uploadFile,
    realtimeManager,
    getPaginationParams,
    formatSearchQuery
};

// Listen for auth state changes
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    
    // Dispatch custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('authStateChange', {
        detail: { event, session }
    }));
});

console.log('Supabase configuration loaded successfully'); 